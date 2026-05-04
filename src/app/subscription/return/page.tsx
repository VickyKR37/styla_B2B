'use client';

/**
 * HTTPS return page for Stripe Checkout (Stripe does not allow styla:// as success_url).
 * Set Edge secrets to your deployed origin, e.g.:
 * STRIPE_CHECKOUT_SUCCESS_URL = https://YOUR_DOMAIN/subscription/return?status=success
 * STRIPE_CHECKOUT_CANCEL_URL  = https://YOUR_DOMAIN/subscription/return?status=cancel
 */
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectBody() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('status') ?? 'success';
  const cancelled = raw === 'cancel';

  useEffect(() => {
    window.location.replace(
      cancelled ? 'styla://subscription/result?checkout=cancel' : 'styla://subscription/result?checkout=success',
    );
  }, [cancelled]);

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24, maxWidth: 480 }}>
      <h1 style={{ fontSize: 22 }}>Returning to Styla…</h1>
      <p>If the app does not open automatically, reopen Styla.</p>
    </div>
  );
}

export default function SubscriptionReturnPage() {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Loading…</p>}>
      <RedirectBody />
    </Suspense>
  );
}
