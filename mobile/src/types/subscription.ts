/** Row shape for `public.subscriptions` (consultant read via RLS). */
export type SubscriptionRow = {
  id: string;
  consultant_id: string;
  stripe_customer_id: string | null;
  stripe_sub_id: string | null;
  status: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'cancelled' | string;
