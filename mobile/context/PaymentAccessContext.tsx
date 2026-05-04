import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { useAuth } from './AuthContext';

type PaymentAccessValue = {
  hasStyleAccess: boolean;
  loading: boolean;
  completePayment: () => Promise<void>;
};

/** Legacy device-wide key; migrated per-consultant on first load after sign-in. */
const STORAGE_KEY = 'styla_payment_access_v1';

function consultantStorageKey(consultantAuthId: string) {
  return `${STORAGE_KEY}_${consultantAuthId}`;
}

const PaymentAccessContext = createContext<PaymentAccessValue | undefined>(undefined);

export function PaymentAccessProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const consultantAuthId = user?.id ?? null;

  const [hasStyleAccess, setHasStyleAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      setLoading(true);
      if (!consultantAuthId) {
        setHasStyleAccess(false);
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const key = consultantStorageKey(consultantAuthId);
        let stored = await AsyncStorage.getItem(key);
        if (!stored) {
          const legacy = await AsyncStorage.getItem(STORAGE_KEY);
          if (legacy) {
            await AsyncStorage.setItem(key, legacy);
            await AsyncStorage.removeItem(STORAGE_KEY);
            stored = legacy;
          }
        }
        if (cancelled) return;

        if (stored) {
          const parsed = JSON.parse(stored) as { hasStyleAccess?: boolean; hasColourAccess?: boolean };
          /** Treat legacy colour purchases as unlocking style-only access now that colour analysis was removed. */
          const style = Boolean(parsed.hasStyleAccess) || Boolean(parsed.hasColourAccess);
          setHasStyleAccess(style);
        } else {
          setHasStyleAccess(false);
        }
      } catch {
        if (!cancelled) setHasStyleAccess(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [consultantAuthId]);

  const completePayment = useCallback(async () => {
    if (!consultantAuthId) {
      throw new Error('You must be signed in with a consultant account to complete checkout.');
    }
    setHasStyleAccess(true);
    await AsyncStorage.setItem(consultantStorageKey(consultantAuthId), JSON.stringify({ hasStyleAccess: true }));
  }, [consultantAuthId]);

  const value = useMemo<PaymentAccessValue>(
    () => ({
      hasStyleAccess,
      loading,
      completePayment,
    }),
    [completePayment, hasStyleAccess, loading],
  );

  return <PaymentAccessContext.Provider value={value}>{children}</PaymentAccessContext.Provider>;
}

export function usePaymentAccess() {
  const context = useContext(PaymentAccessContext);
  if (!context) {
    throw new Error('usePaymentAccess must be used within a PaymentAccessProvider');
  }
  return context;
}
