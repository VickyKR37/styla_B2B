import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { usePaymentAccess } from '../../context/PaymentAccessContext';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;
type Plan = 'style' | 'colour' | 'both';

const PRICES: Record<Plan, string> = {
  style: '£19.99',
  colour: '£6.99',
  both: '£24.99',
};
const WAIVER_TEXT =
  'I agree that my digital content will be delivered immediately and I understand that I waive my 14-day right to cancel once delivery begins.';

const INVALID_CODE_MESSAGE = "That code isn't valid. Please check and try again.";

export function PaymentScreen({ navigation, route }: Props) {
  const { completePayment } = usePaymentAccess();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>(() => {
    if (route.params.target === 'Bundle') return 'both';
    return route.params.target === 'StyleAnalysis' ? 'style' : 'colour';
  });
  const [submitting, setSubmitting] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const destinationTitle = useMemo(() => {
    if (route.params.target === 'Bundle') return 'Style & Colour analyses';
    return route.params.target === 'StyleAnalysis' ? 'Style Analysis' : 'Colour Analysis';
  }, [route.params.target]);

  function navigateAfterPurchase() {
    if (route.params.target === 'Bundle') {
      if (selectedPlan === 'both') {
        navigation.replace('Home');
      } else if (selectedPlan === 'style') {
        navigation.replace('StyleAnalysis');
      } else {
        navigation.replace('ColourAnalysis');
      }
    } else {
      navigation.replace(route.params.target);
    }
  }

  async function logConsent(orderId: string) {
    if (!user?.id) return;
    const { error } = await supabase.from('consent_log').insert({
      user_id: user.id,
      consented_at: new Date().toISOString(),
      waiver_text: WAIVER_TEXT,
      order_id: orderId,
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Consent log insert failed:', error.message);
    }
  }

  async function handlePay() {
    if (!waiverAccepted) return;
    setSubmitting(true);
    try {
      const orderId = `order_${Date.now()}_${selectedPlan}`;
      if (!user?.id) {
        throw new Error('You must be logged in to complete payment.');
      }
      await completePayment(selectedPlan);
      await logConsent(orderId);
      navigateAfterPurchase();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not complete checkout.';
      Alert.alert('Checkout error', message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApplyDiscount() {
    setDiscountError(null);
    const trimmed = discountCode.trim();
    if (!trimmed || /[%_]/.test(trimmed)) {
      setDiscountError(INVALID_CODE_MESSAGE);
      return;
    }
    if (!waiverAccepted) {
      setDiscountError('Please accept the waiver above to apply a code.');
      return;
    }
    if (!user?.id) {
      setDiscountError('You must be logged in to apply a code.');
      return;
    }

    setApplyingDiscount(true);
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('id, code, is_active, uses_remaining')
        .ilike('code', trimmed)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const row = data;
      if (!row) {
        setDiscountError(INVALID_CODE_MESSAGE);
        return;
      }
      if (row.uses_remaining !== null && row.uses_remaining <= 0) {
        setDiscountError(INVALID_CODE_MESSAGE);
        return;
      }

      if (row.uses_remaining !== null) {
        const nextUses = row.uses_remaining - 1;
        const { data: updatedRows, error: updateError } = await supabase
          .from('discount_codes')
          .update({ uses_remaining: nextUses })
          .eq('id', row.id)
          .eq('uses_remaining', row.uses_remaining)
          .select('id');

        if (updateError || !updatedRows?.length) {
          setDiscountError(INVALID_CODE_MESSAGE);
          return;
        }
      }

      await completePayment(selectedPlan);
      const orderId = `beta_${Date.now()}_${selectedPlan}_${row.id}`;
      await logConsent(orderId);

      Alert.alert('Success', 'Beta code applied — enjoy your free analysis!', [
        { text: 'OK', onPress: () => navigateAfterPurchase() },
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Discount code apply failed:', e);
      setDiscountError('Could not verify that code. Please try again.');
    } finally {
      setApplyingDiscount(false);
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Payment required</Text>
      <Text style={styles.subtitle}>Choose a payment option to access {destinationTitle}.</Text>

      <Pressable
        style={[styles.optionCard, selectedPlan === 'style' ? styles.optionCardSelected : null]}
        onPress={() => setSelectedPlan('style')}
      >
        <Text style={styles.optionTitle}>Style Analysis</Text>
        <Text style={styles.optionPrice}>{PRICES.style}</Text>
      </Pressable>

      <Pressable
        style={[styles.optionCard, selectedPlan === 'colour' ? styles.optionCardSelected : null]}
        onPress={() => setSelectedPlan('colour')}
      >
        <Text style={styles.optionTitle}>Colour Analysis</Text>
        <Text style={styles.optionPrice}>{PRICES.colour}</Text>
      </Pressable>

      <Pressable
        style={[styles.optionCard, selectedPlan === 'both' ? styles.optionCardSelected : null]}
        onPress={() => setSelectedPlan('both')}
      >
        <Text style={styles.optionTitle}>Both analyses</Text>
        <Text style={styles.optionPrice}>{PRICES.both}</Text>
      </Pressable>

      <Pressable
        style={styles.waiverRow}
        onPress={() => setWaiverAccepted((prev) => !prev)}
      >
        <View style={[styles.checkbox, waiverAccepted ? styles.checkboxChecked : null]}>
          {waiverAccepted ? <Text style={styles.checkboxTick}>✓</Text> : null}
        </View>
        <Text style={styles.waiverText}>{WAIVER_TEXT}</Text>
      </Pressable>

      <Text style={styles.discountLabel}>Discount Code</Text>
      <View style={styles.discountRow}>
        <TextInput
          style={styles.discountInput}
          value={discountCode}
          onChangeText={(t) => {
            setDiscountCode(t);
            if (discountError) setDiscountError(null);
          }}
          placeholder="Enter code"
          placeholderTextColor="#9C9A90"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!applyingDiscount}
        />
        <Pressable
          style={[styles.applyButton, applyingDiscount ? styles.applyButtonDisabled : null]}
          onPress={() => void handleApplyDiscount()}
          disabled={applyingDiscount}
        >
          {applyingDiscount ? (
            <ActivityIndicator color="#C4956A" />
          ) : (
            <Text style={styles.applyButtonText}>Apply</Text>
          )}
        </Pressable>
      </View>
      {discountError ? <Text style={styles.discountError}>{discountError}</Text> : null}

      <Pressable
        style={[styles.payButton, submitting || !waiverAccepted ? styles.payButtonDisabled : null]}
        onPress={handlePay}
        disabled={submitting || !waiverAccepted}
      >
        {submitting ? (
          <ActivityIndicator color="#FAF8F5" />
        ) : (
          <Text style={styles.payButtonText}>Pay {PRICES[selectedPlan]}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#FAF8F5',
    padding: 20,
    paddingBottom: 28,
  },
  title: {
    color: '#2C2C2A',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 18,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    borderColor: '#C4956A',
    backgroundColor: '#F8F2EB',
  },
  optionTitle: {
    color: '#2C2C2A',
    fontWeight: '700',
    fontSize: 16,
  },
  optionPrice: {
    color: '#6B7280',
    marginTop: 4,
    fontSize: 14,
  },
  payButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#C4956A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FAF8F5',
    fontSize: 16,
    fontWeight: '800',
  },
  waiverRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D3D1C7',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#C4956A',
    backgroundColor: '#F8F2EB',
  },
  checkboxTick: {
    color: '#C4956A',
    fontSize: 14,
    fontWeight: '800',
  },
  waiverText: {
    flex: 1,
    color: '#374151',
    fontSize: 13,
    lineHeight: 18,
  },
  discountLabel: {
    marginTop: 16,
    color: '#2C2C2A',
    fontSize: 13,
    fontWeight: '700',
  },
  discountRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discountInput: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    color: '#2C2C2A',
    fontSize: 15,
  },
  applyButton: {
    minWidth: 88,
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C4956A',
    backgroundColor: '#F8F2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    opacity: 0.65,
  },
  applyButtonText: {
    color: '#C4956A',
    fontSize: 15,
    fontWeight: '800',
  },
  discountError: {
    marginTop: 8,
    color: '#B3261E',
    fontSize: 13,
    lineHeight: 18,
  },
});
