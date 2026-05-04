import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { SubscriptionRow } from '../types/subscription';

function computeIsActive(row: Pick<SubscriptionRow, 'status' | 'current_period_end'> | null): boolean {
  if (!row || row.status !== 'active') return false;
  if (!row.current_period_end) return false;
  const end = new Date(row.current_period_end).getTime();
  return !Number.isNaN(end) && end > Date.now();
}

export function useSubscription() {
  const { user } = useAuth();
  const [row, setRow] = useState<Pick<SubscriptionRow, 'status' | 'current_period_end'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setRow(null);
      setError(null);
      setLoading(false);
      return;
    }
    setError(null);
    const { data, error: qErr } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('consultant_id', user.id)
      .maybeSingle();

    if (qErr) {
      setError(qErr.message);
      setRow(null);
      return;
    }
    setRow((data ?? null) as Pick<SubscriptionRow, 'status' | 'current_period_end'> | null);
  }, [user?.id]);

  /** One-shot fetch used by checkout return polling; updates local state and returns whether subscription is active. */
  const refetchIsActive = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    const { data, error: qErr } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('consultant_id', user.id)
      .maybeSingle();
    if (qErr) {
      setError(qErr.message);
      setRow(null);
      return false;
    }
    const next = (data ?? null) as Pick<SubscriptionRow, 'status' | 'current_period_end'> | null;
    setRow(next);
    return computeIsActive(next);
  }, [user?.id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      await refetch();
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [refetch]);

  const isActive = useMemo(() => computeIsActive(row), [row]);

  return {
    isActive,
    status: row?.status ?? null,
    currentPeriodEnd: row?.current_period_end ?? null,
    loading,
    error,
    refetch,
    refetchIsActive,
  };
}
