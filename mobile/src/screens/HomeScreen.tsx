import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { usePaymentAccess } from '../../context/PaymentAccessContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { signOut } = useAuth();
  const { hasStyleAccess, loading } = usePaymentAccess();

  function openStyleAnalysis() {
    if (loading) return;
    if (hasStyleAccess) {
      navigation.navigate('StyleAnalysis');
      return;
    }
    navigation.navigate('Payment');
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
        <Text style={styles.welcomeHeading}>Welcome, image consultant</Text>
        <Text style={styles.subtitle}>
          Use Styla to capture client measurements and export style reports you can hand to your clients.
        </Text>

        <Pressable style={styles.card} onPress={openStyleAnalysis}>
          <Text style={styles.cardTitle}>New client style report</Text>
          <Text style={styles.cardBody}>
            This analysis is meant for women clients only. Run through the steps with your client present (or capture
            verified details on her behalf). Your client will need a full-length mirror, a measuring tape, a straight
            long stick (such as a metre stick), and fitted clothing that lets you see her shape clearly. Answers
            lock in after the report is generated—you can’t edit them afterward, so double-check before proceeding.
          </Text>
          <Text style={styles.priceTag}>Professional access — £19.99</Text>
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
  welcomeHeading: {
    color: '#f8fafc',
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
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
});
