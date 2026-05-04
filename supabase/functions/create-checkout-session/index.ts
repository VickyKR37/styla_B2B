import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import Stripe from 'https://esm.sh/stripe@17.4.0';

import { corsHeaders, handleCors } from '../_shared/cors.ts';

/** £19.99 / month in GBP (pence). Unused if STRIPE_PRICE_ID is set). */
const INLINE_UNIT_AMOUNT_GBP = 1999;

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
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!supabaseUrl || !anonKey || !stripeKey) {
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

  const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });

  const successUrl = Deno.env.get('STRIPE_CHECKOUT_SUCCESS_URL') ?? 'styla://subscription/result';
  const cancelUrl = Deno.env.get('STRIPE_CHECKOUT_CANCEL_URL') ?? 'styla://subscription/result';

  const priceId = Deno.env.get('STRIPE_PRICE_ID')?.trim();

  const line_items = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: INLINE_UNIT_AMOUNT_GBP,
            recurring: { interval: 'month' as const },
            product_data: { name: 'Styla professional — unlimited reports' },
          },
          quantity: 1,
        },
      ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: userId,
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { consultant_id: userId },
      subscription_data: {
        metadata: { consultant_id: userId },
      },
    });

    if (!session.url) return jsonResponse({ error: 'No checkout URL returned' }, 500);
    return jsonResponse({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Stripe checkout failed';
    console.error('create-checkout-session', message);
    return jsonResponse({ error: message }, 500);
  }
});
