-- VELOURA demo/product seed
-- Run this AFTER supabase-schema.sql in the client's Supabase SQL Editor.
-- The Linen Shirt is created once and gets four size variants with independent stock.

insert into public.products (name, description, price, category, image_url, is_active)
values (
  'Linen Shirt',
  'Relaxed premium linen shirt with a clean, breathable finish for everyday wear.',
  2499,
  'Shirts',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
  true
)
returning id;

-- Replace PRODUCT_ID below with the id returned by the insert above.
-- Example:
-- insert into public.product_variants (product_id, size, stock)
-- values
--   ('PRODUCT_ID', 'S', 5),
--   ('PRODUCT_ID', 'M', 12),
--   ('PRODUCT_ID', 'L', 8),
--   ('PRODUCT_ID', 'XL', 4);

-- If your schema uses a different variant column name, adapt only the column names;
-- keep the stock values exactly as supplied by the business owner.
