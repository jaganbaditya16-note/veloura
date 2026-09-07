# VELOURA — Premium Clothing Store

A premium fashion storefront with a Vite + React frontend and a Supabase-ready backend layer.

## Local development

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Run `supabase-schema.sql` in the Supabase SQL Editor.
5. Deploy the two Edge Functions in `supabase/functions/`.
6. Configure the server-side `SUPABASE_SERVICE_ROLE_KEY` for Edge Functions only.

The browser uses only the publishable key. Never place the service-role key, Stripe secret, or Razorpay secret in any `VITE_*` variable.

## Features

- Responsive premium editorial storefront
- Search, category filtering and price sorting
- Product quick view with size selection
- Persistent cart and wishlist
- Shipping threshold calculation
- Supabase product catalog loading with demo fallback
- Auth-aware checkout boundary
- Server-side price and stock validation in `create-order`
- Server-side newsletter signup
- Row Level Security policies for user-owned data
- Lightweight CSS/SVG motion with no paid animation assets

## Production payment flow

`create-order` intentionally creates a pending order only. Connect Stripe/Razorpay from the Edge Function, then confirm payment through a verified webhook before changing an order to `paid`.

## Before selling this to a real client

Replace demo imagery with owned/licensed assets, add a real CMS/admin dashboard, configure transactional email, add CAPTCHA/rate limiting to public functions, add legal pages, and test the payment/webhook flow end-to-end.
