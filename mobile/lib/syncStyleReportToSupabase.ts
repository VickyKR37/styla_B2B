import type { QuestionnaireData } from '../src/features/styleAnalysis/types';

import { supabase } from './supabase';

export const STYLE_ANALYSIS_REPORT_DATA_KIND = 'style_analysis_report_v1' as const;

/**
 * Persist a questionnaire-generated style report to `clients` + `reports`.
 * Matches an existing client by exact `full_name` (trimmed) for this consultant, or inserts a row.
 */
export async function syncGeneratedStyleReportToSupabase(opts: {
  consultantId: string;
  clientDisplayName: string;
  reportText: string;
  questionnaire: QuestionnaireData;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const name = opts.clientDisplayName.trim();
  if (!name) {
    return { ok: false, message: 'Client name is required to save.' };
  }

  const { data: existing, error: findErr } = await supabase
    .from('clients')
    .select('id')
    .eq('consultant_id', opts.consultantId)
    .eq('full_name', name)
    .limit(1)
    .maybeSingle();

  if (findErr) {
    return { ok: false, message: findErr.message };
  }

  let clientId = existing?.id as string | undefined;

  if (!clientId) {
    const { data: inserted, error: insertErr } = await supabase
      .from('clients')
      .insert({
        consultant_id: opts.consultantId,
        full_name: name,
        email: null,
        notes: null,
      })
      .select('id')
      .single();
    if (insertErr || !inserted?.id) {
      return { ok: false, message: insertErr?.message ?? 'Could not create client.' };
    }
    clientId = inserted.id as string;
  }

  const { error: reportErr } = await supabase.from('reports').insert({
    consultant_id: opts.consultantId,
    client_id: clientId,
    colour_season: null,
    report_data: {
      kind: STYLE_ANALYSIS_REPORT_DATA_KIND,
      text: opts.reportText,
      questionnaire: opts.questionnaire,
      generated_at: new Date().toISOString(),
    },
    pdf_url: null,
    order_id: null,
  });

  if (reportErr) {
    return { ok: false, message: reportErr.message };
  }

  return { ok: true };
}
