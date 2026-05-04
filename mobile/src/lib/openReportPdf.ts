import * as WebBrowser from 'expo-web-browser';

import { supabase } from '../../lib/supabase';

const REPORTS_BUCKET = 'reports';

/** Signed URL TTL: ~1 year (seconds). */
const SIGNED_SECONDS = 60 * 60 * 24 * 365;

/**
 * Stored `pdf_url` is expected to be a storage **path** in bucket `reports`,
 * e.g. `{consultant_id}/abc.pdf`. If the value starts with http(s), it is opened as-is (fallback).
 */
export async function openReportPdfWithFreshUrl(pdfUrlOrPath: string | null): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!pdfUrlOrPath?.trim()) {
    return { ok: false, message: 'No PDF is attached to this report.' };
  }
  const trimmed = pdfUrlOrPath.trim();
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      await WebBrowser.openBrowserAsync(trimmed);
      return { ok: true };
    }
    const { data, error } = await supabase.storage.from(REPORTS_BUCKET).createSignedUrl(trimmed, SIGNED_SECONDS);
    if (error || !data?.signedUrl) {
      return {
        ok: false,
        message: error?.message ?? 'Could not create a viewing link for this PDF.',
      };
    }
    await WebBrowser.openBrowserAsync(data.signedUrl);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Something went wrong opening the PDF.';
    return { ok: false, message };
  }
}
