import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'AddClient'>;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function AddClientScreen({ navigation }: Props) {
  const clientIdRef = useRef<string | null>(null);
  const fullNameRef = useRef('');
  const skipInitialSaveRef = useRef(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  fullNameRef.current = fullName;

  useEffect(() => {
    let cancelled = false;

    async function insertBlank(): Promise<void> {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        setBootError('You must be signed in.');
        setBootLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('clients')
        .insert({
          consultant_id: uid,
          full_name: null,
          email: null,
          notes: null,
        })
        .select('id')
        .single();
      if (cancelled) return;
      if (error || !data?.id) {
        setBootError(error?.message ?? 'Could not create client draft.');
        setBootLoading(false);
        return;
      }
      clientIdRef.current = data.id;
      setClientId(data.id);
      setBootLoading(false);
    }

    void insertBlank();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!clientId) return;
    if (skipInitialSaveRef.current) {
      skipInitialSaveRef.current = false;
      return;
    }
    const handle = setTimeout(() => {
      void (async () => {
        const id = clientIdRef.current;
        if (!id) return;
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user?.id;
        if (!uid) return;
        setSaveStatus('saving');
        setSaveMessage(null);
        const { error } = await supabase
          .from('clients')
          .update({
            full_name: fullName.trim() ? fullName.trim() : null,
            email: email.trim() ? email.trim() : null,
          })
          .eq('id', id)
          .eq('consultant_id', uid);
        if (error) {
          setSaveStatus('error');
          setSaveMessage(error.message);
          return;
        }
        setSaveStatus('saved');
        setSaveMessage(null);
        setTimeout(() => setSaveStatus('idle'), 1600);
      })();
    }, 500);

    return () => clearTimeout(handle);
  }, [clientId, fullName, email]);

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', (e) => {
      const id = clientIdRef.current;
      if (!id) return;
      if (fullNameRef.current.trim().length > 0) return;
      e.preventDefault();
      void (async () => {
        await supabase.from('clients').delete().eq('id', id);
        navigation.dispatch(e.data.action);
      })();
    });
    return sub;
  }, [navigation]);

  const saveHint = useMemo(() => {
    if (saveStatus === 'saving') return 'Saving…';
    if (saveStatus === 'saved') return 'Saved ✓';
    if (saveStatus === 'error') return saveMessage ? `Error: ${saveMessage}` : 'Save failed';
    return '';
  }, [saveMessage, saveStatus]);

  if (bootLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#C4956A" size="large" />
        <Text style={styles.muted}>Preparing new client…</Text>
      </View>
    );
  }

  if (bootError || !clientId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{bootError ?? 'Missing client id.'}</Text>
        <Pressable style={styles.retry} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <View style={styles.savePill}>
        <Text style={styles.savePillText}>{saveHint}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Client name"
          placeholderTextColor="#64748b"
          autoCapitalize="words"
        />
        <Text style={styles.label}>Email (optional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#0b1220' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0b1220' },
  muted: { color: '#94a3b8', marginTop: 12 },
  error: { color: '#fecaca', textAlign: 'center', marginBottom: 16 },
  retry: { padding: 12 },
  retryText: { color: '#C4956A', fontWeight: '700' },
  savePill: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  savePillText: { color: '#cbd5e1', fontSize: 12 },
  form: { padding: 20, paddingTop: 48 },
  label: { color: '#e2e8f0', fontWeight: '700', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#f8fafc',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
