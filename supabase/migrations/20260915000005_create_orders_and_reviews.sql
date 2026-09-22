-- =============================================================================
-- Migration 5: Orders, Order Items, and Reviews
-- =============================================================================

-- 1. Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique, -- e.g. OD-2026-XXXX
  customer_id uuid references public.customers(id) on delete set null,
  guest_email text,
  guest_name text,
  guest_phone text,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  currency text not null default 'NGN',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount_total numeric(12,2) not null default 0 check (discount_total >= 0),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  total numeric(12,2) not null check (total >= 0),
  discount_id uuid references public.discounts(id) on delete set null,
  delivery_method text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  billing_address jsonb default '{}'::jsonb,
  payment_gateway text default 'paystack', -- 'paystack'
  payment_reference text unique,
  additional_instructions text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_payment_ref on public.orders(payment_reference);

create trigger handle_updated_at_orders
  before update on public.orders
  for each row execute function public.set_updated_at();

-- 2. Order Items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  variant_title text not null, -- e.g. "Size M / Olive"
  sku text,
  price_at_purchase numeric(12,2) not null check (price_at_purchase >= 0),
  quantity int not null check (quantity > 0),
  total numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_variant_id on public.order_items(variant_id);

-- 3. Product Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text not null,
  verified_purchase boolean not null default false,
  is_approved boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_customer_product_review unique (customer_id, product_id)
);

create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_customer_id on public.reviews(customer_id);

create trigger handle_updated_at_reviews
  before update on public.reviews
  for each row execute function public.set_updated_at();
