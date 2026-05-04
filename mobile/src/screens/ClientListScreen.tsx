import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import type { ClientRow } from '../types/clients';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientList'>;

export function ClientListScreen({ navigation }: Props) {
  const [clients, setClients] = useState<Pick<ClientRow, 'id' | 'full_name' | 'email' | 'created_at'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) {
      setError('Not signed in.');
      setClients([]);
      return;
    }
    const { data, error: qErr } = await supabase
      .from('clients')
      .select('id, full_name, email, created_at')
      .eq('consultant_id', uid)
      .order('created_at', { ascending: false });
    if (qErr) {
      setError(qErr.message);
      setClients([]);
      return;
    }
    setClients((data ?? []) as typeof clients);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      await fetchClients();
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [fetchClients]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  }, [fetchClients]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#C4956A" size="large" />
        <Text style={styles.muted}>Loading clients…</Text>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      {error ? (
        <Pressable style={styles.errorBanner} onPress={() => void fetchClients()}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorRetry}>Tap to retry</Text>
        </Pressable>
      ) : null}

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#C4956A" />}
        ListEmptyComponent={
          <Text style={styles.empty}>No clients yet. Tap “New client” to add one.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
          >
            <Text style={styles.rowTitle}>{item.full_name?.trim() ? item.full_name.trim() : 'Unnamed client'}</Text>
            <Text style={styles.rowSubtitle}>{item.email?.trim() ? item.email : 'No email'}</Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddClient')}>
        <Text style={styles.fabText}>New client</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#0b1220' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#0b1220' },
  muted: { color: '#94a3b8', marginTop: 8 },
  listContent: { padding: 16, paddingBottom: 100 },
  errorBanner: {
    margin: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  errorText: { color: '#fecaca', fontSize: 14 },
  errorRetry: { color: '#fed7aa', marginTop: 6, fontSize: 13, textDecorationLine: 'underline' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
  row: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  rowTitle: { color: '#f8fafc', fontSize: 17, fontWeight: '700' },
  rowSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 6 },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#C4956A',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  fabText: { color: '#0b1220', fontWeight: '800', fontSize: 15 },
});
