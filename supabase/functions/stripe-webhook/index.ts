/**
 * Stripe → Supabase sync. Configure `verify_jwt = false` in supabase/config.toml.
 * Requires a UNIQUE constraint on `public.subscriptions (consultant_id)` for checkout upserts.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import Stripe from 'https://esm.sh/stripe@17.4.0';

/** Map Stripe subscription status to `public.subscriptions.status` text. */
function mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'inactive';
    default:
      return 'inactive';
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    console.error('stripe-webhook missing env');
    return new Response('Configuration error', { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing stripe-signature', { status: 400 });

  const body = await req.text();
  const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid signature';
    console.error('Webhook signature', msg);
    return new Response(msg, { status: 400 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const consultantId = session.metadata?.consultant_id ?? session.client_reference_id;
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

        if (!consultantId || !customerId || !subId) {
          console.warn('checkout.session.completed missing ids', { consultantId, customerId, subId });
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subId);
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        const { error } = await supabaseAdmin.from('subscriptions').upsert(
          {
            consultant_id: consultantId,
            stripe_customer_id: customerId,
            stripe_sub_id: subId,
            status: 'active',
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'consultant_id' },
        );
        if (error) console.error('subscriptions upsert', error);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const status = mapSubscriptionStatus(subscription.status);

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_sub_id', subscription.id);

        if (error) console.error('subscription.updated', error);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_sub_id', subscription.id);

        if (error) console.error('subscription.deleted', error);
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error('stripe-webhook handler', e);
    return new Response('Handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
