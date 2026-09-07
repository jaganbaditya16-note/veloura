import { supabase } from './supabase';

export async function fetchProducts() {
  if (!supabase) return { data: null, error: null };
  const { data, error } = await supabase
    .from('products')
    .select('id,slug,name,description,category,color,price_cents,currency,image_url,badge,product_variants(id,size,stock)')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };

  const products = (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? '',
    category: p.category,
    color: p.color ?? '',
    price: Number(p.price_cents),
    currency: 'INR',
    image: p.image_url,
    badge: p.badge ?? '',
    sizes: (p.product_variants ?? []).map((v) => v.size),
    variants: p.product_variants ?? [],
  }));

  return { data: products, error: null };
}
