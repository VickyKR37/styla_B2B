export type Profile = {
  id: string;
  /** Display name for the image consultant (see `profiles.consultant_name` in Supabase). */
  consultant_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type Payment = {
  id: string;
  /** Owning stylista user (image consultant); column `consultant_id` in DB. */
  consultant_id: string;
  paypal_transaction_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
};

export type QuestionnaireAnswer = {
  id: string;
  /** Consultant who submitted or owns this questionnaire record. */
  consultant_id: string;
  answers: Record<string, unknown>;
  submitted_at: string;
};

export type ReportPaletteItem = {
  hex: string;
  label: string;
};

export type Report = {
  id: string;
  /** Consultant who generated the report. */
  consultant_id: string;
  questionnaire_id: string;
  /** End client identifiers when you store per-client rows (optional depending on schema). */
  client_id?: string | null;
  client_name?: string | null;
  season: string | null;
  colour_palette: ReportPaletteItem[] | null;
  recommendations: Record<string, unknown> | null;
  pdf_url: string | null;
  created_at: string;
};
