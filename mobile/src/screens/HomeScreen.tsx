import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { usePaymentAccess } from '../../context/PaymentAccessContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { signOut } = useAuth();
  const { hasAccessFor, loading } = usePaymentAccess();

  function openStyleAnalysis() {
    if (loading) return;
    if (hasAccessFor('style')) {
      navigation.navigate('StyleAnalysis');
      return;
    }
    navigation.navigate('Payment', { target: 'StyleAnalysis' });
  }

  function openColourAnalysis() {
    if (loading) return;
    if (hasAccessFor('colour')) {
      navigation.navigate('ColourAnalysis');
      return;
    }
    navigation.navigate('Payment', { target: 'ColourAnalysis' });
  }

  function openBundleOffer() {
    if (loading) return;
    navigation.navigate('Payment', { target: 'Bundle' });
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Styla</Text>
        <Pressable onPress={() => void signOut()} style={styles.signOutBtn} hitSlop={8}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>Choose a feature to continue (payment required).</Text>

        <Pressable style={styles.card} onPress={openStyleAnalysis}>
          <Text style={styles.cardTitle}>Style analysis</Text>
          <Text style={styles.cardBody}>Please note this analysis is designed only for women. Answer a few questions to get personalised style guidance. 
          To answer the questions you'll need to wear something in which you can clearly see your shape, measuring tape, a straight, long stick (like a metre stick) and a full length mirror. Please answer the questions accurately the first time because you won't be able to edit your answers once you have received your report.</Text>
          <Text style={styles.priceTag}>£19.99</Text>
        </Pressable>

        <Pressable style={[styles.card, styles.cardSpacer]} onPress={openColourAnalysis}>
          <Text style={styles.cardTitle}>Colour analysis</Text>
          <Text style={styles.cardBody}>Upload or take a photo to find your season and palette.</Text>
          <Text style={styles.priceTag}>£6.99</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.bundleButton, pressed ? styles.bundleButtonPressed : null]}
          onPress={openBundleOffer}
        >
          <Text style={styles.bundleButtonTitle}>Bundle offer</Text>
          <Text style={styles.bundleButtonSubtitle}>Both analyses for £24.99</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0b1220',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 4,
    gap: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700',
    flex: 1,
  },
  signOutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  signOutText: {
    color: '#94a3b8',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  cardSpacer: {
    marginTop: 12,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBody: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  priceTag: {
    color: '#C4956A',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
  },
  bundleButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(196, 149, 106, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(196, 149, 106, 0.55)',
    alignItems: 'center',
  },
  bundleButtonPressed: {
    opacity: 0.88,
  },
  bundleButtonTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  bundleButtonSubtitle: {
    color: '#C4956A',
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
  },
});

