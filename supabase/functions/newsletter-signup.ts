import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { email } = await req.json();
    const normalized = typeof email === 'string' ? email.toLowerCase().trim() : '';
    if (!/^\S+@\S+\.\S+$/.test(normalized) || normalized.length > 254) {
      return json({ error: 'Invalid email' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { error } = await admin.from('newsletter_subscribers').upsert(
      { email: normalized },
      { onConflict: 'email', ignoreDuplicates: true }
    );
    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: 'Unable to subscribe' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
