import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { invokeCreateCheckoutSession, invokeCreatePortalSession } from '../lib/stripeFunctions';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Subscription'>;

function formatRenewal(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { dateStyle: 'long' });
  } catch {
    return '—';
  }
}

export function SubscriptionScreen(_props: Props) {
  const { user } = useAuth();
  const { isActive, status, currentPeriodEnd, loading, error, refetch } = useSubscription();
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refetch();
      return undefined;
    }, [refetch]),
  );

  async function openCheckout(): Promise<void> {
    if (!user?.id) {
      Alert.alert('Sign in required', 'Sign in again to subscribe.');
      return;
    }
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) {
      Alert.alert('Session expired', 'Sign in again to continue.');
      return;
    }

    setCheckoutBusy(true);
    try {
      const url = await invokeCreateCheckoutSession(user.id, token);
      await WebBrowser.openBrowserAsync(url);
      await refetch();
      const { data: row } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('consultant_id', user.id)
        .maybeSingle();
      const r = row as { status?: string | null; current_period_end?: string | null } | null;
      const ok =
        r?.status === 'active' &&
        r.current_period_end &&
        new Date(r.current_period_end).getTime() > Date.now();
      if (ok) {
        Alert.alert('You’re subscribed', 'Unlimited client reports are now included.');
      }
    } catch (e) {
      Alert.alert('Checkout couldn’t open', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setCheckoutBusy(false);
      await refetch();
    }
  }

  async function openCustomerPortal(): Promise<void> {
    if (!user?.id) return;
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) {
      Alert.alert('Session expired', 'Sign in again to continue.');
      return;
    }
    setPortalBusy(true);
    try {
      const url = await invokeCreatePortalSession(user.id, token);
      await WebBrowser.openBrowserAsync(url);
      await refetch();
    } catch (e) {
      Alert.alert('Billing portal', e instanceof Error ? e.message : 'Could not open the portal.');
    } finally {
      setPortalBusy(false);
      await refetch();
    }
  }

  if (loading && status == null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C4956A" />
        <Text style={styles.muted}>Loading subscription…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {error ? (
        <Pressable style={styles.errorBanner} onPress={() => void refetch()}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorRetry}>Tap to retry</Text>
        </Pressable>
      ) : null}

      <Text style={styles.title}>Styla professional</Text>
      <Text style={styles.subtitle}>Unlimited client style reports and colour-season PDFs for your practice.</Text>

      {isActive ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your subscription is active</Text>
          <Text style={styles.cardLine}>
            Renews on <Text style={styles.em}>{formatRenewal(currentPeriodEnd)}</Text>
          </Text>
          <Text style={styles.cardBody}>Unlimited reports are included while your subscription stays active.</Text>
          <Pressable
            style={[styles.secondaryBtn, portalBusy ? styles.ctaDisabled : null]}
            disabled={portalBusy}
            onPress={() => void openCustomerPortal()}
          >
            {portalBusy ? (
              <ActivityIndicator color="#C4956A" />
            ) : (
              <Text style={styles.secondaryBtnText}>Manage billing & receipts</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {status === 'past_due' && !isActive ? (
        <View style={styles.warnCard}>
          <Text style={styles.warnTitle}>Payment past due</Text>
          <Text style={styles.warnBody}>
            Update your card in the billing portal so your subscription can stay active and you keep unlimited reports.
          </Text>
          <Pressable
            style={[styles.cta, portalBusy ? styles.ctaDisabled : null]}
            disabled={portalBusy}
            onPress={() => void openCustomerPortal()}
          >
            {portalBusy ? (
              <ActivityIndicator color="#0b1220" />
            ) : (
              <Text style={styles.ctaText}>Update payment details</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {!isActive && status !== 'past_due' ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Monthly plan — £19.99 / month</Text>
            <Text style={styles.cardBody}>· Unlimited questionnaire-based style reports</Text>
            <Text style={styles.cardBody}>· Unlimited clients and colour-season PDF reports</Text>
            <Text style={styles.cardBody}>· Cancel anytime from the Stripe billing portal</Text>
          </View>

          <Pressable
            style={[styles.ctaPrimary, checkoutBusy ? styles.ctaDisabled : null]}
            disabled={checkoutBusy}
            onPress={() => void openCheckout()}
          >
            {checkoutBusy ? (
              <ActivityIndicator color="#0b1220" />
            ) : (
              <Text style={styles.ctaPrimaryText}>Subscribe</Text>
            )}
          </Pressable>
          <Text style={styles.legalStripe}>Payments are securely processed by Stripe.</Text>

          {(status === 'inactive' || status === 'cancelled') && (
            <Pressable
              style={[styles.secondaryBtn, portalBusy ? styles.ctaDisabled : null]}
              disabled={portalBusy}
              onPress={() => void openCustomerPortal()}
            >
              {portalBusy ? (
                <ActivityIndicator color="#C4956A" />
              ) : (
                <Text style={styles.secondaryBtnText}>Open billing portal</Text>
              )}
            </Pressable>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0b1220' },
  container: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b1220', gap: 12 },
  muted: { color: '#94a3b8' },
  errorBanner: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    marginBottom: 16,
  },
  errorText: { color: '#fecaca', fontSize: 14 },
  errorRetry: { color: '#fdba74', marginTop: 6, fontSize: 13, textDecorationLine: 'underline' },
  title: { color: '#f8fafc', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#94a3b8', marginTop: 10, marginBottom: 20, fontSize: 14, lineHeight: 20 },
  card: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    marginBottom: 16,
  },
  cardTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardLine: { color: '#cbd5e1', fontSize: 15, marginBottom: 10 },
  em: { color: '#C4956A', fontWeight: '700' },
  cardBody: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginTop: 4 },
  warnCard: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
    marginBottom: 16,
  },
  warnTitle: { color: '#fde68a', fontSize: 17, fontWeight: '700', marginBottom: 8 },
  warnBody: { color: '#fef3c7', fontSize: 14, lineHeight: 20, marginBottom: 14 },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: '#C4956A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.65 },
  ctaText: { color: '#0b1220', fontWeight: '800', fontSize: 15 },
  ctaPrimary: {
    marginTop: 4,
    backgroundColor: '#C4956A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaPrimaryText: { color: '#0b1220', fontWeight: '800', fontSize: 16 },
  legalStripe: { color: '#64748b', fontSize: 12, marginTop: 12, textAlign: 'center' },
  secondaryBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,149,106,0.5)',
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#C4956A', fontWeight: '700', fontSize: 15 },
});
