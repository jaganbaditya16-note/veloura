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

1. Create the client-owned Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Run `supabase-schema.sql` in the Supabase SQL Editor.
5. Run `supabase/seed-products.sql` for the sample Linen Shirt.
6. Deploy the Edge Functions in `supabase/functions/`.
7. Configure `SUPABASE_SERVICE_ROLE_KEY` for Edge Functions only.

The store uses **INR only**. Never place the service-role key or Razorpay secret in any `VITE_*` variable.

## Features

- Responsive premium editorial storefront
- INR pricing with paise-safe integer calculations
- Search, category filtering and price sorting
- Product quick view with size selection
- Persistent cart and wishlist
- ₹15,000 free-shipping threshold
- Supabase product catalog loading with demo fallback
- Authenticated server-side order validation
- Product/variant/price/stock checks before order creation
- Server-side newsletter signup function
- Row Level Security policies for user-owned data
- Lightweight CSS/SVG motion with no paid animation assets

## Production status

The storefront and backend starter are prepared for integration, but **Razorpay payment creation/webhook verification, customer authentication UI, atomic stock deduction after verified payment, and the admin dashboard still need to be implemented and tested before accepting real orders**. The checkout button is intentionally a boundary until the payment flow is connected.

Before selling to a real client, replace demo imagery with owned/licensed assets, configure transactional email, add CAPTCHA/rate limiting to public functions, add legal pages, and test the payment/webhook flow end-to-end.

## Client handoff

The business owner should own Supabase, Razorpay, domain and production hosting. The developer configures and maintains them with appropriate access. Never share account passwords or commit private credentials.
