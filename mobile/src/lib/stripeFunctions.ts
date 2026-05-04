import { supabase } from '../../lib/supabase';

export async function invokeCreateCheckoutSession(userId: string, accessToken: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-checkout-session',
    {
      body: { user_id: userId },
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (error) throw new Error(error.message);
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    throw new Error(data.error);
  }
  const url = data && typeof data === 'object' && 'url' in data ? data.url : undefined;
  if (!url) throw new Error('Could not start checkout.');
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
  if (error) throw new Error(error.message);
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    throw new Error(data.error);
  }
  const url = data && typeof data === 'object' && 'url' in data ? data.url : undefined;
  if (!url) throw new Error('Could not open billing portal.');
  return url;
}
