-- =============================================================================
-- Migration 4: Carts, Cart Items, Discounts, and Delivery Methods
-- =============================================================================

-- 1. Carts (Supports both Logged-In and Guest sessions)
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  session_token text not null unique,
  status text not null default 'active' check (status in ('active', 'converted', 'abandoned')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_carts_customer_id on public.carts(customer_id);
create index if not exists idx_carts_session_token on public.carts(session_token);

create trigger handle_updated_at_carts
  before update on public.carts
  for each row execute function public.set_updated_at();

-- 2. Cart Items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_cart_variant unique (cart_id, variant_id)
);

create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);
create index if not exists idx_cart_items_variant_id on public.cart_items(variant_id);

create trigger handle_updated_at_cart_items
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- 3. Discounts / Coupons
create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.discount_type not null default 'percent',
  value numeric(12,2) not null check (value > 0),
  min_purchase_amount numeric(12,2) default 0 check (min_purchase_amount >= 0),
  max_discount_amount numeric(12,2),
  starts_at timestamptz not null default timezone('utc'::text, now()),
  expires_at timestamptz,
  usage_limit int check (usage_limit is null or usage_limit > 0),
  usage_count int not null default 0 check (usage_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_discounts_code on public.discounts(code);

create trigger handle_updated_at_discounts
  before update on public.discounts
  for each row execute function public.set_updated_at();

-- 4. Delivery Methods & Settings
create table if not exists public.delivery_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- e.g. 'ABUJA_PICKUP', 'NATIONWIDE'
  name text not null,
  fee numeric(12,2) not null default 0 check (fee >= 0),
  enabled boolean not null default true,
  instructions text,
  location_details text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_delivery_methods_code on public.delivery_methods(code);

create trigger handle_updated_at_delivery_methods
  before update on public.delivery_methods
  for each row execute function public.set_updated_at();
