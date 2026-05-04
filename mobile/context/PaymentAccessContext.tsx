import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { useAuth } from './AuthContext';

type FeatureKey = 'style' | 'colour';
type PaymentPlan = 'style' | 'colour' | 'both';

type PaymentAccessValue = {
  hasStyleAccess: boolean;
  hasColourAccess: boolean;
  loading: boolean;
  hasAccessFor: (feature: FeatureKey) => boolean;
  completePayment: (plan: PaymentPlan) => Promise<void>;
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
  const [hasColourAccess, setHasColourAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      setLoading(true);
      if (!userId) {
        setHasStyleAccess(false);
        setHasColourAccess(false);
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
          setHasStyleAccess(Boolean(parsed.hasStyleAccess));
          setHasColourAccess(Boolean(parsed.hasColourAccess));
        } else {
          setHasStyleAccess(false);
          setHasColourAccess(false);
        }
      } catch {
        if (!cancelled) {
          setHasStyleAccess(false);
          setHasColourAccess(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const completePayment = useCallback(
    async (plan: PaymentPlan) => {
      if (!userId) {
        throw new Error('You must be logged in to complete payment.');
      }
      let nextStyle = false;
      let nextColour = false;
      setHasStyleAccess((was) => {
        nextStyle = was || plan === 'style' || plan === 'both';
        return nextStyle;
      });
      setHasColourAccess((was) => {
        nextColour = was || plan === 'colour' || plan === 'both';
        return nextColour;
      });
      await AsyncStorage.setItem(
        userStorageKey(userId),
        JSON.stringify({ hasStyleAccess: nextStyle, hasColourAccess: nextColour }),
      );
    },
    [userId],
  );

  const hasAccessFor = useCallback(
    (feature: FeatureKey) => (feature === 'style' ? hasStyleAccess : hasColourAccess),
    [hasStyleAccess, hasColourAccess],
  );

  const value = useMemo<PaymentAccessValue>(
    () => ({
      hasStyleAccess,
      hasColourAccess,
      loading,
      hasAccessFor,
      completePayment,
    }),
    [completePayment, hasAccessFor, hasColourAccess, hasStyleAccess, loading],
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
