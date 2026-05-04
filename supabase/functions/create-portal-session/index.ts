import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import Stripe from 'https://esm.sh/stripe@17.4.0';

import { corsHeaders, handleCors } from '../_shared/cors.ts';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const opt = handleCors(req);
  if (opt) return opt;

  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey || !stripeKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Missing Authorization' }, 401);

  let parsed: { user_id?: string };
  try {
    parsed = (await req.json()) as { user_id?: string };
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const userId = parsed.user_id?.trim();
  if (!userId) return jsonResponse({ error: 'user_id is required' }, 400);

  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userErr,
  } = await supabaseAuth.auth.getUser();
  if (userErr || !user || user.id !== userId) return jsonResponse({ error: 'Forbidden' }, 403);

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: row, error: rowErr } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('consultant_id', userId)
    .maybeSingle();

  if (rowErr) return jsonResponse({ error: rowErr.message }, 500);
  const customerId = row?.stripe_customer_id as string | undefined;
  if (!customerId) {
    return jsonResponse({ error: 'No Stripe customer found for this account.' }, 404);
  }

  const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });

  const returnUrl = Deno.env.get('STRIPE_PORTAL_RETURN_URL') ?? 'styla://subscription/manage';

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return jsonResponse({ url: portalSession.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Stripe portal failed';
    console.error('create-portal-session', message);
    return jsonResponse({ error: message }, 500);
  }
});
