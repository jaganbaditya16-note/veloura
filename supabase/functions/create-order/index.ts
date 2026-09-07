import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Authentication required' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return json({ error: 'Invalid session' }, 401);

    const body = await req.json();
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) return json({ error: 'Invalid cart' }, 400);

    const normalizedItems = body.items.map((x: any) => ({
      product_id: String(x.product_id ?? ''),
      variant_id: String(x.variant_id ?? ''),
      size: String(x.size ?? '').trim(),
      quantity: Number(x.quantity),
    }));
    if (normalizedItems.some((x: any) => !x.product_id || !x.variant_id || !x.size || !Number.isInteger(x.quantity) || x.quantity < 1 || x.quantity > 20)) {
      return json({ error: 'Invalid cart item' }, 400);
    }

    const productIds = [...new Set(normalizedItems.map((x: any) => x.product_id))];
    const variantIds = [...new Set(normalizedItems.map((x: any) => x.variant_id))];
    const { data: products, error: productError } = await admin.from('products').select('id,name,price_cents,active,currency').in('id', productIds);
    if (productError) throw productError;
    const { data: variants, error: variantError } = await admin.from('product_variants').select('id,product_id,size,stock').in('id', variantIds);
    if (variantError) throw variantError;

    const byId = new Map((products ?? []).map((p: any) => [p.id, p]));
    const variantById = new Map((variants ?? []).map((v: any) => [v.id, v]));
    const requestedStock = new Map<string, number>();
    for (const input of normalizedItems) requestedStock.set(input.variant_id, (requestedStock.get(input.variant_id) ?? 0) + input.quantity);

    let subtotal = 0;
    const items: any[] = [];
    for (const input of normalizedItems) {
      const product = byId.get(input.product_id);
      const variant = variantById.get(input.variant_id);
      if (!product || !product.active || product.currency !== 'INR' || !variant || variant.product_id !== product.id || variant.size !== input.size) {
        return json({ error: 'Invalid product or size' }, 400);
      }
      if (variant.stock < (requestedStock.get(input.variant_id) ?? 0)) {
        return json({ error: `Insufficient stock for ${product.name} (${variant.size})` }, 409);
      }
      subtotal += product.price_cents * input.quantity;
      items.push({ product_id: product.id, variant_id: variant.id, product_name: product.name, size: variant.size, quantity: input.quantity, unit_price_cents: product.price_cents });
    }

    const shipping = subtotal >= 1500000 ? 0 : 12000;
    const total = subtotal + shipping;
    const { data: order, error: orderError } = await admin.from('orders').insert({ user_id: user.id, subtotal_cents: subtotal, shipping_cents: shipping, total_cents: total, currency: 'INR', shipping_address: body.shipping_address ?? null }).select('id').single();
    if (orderError) throw orderError;

    const rows = items.map(i => ({ ...i, order_id: order.id }));
    const { error: itemError } = await admin.from('order_items').insert(rows);
    if (itemError) throw itemError;

    // Payment provider integration belongs here. Do not mark orders paid until a verified server-side webhook succeeds.
    return json({ order_id: order.id, subtotal_cents: subtotal, shipping_cents: shipping, total_cents: total, payment_status: 'pending' });
  } catch (error) {
    console.error(error);
    return json({ error: 'Unable to create order' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
