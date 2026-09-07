-- VELOURA production starter schema for Supabase/Postgres.
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category text not null,
  color text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'INR' check (currency = 'INR'),
  image_url text,
  badge text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  unique(product_id,size)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  currency text not null default 'INR' check (currency = 'INR'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null check (total_cents = subtotal_cents + shipping_cents),
  payment_reference text,
  shipping_address jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  size text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "public can read active products" on public.products;
create policy "public can read active products" on public.products for select using (active = true);

drop policy if exists "public can read active variants" on public.product_variants;
create policy "public can read active variants" on public.product_variants for select using (exists(select 1 from public.products p where p.id=product_id and p.active=true));

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile" on public.profiles for select using (auth.uid()=id);
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);

drop policy if exists "users can read own orders" on public.orders;
create policy "users can read own orders" on public.orders for select using (auth.uid()=user_id);
drop policy if exists "users can read own order items" on public.order_items;
create policy "users can read own order items" on public.order_items for select using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

-- Newsletter inserts and order creation use server-side Edge Functions.
-- Never expose a service-role key in browser code.
