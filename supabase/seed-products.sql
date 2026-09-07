-- Run supabase-schema.sql first.
-- Adds the requested Linen Shirt to the catalogue.

insert into public.products
  (slug, name, description, category, color, price_cents, currency, image_url, badge, active)
values
  ('linen-shirt', 'Linen Shirt', 'A breathable linen shirt with an easy silhouette for warm-weather dressing.', 'Tops', 'Natural', 249900, 'INR', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=88', 'New', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  color = excluded.color,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  image_url = excluded.image_url,
  badge = excluded.badge,
  active = excluded.active;

insert into public.product_variants (product_id, size, sku, stock)
select p.id, v.size, 'VEL-LINEN-' || v.size, v.stock
from public.products p
cross join (values ('S', 5), ('M', 12), ('L', 8), ('XL', 4)) as v(size, stock)
where p.slug = 'linen-shirt'
on conflict (product_id, size) do update set
  stock = excluded.stock,
  sku = excluded.sku;
