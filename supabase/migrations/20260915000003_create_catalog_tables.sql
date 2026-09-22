-- =============================================================================
-- Migration 3: Catalog (Categories, Products, Variants, Images)
-- =============================================================================

-- 1. Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  position int not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_categories_slug on public.categories(slug);

create trigger handle_updated_at_categories
  before update on public.categories
  for each row execute function public.set_updated_at();

-- 2. Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price >= 0),
  sku text unique,
  status public.product_status not null default 'draft',
  material text,
  fit text,
  care_instructions text,
  size_guide text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_sku on public.products(sku);

create trigger handle_updated_at_products
  before update on public.products
  for each row execute function public.set_updated_at();

-- 3. Product Categories Junction Table (Many-to-Many)
create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create index if not exists idx_product_categories_cat on public.product_categories(category_id);

-- 4. Product Variants
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  sku text unique,
  price_override numeric(12,2) check (price_override is null or price_override >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  position int not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_product_size_color unique (product_id, size, color)
);

create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_product_variants_sku on public.product_variants(sku);

create trigger handle_updated_at_variants
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- 5. Product Images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text default '',
  position int not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_product_images_product_id on public.product_images(product_id, position);

create trigger handle_updated_at_images
  before update on public.product_images
  for each row execute function public.set_updated_at();
