import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { useAuth } from './AuthContext';

type PaymentAccessValue = {
  hasStyleAccess: boolean;
  loading: boolean;
  completePayment: () => Promise<void>;
};

/** Legacy device-wide key; migrated per-user on first load after login. */
const STORAGE_KEY = 'styla_payment_access_v1';

function userStorageKey(userId: string) {
  return `${STORAGE_KEY}_${userId}`;
}

const PaymentAccessContext = createContext<PaymentAccessValue | undefined>(undefined);

export function PaymentAccessProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [hasStyleAccess, setHasStyleAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      setLoading(true);
      if (!userId) {
        setHasStyleAccess(false);
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const key = userStorageKey(userId);
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
  }, [userId]);

  const completePayment = useCallback(async () => {
    if (!userId) {
      throw new Error('You must be logged in to complete payment.');
    }
    setHasStyleAccess(true);
    await AsyncStorage.setItem(userStorageKey(userId), JSON.stringify({ hasStyleAccess: true }));
  }, [userId]);

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
