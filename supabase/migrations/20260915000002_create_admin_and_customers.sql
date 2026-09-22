-- =============================================================================
-- Migration 2: Admin Users, Customers, and Addresses
-- =============================================================================

-- 1. Admin Users Table (distinguish store administrators from customers)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'superadmin', 'staff')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.admin_users is 'Stores auth user IDs that possess store administrator rights';

-- Helper function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 
    from public.admin_users 
    where user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- 2. Customers Table (linked 1:1 with auth.users)
create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger handle_updated_at_customers
  before update on public.customers
  for each row execute function public.set_updated_at();

-- Trigger to auto-create customer record on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.customers (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Customer Addresses Table
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type public.address_type not null default 'shipping',
  first_name text not null,
  last_name text not null,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text,
  country text not null default 'Nigeria',
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_addresses_customer_id on public.addresses(customer_id);

create trigger handle_updated_at_addresses
  before update on public.addresses
  for each row execute function public.set_updated_at();
