export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type Payment = {
  id: string;
  user_id: string;
  paypal_transaction_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
};

export type QuestionnaireAnswer = {
  id: string;
  user_id: string;
  answers: Record<string, unknown>;
  submitted_at: string;
};

export type ReportPaletteItem = {
  hex: string;
  label: string;
};

export type Report = {
  id: string;
  user_id: string;
  questionnaire_id: string;
  season: string | null;
  colour_palette: ReportPaletteItem[] | null;
  recommendations: Record<string, unknown> | null;
  pdf_url: string | null;
  created_at: string;
};
