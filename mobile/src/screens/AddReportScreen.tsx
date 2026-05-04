import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'AddReport'>;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const REPORTS_BUCKET = 'reports';
const SIGNED_SECONDS = 60 * 60 * 24 * 365;

function newRandomFileName(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return `${c.randomUUID()}.pdf`;
  return `${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`;
}

export function AddReportScreen({ navigation, route }: Props) {
  const { clientId } = route.params;
  const reportIdRef = useRef<string | null>(null);
  const colourSeasonRef = useRef('');
  const pdfPathRef = useRef<string | null>(null);
  const skipInitialSaveRef = useRef(true);

  const [reportId, setReportId] = useState<string | null>(null);
  const [colourSeason, setColourSeason] = useState('');
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pdfSaved, setPdfSaved] = useState(false);

  colourSeasonRef.current = colourSeason;
  pdfPathRef.current = pdfPath;

  useEffect(() => {
    let cancelled = false;

    async function insertBlankReport(): Promise<void> {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        setBootError('You must be signed in.');
        setBootLoading(false);
        return;
      }
      const { data: okClient, error: clientErr } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('consultant_id', uid)
        .maybeSingle();
      if (cancelled) return;
      if (clientErr || !okClient) {
        setBootError(clientErr?.message ?? 'This client does not belong to your account.');
        setBootLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('reports')
        .insert({
          consultant_id: uid,
          client_id: clientId,
          colour_season: null,
          report_data: null,
          pdf_url: null,
          order_id: null,
        })
        .select('id')
        .single();
      if (cancelled) return;
      if (error || !data?.id) {
        setBootError(error?.message ?? 'Could not create report draft.');
        setBootLoading(false);
        return;
      }
      reportIdRef.current = data.id;
      setReportId(data.id);
      setBootLoading(false);
    }

    void insertBlankReport();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (!reportId) return;
    if (skipInitialSaveRef.current) {
      skipInitialSaveRef.current = false;
      return;
    }
    const handle = setTimeout(() => {
      void (async () => {
        const id = reportIdRef.current;
        if (!id) return;
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user?.id;
        if (!uid) return;
        setSaveStatus('saving');
        setSaveMessage(null);
        const trimmed = colourSeason.trim();
        const { error } = await supabase
          .from('reports')
          .update({
            colour_season: trimmed.length > 0 ? trimmed : null,
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
  }, [reportId, colourSeason]);

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', (e) => {
      const id = reportIdRef.current;
      if (!id) return;
      const cs = colourSeasonRef.current.trim();
      const pdf = pdfPathRef.current;
      if (cs.length > 0 || (pdf?.trim()?.length ?? 0) > 0) return;
      e.preventDefault();
      void (async () => {
        await supabase.from('reports').delete().eq('id', id);
        navigation.dispatch(e.data.action);
      })();
    });
    return sub;
  }, [navigation]);

  async function pickAndUploadPdf() {
    setUploadError(null);
    const id = reportIdRef.current;
    if (!id) return;

    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) {
      setUploadError('You must be signed in.');
      return;
    }

    let uri: string;
    try {
      const pick = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (pick.canceled || !pick.assets?.length) return;
      uri = pick.assets[0].uri;
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Could not pick a file.');
      return;
    }

    const storagePath = `${uid}/${newRandomFileName()}`;
    setUploadBusy(true);
    setUploadProgress(0);
    setPdfSaved(false);

    try {
      setUploadProgress(15);
      const fileRes = await fetch(uri);
      if (!fileRes.ok) {
        throw new Error('Could not read the selected PDF from your device.');
      }
      setUploadProgress(35);
      const blob = await fileRes.blob();

      const { error: uploadErr } = await supabase.storage.from(REPORTS_BUCKET).upload(storagePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/pdf',
      });
      setUploadProgress(70);
      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      const { error: signedErr } = await supabase.storage.from(REPORTS_BUCKET).createSignedUrl(storagePath, SIGNED_SECONDS);
      setUploadProgress(90);
      if (signedErr) {
        await supabase.storage.from(REPORTS_BUCKET).remove([storagePath]);
        throw new Error(signedErr.message);
      }

      const { error: rowErr } = await supabase
        .from('reports')
        .update({ pdf_url: storagePath })
        .eq('id', id)
        .eq('consultant_id', uid);
      if (rowErr) {
        await supabase.storage.from(REPORTS_BUCKET).remove([storagePath]);
        throw new Error(rowErr.message);
      }

      setPdfPath(storagePath);
      setUploadProgress(100);
      setPdfSaved(true);
      setTimeout(() => setPdfSaved(false), 4000);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploadBusy(false);
      setUploadProgress(0);
    }
  }

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
        <Text style={styles.muted}>Preparing new report…</Text>
      </View>
    );
  }

  if (bootError || !reportId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{bootError ?? 'Missing report id.'}</Text>
        <Pressable style={styles.retry} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <View style={styles.saveRow}>
        <Text style={styles.savePillText}>{saveHint}</Text>
        {pdfSaved ? <Text style={styles.pdfOk}>PDF saved ✓</Text> : null}
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Colour season</Text>
        <TextInput
          style={styles.input}
          value={colourSeason}
          onChangeText={setColourSeason}
          placeholder="e.g. Soft Autumn"
          placeholderTextColor="#64748b"
          autoCapitalize="words"
        />

        <Text style={styles.label}>PDF</Text>
        {pdfPath ? <Text style={styles.path}>Attached: {pdfPath}</Text> : <Text style={styles.hint}>No PDF uploaded yet.</Text>}

        {uploadError ? <Text style={styles.uploadErr}>{uploadError}</Text> : null}

        {uploadBusy ? (
          <View style={styles.progressBlock}>
            <ActivityIndicator color="#C4956A" />
            <Text style={styles.progressText}>{uploadProgress < 40 ? 'Reading file…' : 'Uploading to storage…'}</Text>
          </View>
        ) : null}

        <Pressable style={[styles.uploadBtn, uploadBusy ? styles.uploadBtnDisabled : null]} disabled={uploadBusy} onPress={() => void pickAndUploadPdf()}>
          <Text style={styles.uploadBtnText}>Upload PDF</Text>
        </Pressable>
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
  saveRow: {
    position: 'absolute',
    top: 8,
    right: 12,
    left: 12,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  savePillText: { color: '#cbd5e1', fontSize: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(15,23,42,0.9)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  pdfOk: { color: '#86efac', fontSize: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(34,197,94,0.45)', backgroundColor: 'rgba(22,101,52,0.25)' },
  form: { padding: 20, paddingTop: 56 },
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
  hint: { color: '#94a3b8', fontSize: 13 },
  path: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  uploadErr: { color: '#fecaca', marginTop: 10 },
  progressBlock: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  progressText: { color: '#cbd5e1', fontSize: 13 },
  uploadBtn: {
    alignSelf: 'flex-start',
    marginTop: 16,
    backgroundColor: '#C4956A',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { color: '#0b1220', fontWeight: '800', fontSize: 15 },
});
