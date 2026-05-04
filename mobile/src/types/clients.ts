/** Mirrors `public.clients` (consultant-managed end clients). */
export type ClientRow = {
  id: string;
  consultant_id: string;
  full_name: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Mirrors `public.reports`; `pdf_url` stores storage object path `{consultant_id}/{file}.pdf`. */
export type ReportRow = {
  id: string;
  consultant_id: string;
  client_id: string;
  colour_season: string | null;
  report_data: unknown | null;
  pdf_url: string | null;
  order_id: string | null;
  created_at: string;
  updated_at: string;
};
