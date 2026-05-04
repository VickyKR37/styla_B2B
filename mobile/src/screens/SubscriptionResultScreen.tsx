import { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { useSubscription } from '../hooks/useSubscription';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionResult'>;

const POLL_MS = 2000;
const MAX_WAIT_MS = 10_000;

export function SubscriptionResultScreen({ navigation }: Props) {
  const { refetchIsActive } = useSubscription();
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    async function tick(): Promise<void> {
      while (!cancelled && Date.now() - started < MAX_WAIT_MS) {
        const active = await refetchIsActive();
        if (cancelled) return;
        if (active) {
          if (doneRef.current) return;
          doneRef.current = true;
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          Alert.alert('Subscription active', 'You now have unlimited client reports.');
          return;
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
      if (cancelled || doneRef.current) return;
      doneRef.current = true;
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      Alert.alert(
        'Still confirming',
        'If your payment went through, open Subscription from the home screen in a moment—it can take a short time to update.',
      );
    }

    void tick();
    return () => {
      cancelled = true;
    };
  }, [navigation, refetchIsActive]);

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#C4956A" />
      <Text style={styles.text}>Confirming your subscription…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1220',
    gap: 14,
    padding: 24,
  },
  text: { color: '#94a3b8', fontSize: 15, textAlign: 'center' },
});
