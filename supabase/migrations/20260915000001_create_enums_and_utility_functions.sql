-- =============================================================================
-- Migration 1: Extensions, Custom Types, and Utility Functions
-- =============================================================================

-- Enable Required Postgres Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Product publication status
do $$ begin
  create type public.product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

-- Order lifecycle status
do $$ begin
  create type public.order_status as enum ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

-- Payment transaction status
do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- Discount calculation types
do $$ begin
  create type public.discount_type as enum ('percent', 'fixed');
exception when duplicate_object then null; end $$;

-- Address types
do $$ begin
  create type public.address_type as enum ('shipping', 'billing', 'both');
exception when duplicate_object then null; end $$;

-- Utility trigger function to automatically update updated_at timestamps
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;
