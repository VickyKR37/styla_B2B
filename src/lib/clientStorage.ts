/**
 * Browser persistence for questionnaire + report (survives tab close and return visits).
 * Use only from client components.
 */

export const STORAGE_KEYS = {
  PENDING_QUESTIONNAIRE: 'pendingQuestionnaireData_v2',
  GENERATED_REPORT: 'generatedReportData',
  PAYMENT_SUCCESS: 'paymentSuccessStatus',
  QUESTIONNAIRE_DRAFT: 'questionnaireDraft_v1',
} as const;

export function readLocalJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeLocalJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write localStorage key ${key}:`, e);
  }
}

export function removeLocalKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
