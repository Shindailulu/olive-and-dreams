-- =============================================================================
-- Migration 7: Row Level Security (RLS) Policies
-- =============================================================================

-- 1. Enable RLS on all tables
alter table public.admin_users enable row level security;
alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.discounts enable row level security;
alter table public.delivery_methods enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.inventory_logs enable row level security;

-- 2. Admin Users Policies
create policy "Admins can view admin_users" on public.admin_users
  for select using (public.is_admin());

-- 3. Customers Policies
create policy "Customers can view own profile" on public.customers
  for select using (auth.uid() = id or public.is_admin());

create policy "Customers can update own profile" on public.customers
  for update using (auth.uid() = id or public.is_admin());

-- 4. Customer Addresses Policies
create policy "Customers manage own addresses" on public.addresses
  for all using (auth.uid() = customer_id or public.is_admin())
  with check (auth.uid() = customer_id or public.is_admin());

-- 5. Categories Policies
create policy "Public can view categories" on public.categories
  for select using (true);

create policy "Admins can manage categories" on public.categories
  for all using (public.is_admin());

-- Product Categories Junction Policies
create policy "Public can view product_categories" on public.product_categories
  for select using (true);

create policy "Admins can manage product_categories" on public.product_categories
  for all using (public.is_admin());

-- 6. Products Policies
create policy "Public can view active products" on public.products
  for select using (status = 'active' or public.is_admin());

create policy "Admins can manage products" on public.products
  for all using (public.is_admin());

-- 7. Product Variants Policies
create policy "Public can view active product variants" on public.product_variants
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and (p.status = 'active' or public.is_admin())
    )
  );

create policy "Admins can manage product variants" on public.product_variants
  for all using (public.is_admin());

-- 8. Product Images Policies
create policy "Public can view product images" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and (p.status = 'active' or public.is_admin())
    )
  );

create policy "Admins can manage product images" on public.product_images
  for all using (public.is_admin());

-- 9. Delivery Methods Policies
create policy "Public can view enabled delivery methods" on public.delivery_methods
  for select using (enabled = true or public.is_admin());

create policy "Admins can manage delivery methods" on public.delivery_methods
  for all using (public.is_admin());

-- 10. Carts & Cart Items Policies (Logged-in or Guest session token)
create policy "Users can view and manage their own cart" on public.carts
  for all using (
    (auth.uid() is not null and customer_id = auth.uid())
    or (session_token = coalesce(nullif(current_setting('request.headers', true)::json->>'x-cart-session', ''), ''))
    or public.is_admin()
  )
  with check (
    (auth.uid() is not null and customer_id = auth.uid())
    or (session_token = coalesce(nullif(current_setting('request.headers', true)::json->>'x-cart-session', ''), ''))
    or public.is_admin()
  );

create policy "Users can view and manage their cart items" on public.cart_items
  for all using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (
          (auth.uid() is not null and c.customer_id = auth.uid())
          or (c.session_token = coalesce(nullif(current_setting('request.headers', true)::json->>'x-cart-session', ''), ''))
          or public.is_admin()
        )
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (
          (auth.uid() is not null and c.customer_id = auth.uid())
          or (c.session_token = coalesce(nullif(current_setting('request.headers', true)::json->>'x-cart-session', ''), ''))
          or public.is_admin()
        )
    )
  );

-- 11. Discounts Policies
create policy "Public can view active discounts" on public.discounts
  for select using (is_active = true or public.is_admin());

create policy "Admins can manage discounts" on public.discounts
  for all using (public.is_admin());

-- 12. Orders Policies (Customers read own orders; Admins manage orders; server-side/edge functions insert/update)
create policy "Customers can view own orders" on public.orders
  for select using (
    (auth.uid() is not null and customer_id = auth.uid())
    or public.is_admin()
  );

create policy "Admins can modify orders" on public.orders
  for all using (public.is_admin());

-- 13. Order Items Policies
create policy "Customers can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          (auth.uid() is not null and o.customer_id = auth.uid())
          or public.is_admin()
        )
    )
  );

create policy "Admins can modify order items" on public.order_items
  for all using (public.is_admin());

-- 14. Reviews Policies
create policy "Public can view approved reviews" on public.reviews
  for select using (is_approved = true or customer_id = auth.uid() or public.is_admin());

create policy "Authenticated customers can submit reviews" on public.reviews
  for insert with check (auth.uid() is not null and auth.uid() = customer_id);

create policy "Customers can update own reviews" on public.reviews
  for update using (auth.uid() = customer_id or public.is_admin());

create policy "Admins can delete reviews" on public.reviews
  for delete using (public.is_admin());

-- 15. Inventory Logs Policies
create policy "Admins can view inventory logs" on public.inventory_logs
  for select using (public.is_admin());
