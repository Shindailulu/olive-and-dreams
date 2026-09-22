-- =============================================================================
-- Migration 6: Inventory Logs and Atomic Stock Management Functions
-- =============================================================================

-- 1. Inventory Logs Table (Audit trail of every stock change)
create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  change int not null, -- negative for sales, positive for restock/returns
  balance_after int not null,
  reason text not null, -- 'order_placed', 'order_cancelled', 'manual_adjustment', 'restock'
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_inventory_logs_variant on public.inventory_logs(variant_id);
create index if not exists idx_inventory_logs_order on public.inventory_logs(order_id);

-- 2. Atomic Stored Procedure to Decrement Inventory
-- Uses SELECT ... FOR UPDATE to lock variant rows and eliminate race conditions/overselling
create or replace function public.decrement_order_inventory(p_order_id uuid)
returns void as $$
declare
  item record;
  current_stock int;
  new_stock int;
begin
  -- Loop through each item in the order that references a variant
  for item in
    select oi.variant_id, oi.quantity, oi.product_name, oi.variant_title
    from public.order_items oi
    where oi.order_id = p_order_id and oi.variant_id is not null
  loop
    -- Acquire exclusive row lock on product_variant
    select stock_quantity into current_stock
    from public.product_variants
    where id = item.variant_id
    for update;

    if not found then
      raise exception 'Variant % for % not found', item.variant_id, item.product_name;
    end if;

    if current_stock < item.quantity then
      raise exception 'Insufficient stock for % (%): available %, requested %',
        item.product_name, item.variant_title, current_stock, item.quantity;
    end if;

    new_stock := current_stock - item.quantity;

    -- Update variant stock atomically
    update public.product_variants
    set stock_quantity = new_stock
    where id = item.variant_id;

    -- Record in audit log
    insert into public.inventory_logs (variant_id, change, balance_after, reason, order_id)
    values (item.variant_id, -item.quantity, new_stock, 'order_placed', p_order_id);
  end loop;
end;
$$ language plpgsql security definer;

-- 3. Atomic Stored Procedure to Restore Inventory
-- Used when an order is cancelled or refunded
create or replace function public.restore_order_inventory(p_order_id uuid, p_reason text default 'order_cancelled')
returns void as $$
declare
  item record;
  current_stock int;
  new_stock int;
begin
  for item in
    select oi.variant_id, oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id and oi.variant_id is not null
  loop
    select stock_quantity into current_stock
    from public.product_variants
    where id = item.variant_id
    for update;

    if found then
      new_stock := current_stock + item.quantity;
      update public.product_variants
      set stock_quantity = new_stock
      where id = item.variant_id;

      insert into public.inventory_logs (variant_id, change, balance_after, reason, order_id)
      values (item.variant_id, item.quantity, new_stock, p_reason, p_order_id);
    end if;
  end loop;
end;
$$ language plpgsql security definer;
