# Olive & Dreams: Supabase Backend

Complete serverless backend for the **Olive & Dreams** e-commerce store, powered entirely by **Supabase** (Postgres, Row Level Security, Auth, Storage, and Edge Functions).

---

## Architecture Overview

- **Database**: PostgreSQL with UUID primary keys, strict check constraints, foreign keys, and automatic `updated_at` triggers.
- **Security**: Row Level Security (RLS) active on 100% of tables. Client reads are public where appropriate (active products, categories), customer data is isolated to `auth.uid()`, and order mutation/inventory decrement is restricted to secure server-side Edge Functions.
- **Stock Protection**: Atomic stored procedure `public.decrement_order_inventory(p_order_id)` using `SELECT ... FOR UPDATE` row locks to completely eliminate race conditions and overselling.
- **Payment Processing**: Paystack integration via Edge Functions supporting Nigerian Naira (NGN), HMAC-SHA512 webhook signature verification, and automated order completion.
- **Transactional Emails**: Resend API integration via Edge Functions with a branded, luxury responsive HTML receipt template.
- **Storage**: Buckets for `product-images` (public read, admin write) and `customer-avatars` (private per-user).

---

## Directory Structure

```
supabase/
├── config.toml                      # Supabase local environment configuration
├── seed.sql                         # Initial seed data (categories, products, variants, delivery rates)
├── README.md                        # This documentation guide
├── migrations/
│   ├── 20260915000001_create_enums_and_utility_functions.sql
│   ├── 20260915000002_create_admin_and_customers.sql
│   ├── 20260915000003_create_catalog_tables.sql
│   ├── 20260915000004_create_carts_and_discounts.sql
│   ├── 20260915000005_create_orders_and_reviews.sql
│   ├── 20260915000006_create_inventory_and_atomic_functions.sql
│   ├── 20260915000007_create_rls_policies.sql
│   └── 20260915000008_create_storage_buckets.sql
└── functions/
    ├── _shared/
    │   └── cors.ts                  # Shared CORS headers
    ├── create-checkout-session/     # Server-side pricing validation & Paystack init
    │   └── index.ts
    ├── paystack-webhook/            # Signature verification, atomic stock decrement
    │   └── index.ts
    ├── apply-discount/              # Coupon validation & rule enforcement
    │   └── index.ts
    └── send-order-confirmation/     # Transactional email receipt via Resend
        └── index.ts
```

---

## Prerequisites

1. **Supabase CLI**:
   - Install globally via npm:
     ```bash
     npm install -g supabase
     ```
   - Or run via `npx supabase` / `npx.cmd supabase` (Windows).
2. **Docker Desktop**: Required only if running Supabase locally (`supabase start`).
3. **Paystack Account**: API secret key (`sk_test_...` or `sk_live_...`).
4. **Resend Account**: API key (`re_...`) and verified sender domain.

---

## Local Development Workflow

### 1. Start Local Supabase
Run the local Docker stack (Postgres, Studio UI, Auth, Storage, Edge Runtime):
```bash
supabase start
```
Once started, you will receive local credentials:
- **API URL**: `http://127.0.0.1:54321`
- **Studio Dashboard**: `http://127.0.0.1:54323`
- **Database URL**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

### 2. Apply Migrations and Seed Data
Apply all migration files in order and populate sample products, variants, and delivery methods:
```bash
supabase db reset
```

### 3. Serve Edge Functions Locally
Create a local secret file `supabase/.env.local`:
```env
PAYSTACK_SECRET_KEY=sk_test_mock_secret
RESEND_API_KEY=re_mock_test_key
SITE_URL=http://localhost:3000
```
Start the local Edge Function runtime:
```bash
supabase functions serve --env-file ./supabase/.env.local
```
Functions will be available at:
- `http://127.0.0.1:54321/functions/v1/create-checkout-session`
- `http://127.0.0.1:54321/functions/v1/paystack-webhook`
- `http://127.0.0.1:54321/functions/v1/apply-discount`
- `http://127.0.0.1:54321/functions/v1/send-order-confirmation`

---

## Deploying to Supabase Cloud

### 1. Link Your Project
Authenticate the CLI and connect to your remote Supabase project:
```bash
supabase login
supabase link --project-ref <your-supabase-project-id>
```

### 2. Push Migrations
Deploy your database schema, RLS policies, triggers, and atomic functions:
```bash
supabase db push
```

### 3. Seed Remote Database (Optional)
To load the initial collections, products, and Abuja/Nationwide delivery configurations:
```bash
supabase db query --file ./supabase/seed.sql
```

### 4. Set Production Secrets for Edge Functions
Configure your API keys in the Supabase Cloud Vault:
```bash
supabase secrets set \
  PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  RESEND_FROM_EMAIL="Olive & Dreams <orders@oliveanddreams.com>" \
  SITE_URL="https://oliveanddreams.com"
```

### 5. Deploy Edge Functions
Deploy all 4 functions with one command:
```bash
supabase functions deploy
```
Or deploy individual functions:
```bash
supabase functions deploy create-checkout-session
supabase functions deploy paystack-webhook --no-verify-jwt
supabase functions deploy apply-discount
supabase functions deploy send-order-confirmation
```

> **Note**: `paystack-webhook` must be deployed with `--no-verify-jwt` so that Paystack's servers can deliver webhook POST events without an Authorization bearer token. Security is enforced via HMAC-SHA512 signature verification.

---

## Webhook Configuration in Paystack Dashboard

1. Log in to [Paystack Dashboard](https://dashboard.paystack.co/#/settings/developer).
2. Go to **Settings** -> **API Keys & Webhooks**.
3. Under **Live Webhook URL** (or Test Webhook URL), enter:
   ```
   https://<your-project-id>.supabase.co/functions/v1/paystack-webhook
   ```
4. Save changes. When a customer completes checkout, Paystack sends a `charge.success` event, automatically triggering:
   - Status update to `paid`
   - Atomic inventory reduction
   - Confirmation email via Resend

---

## Key Backend Mechanics

### 1. Concurrency & Overselling Prevention
In standard applications, reading stock and then updating it allows two simultaneous checkouts to purchase the same last unit. 

Olive & Dreams implements `decrement_order_inventory(p_order_id)`:
```sql
select stock_quantity into current_stock
from public.product_variants
where id = item.variant_id
for update; -- Exclusively locks the row for the transaction
```
If stock is insufficient, the transaction throws an exception and rolls back completely, ensuring accurate stock balances under high flash-sale load.

### 2. Guest Carts & Persistence
The `carts` table supports:
- Guest shoppers using an `x-cart-session` UUID header stored in browser `localStorage`.
- Logged-in users linked to `auth.users(id)`.
- Seamless cart merging when a guest logs in.

### 3. Server-Side Price Verification
Client applications should **never** send checkout total amounts directly to payment gateways. In `create-checkout-session`:
- The client sends only `variant_id` and `quantity`.
- Unit prices are fetched directly from Postgres.
- Delivery fees are pulled from `delivery_methods`.
- Coupons are validated against date, limits, and order subtotal in `discounts`.
- The final charged amount is calculated server-side.
