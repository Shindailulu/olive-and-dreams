-- =============================================================================
-- Olive & Dreams: Supabase Seed Data
-- =============================================================================

-- 1. Delivery Methods
insert into public.delivery_methods (code, name, fee, enabled, instructions, location_details)
values
  (
    'ABUJA_PICKUP',
    'Abuja Showroom Pickup',
    0.00,
    true,
    'Pickup available from our Abuja showroom: Suite 12, Olive Plaza, Wuse II, Abuja. Open Mon-Sat, 9AM - 6PM.',
    'Wuse II Showroom, Abuja'
  ),
  (
    'NATIONWIDE',
    'Nationwide Delivery (Doorstep)',
    4500.00,
    true,
    'Delivery to your doorstep across Nigeria. Shipping takes 2-4 business days in Lagos & Abuja, and 3-7 days for other states.',
    null
  )
on conflict (code) do update set
  fee = excluded.fee,
  instructions = excluded.instructions,
  location_details = excluded.location_details;

-- 2. Discounts
insert into public.discounts (code, type, value, min_purchase_amount, max_discount_amount, is_active, usage_limit, usage_count)
values
  ('WELCOME10', 'percent', 10.00, 20000.00, 10000.00, true, 500, 0),
  ('DREAMS5K', 'fixed', 5000.00, 40000.00, 5000.00, true, 200, 0)
on conflict (code) do nothing;

-- 3. Categories
insert into public.categories (id, name, slug, description, position)
values
  ('11111111-1111-1111-1111-111111111111', 'Dresses', 'dresses', 'Sophisticated and effortless dresses for every occasion.', 1),
  ('22222222-2222-2222-2222-222222222222', 'Tops & Blouses', 'tops', 'Chic, breathable tops tailored for warm weather elegance.', 2),
  ('33333333-3333-3333-3333-333333333333', 'Do me nice, do me jeje', 'do-me-nice-do-me-jeje', 'Debut ready-to-wear collection celebrating modern African grace.', 3)
on conflict (slug) do nothing;

-- 4. Products
insert into public.products (
  id,
  name,
  slug,
  description,
  price,
  compare_at_price,
  sku,
  status,
  material,
  fit,
  care_instructions,
  size_guide
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Jeje Linen Midi Dress',
    'jeje-linen-midi-dress',
    'An elegant, flowy midi dress crafted from premium breathable linen. Designed to bring ease, comfort, and sophisticated style to warm sunny days. Features a soft back tie closure and dynamic side slits.',
    45000.00,
    50000.00,
    'JLM-BASE',
    'active',
    '100% Premium African Linen',
    'Relaxed flowy silhouette, fits true to size.',
    'Hand wash cold or dry clean. Warm iron on reverse side.',
    'XS: Bust 32, Waist 25 | S: Bust 34, Waist 27 | M: Bust 36, Waist 29 | L: Bust 39, Waist 32 | XL: Bust 42, Waist 35'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Olive Satin Wrap Blouse',
    'olive-satin-wrap-blouse',
    'A versatile wrap blouse tailored from lustrous satin fabric with flared cuffs and adjustable tie waist. Perfect for both office elegance and evening soirees.',
    28000.00,
    32000.00,
    'OSW-BASE',
    'active',
    'Heavyweight Silk-Blend Satin',
    'Tailored wrap fit with adjustable waist tie.',
    'Dry clean only or delicate cold hand wash.',
    'S: Bust 34 | M: Bust 36 | L: Bust 39'
  )
on conflict (slug) do nothing;

-- 5. Product Categories Mapping
insert into public.product_categories (product_id, category_id)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333')
on conflict do nothing;

-- 6. Product Variants
insert into public.product_variants (id, product_id, size, color, sku, price_override, stock_quantity, position)
values
  ('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'S', 'Olive', 'JLM-OLV-S', null, 12, 1),
  ('10000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'M', 'Olive', 'JLM-OLV-M', null, 10, 2),
  ('10000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'L', 'Olive', 'JLM-OLV-L', null, 6, 3),
  ('10000000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'S', 'Wine', 'JLM-WNE-S', null, 8, 4),
  ('10000000-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'M', 'Wine', 'JLM-WNE-M', null, 5, 5),
  ('10000000-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'L', 'Wine', 'JLM-WNE-L', null, 4, 6),
  ('20000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'S', 'Champagne', 'OSW-CHP-S', null, 8, 1),
  ('20000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'M', 'Champagne', 'OSW-CHP-M', null, 10, 2),
  ('20000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'L', 'Champagne', 'OSW-CHP-L', null, 5, 3)
on conflict do nothing;

-- 7. Product Images
insert into public.product_images (product_id, url, alt_text, position)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '/logo-colors.jpg', 'Jeje Linen Midi Dress Front', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '/logo-colors.jpg', 'Olive Satin Wrap Blouse Front', 1)
on conflict do nothing;
