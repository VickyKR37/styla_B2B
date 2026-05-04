import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { useSubscription } from '../hooks/useSubscription';
import { openReportPdfWithFreshUrl } from '../lib/openReportPdf';
import { STYLE_ANALYSIS_REPORT_DATA_KIND } from '../../lib/syncStyleReportToSupabase';
import { supabase } from '../../lib/supabase';
import type { ClientRow, ReportRow } from '../types/clients';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientDetail'>;

type ReportLite = Pick<ReportRow, 'id' | 'colour_season' | 'created_at' | 'pdf_url' | 'report_data'>;

export function ClientDetailScreen({ navigation, route }: Props) {
  const { clientId } = route.params;
  const { isActive: subActive, loading: subLoading } = useSubscription();
  const [client, setClient] = useState<Pick<ClientRow, 'id' | 'full_name'> | null>(null);
  const [reports, setReports] = useState<ReportLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfOpeningId, setPdfOpeningId] = useState<string | null>(null);
  const [pdfErrorId, setPdfErrorId] = useState<{ id: string; message: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);

    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) {
      setError('Not signed in.');
      setClient(null);
      setReports([]);
      return;
    }

    const { data: cRow, error: cErr } = await supabase
      .from('clients')
      .select('id, full_name')
      .eq('id', clientId)
      .eq('consultant_id', uid)
      .maybeSingle();

    if (cErr) {
      setError(cErr.message);
      setClient(null);
      setReports([]);
      return;
    }
    if (!cRow) {
      setError('This client could not be found.');
      setClient(null);
      setReports([]);
      return;
    }

    setClient(cRow as typeof client);

    const { data: rRows, error: rErr } = await supabase
      .from('reports')
      .select('id, colour_season, created_at, pdf_url, report_data')
      .eq('client_id', clientId)
      .eq('consultant_id', uid)
      .order('created_at', { ascending: false });

    if (rErr) {
      setError(rErr.message);
      setReports([]);
      return;
    }
    setReports((rRows ?? []) as ReportLite[]);
  }, [clientId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      await load();
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  async function onViewPdf(report: ReportLite) {
    setPdfErrorId(null);
    setPdfOpeningId(report.id);
    const result = await openReportPdfWithFreshUrl(report.pdf_url);
    setPdfOpeningId(null);
    if (!result.ok) {
      setPdfErrorId({ id: report.id, message: result.message });
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#C4956A" size="large" />
        <Text style={styles.muted}>Loading client…</Text>
      </View>
    );
  }

  if (error && !client) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retry} onPress={() => void load()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
        <Pressable style={styles.retry} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      {error ? (
        <Pressable style={styles.warnBanner} onPress={() => void load()}>
          <Text style={styles.warnText}>{error}</Text>
          <Text style={styles.warnRetry}>Tap to retry</Text>
        </Pressable>
      ) : null}

      {!subLoading && !subActive ? (
        <View style={styles.subscribeBanner}>
          <Text style={styles.subscribeTitle}>Subscription required</Text>
          <Text style={styles.subscribeBody}>
            An active Styla subscription is required to add new reports. Subscribe for £19.99/month with unlimited reports.
          </Text>
          <Pressable style={styles.subscribeBtn} onPress={() => navigation.navigate('Subscription')}>
            <Text style={styles.subscribeBtnText}>View subscription</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.headerBlock}>
        <Text style={styles.clientName}>
          {client?.full_name?.trim() ? client.full_name.trim() : 'Unnamed client'}
        </Text>
        <Text style={styles.clientMeta}>Reports</Text>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#C4956A" />}
        ListEmptyComponent={
          <Text style={styles.empty}>No reports yet. Style analysis reports appear here after you generate them, or add a report with a PDF.</Text>
        }
        renderItem={({ item }) => {
          const created = formatDate(item.created_at);
          const season = formatReportTitle(item);
          const opening = pdfOpeningId === item.id;
          const rowErr = pdfErrorId?.id === item.id ? pdfErrorId.message : null;
          return (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{season}</Text>
              <Text style={styles.rowSubtitle}>{created}</Text>
              {rowErr ? <Text style={styles.rowError}>{rowErr}</Text> : null}
              <Pressable
                style={[styles.pdfBtn, !item.pdf_url ? styles.pdfBtnDisabled : null]}
                disabled={!item.pdf_url || opening}
                onPress={() => void onViewPdf(item)}
              >
                {opening ? (
                  <ActivityIndicator color="#0b1220" />
                ) : (
                  <Text style={styles.pdfBtnText}>View PDF</Text>
                )}
              </Pressable>
            </View>
          );
        }}
      />

      <Pressable
        style={[styles.fab, subLoading || !subActive ? styles.fabDisabled : null]}
        disabled={subLoading || !subActive}
        onPress={() => navigation.navigate('AddReport', { clientId })}
      >
        <Text style={styles.fabText}>{subLoading ? 'Checking access…' : 'Add report'}</Text>
      </Pressable>
    </View>
  );
}

function formatReportTitle(item: ReportLite): string {
  const cs = item.colour_season?.trim();
  if (cs) return cs;
  const rd = item.report_data;
  const kind =
    rd && typeof rd === 'object' && rd !== null && 'kind' in rd && typeof (rd as { kind: unknown }).kind === 'string'
      ? (rd as { kind: string }).kind
      : null;
  if (kind === STYLE_ANALYSIS_REPORT_DATA_KIND) return 'Style analysis report';
  return 'No colour season';
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#0b1220' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#0b1220' },
  muted: { color: '#94a3b8', marginTop: 8 },
  error: { color: '#fecaca', textAlign: 'center' },
  retry: { marginTop: 8, padding: 12 },
  retryText: { color: '#C4956A', fontWeight: '700' },
  warnBanner: {
    margin: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  warnText: { color: '#fde68a', fontSize: 14 },
  warnRetry: { color: '#fcd34d', marginTop: 6, fontSize: 13, textDecorationLine: 'underline' },
  headerBlock: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  clientName: { color: '#f8fafc', fontSize: 22, fontWeight: '800' },
  clientMeta: { color: '#94a3b8', marginTop: 6, fontSize: 13 },
  listContent: { padding: 16, paddingBottom: 100 },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 32, paddingHorizontal: 20 },
  row: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  rowTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  rowSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 6 },
  rowError: { color: '#fecaca', fontSize: 12, marginTop: 8 },
  pdfBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#C4956A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBtnDisabled: { opacity: 0.45 },
  pdfBtnText: { color: '#0b1220', fontWeight: '800' },
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
  fabDisabled: { opacity: 0.45 },
  subscribeBanner: {
    marginHorizontal: 12,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(196,149,106,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,106,0.35)',
  },
  subscribeTitle: { color: '#f8fafc', fontWeight: '800', fontSize: 16, marginBottom: 6 },
  subscribeBody: { color: '#cbd5e1', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  subscribeBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#C4956A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  subscribeBtnText: { color: '#0b1220', fontWeight: '800', fontSize: 14 },
});
