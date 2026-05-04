import { supabase } from '../../lib/supabase';

function extractInvokeFailureMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return typeof error === 'string' ? error : 'Checkout request failed.';
}

export async function invokeCreateCheckoutSession(userId: string, accessToken: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-checkout-session',
    {
      body: { user_id: userId },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (error) {
    throw new Error(extractInvokeFailureMessage(error));
  }
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    throw new Error(data.error);
  }
  const url = data && typeof data === 'object' && 'url' in data ? data.url : undefined;
  if (typeof url !== 'string' || !url.startsWith('http')) {
    throw new Error(
      'Stripe did not return a checkout URL. Deploy create-checkout-session and configure secrets: STRIPE_SECRET_KEY plus HTTPS return URLs (see APP_PUBLIC_ORIGIN or STRIPE_CHECKOUT_*_URL in Supabase docs for this repo).',
    );
  }
  return url;
}

export async function invokeCreatePortalSession(userId: string, accessToken: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-portal-session',
    {
      body: { user_id: userId },
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (error) throw new Error(extractInvokeFailureMessage(error));
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    throw new Error(data.error);
  }
  const url = data && typeof data === 'object' && 'url' in data ? data.url : undefined;
  if (typeof url !== 'string' || !url.startsWith('http')) {
    throw new Error('Could not open billing portal.');
  }
  return url;
}
