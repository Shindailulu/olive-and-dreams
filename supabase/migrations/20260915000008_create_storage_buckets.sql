-- =============================================================================
-- Migration 8: Supabase Storage Buckets and Storage RLS Policies
-- =============================================================================

-- 1. Create Storage Buckets in storage.buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  (
    'product-images',
    'product-images',
    true,
    10485760, -- 10MB limit
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
  ),
  (
    'customer-avatars',
    'customer-avatars',
    false,
    5242880, -- 5MB limit
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage Policies for product-images (Public read, Admin-only write)
create policy "Public Access to Product Images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins Can Upload Product Images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

create policy "Admins Can Update Product Images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );

create policy "Admins Can Delete Product Images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- 3. Storage Policies for customer-avatars (Private, per-user folder)
create policy "Users Can Read Own Avatar"
  on storage.objects for select
  using (
    bucket_id = 'customer-avatars'
    and (
      (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
      or public.is_admin()
    )
  );

create policy "Users Can Upload Own Avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'customer-avatars'
    and (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "Users Can Update Own Avatar"
  on storage.objects for update
  using (
    bucket_id = 'customer-avatars'
    and (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "Users Can Delete Own Avatar"
  on storage.objects for delete
  using (
    bucket_id = 'customer-avatars'
    and (
      (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
      or public.is_admin()
    )
  );
