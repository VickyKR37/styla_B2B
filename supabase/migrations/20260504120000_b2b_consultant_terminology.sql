-- Styla B2B terminology: authenticated app users are consultants; reports are prepared for end clients.
-- Apply from the Supabase SQL editor or via `supabase db push` after reviewing your live schema.

-- Audit log consent: link row to consultant account (logged-in Styla user)
ALTER TABLE IF EXISTS public.consent_log RENAME COLUMN user_id TO consultant_id;

-- Profiles: display name on consultant account (pairs with auth.users)
ALTER TABLE IF EXISTS public.profiles RENAME COLUMN full_name TO consultant_name;

-- Example follow-ups (rename when these tables exist in your project):
-- ALTER TABLE IF EXISTS public.payments RENAME COLUMN user_id TO consultant_id;
-- ALTER TABLE IF EXISTS public.questionnaire_answers RENAME COLUMN user_id TO consultant_id;
-- ALTER TABLE IF EXISTS public.reports RENAME COLUMN user_id TO consultant_id;
-- Then add nullable client-scoped identifiers as needed:
-- ALTER TABLE IF EXISTS public.reports ADD COLUMN IF NOT EXISTS client_id uuid;
-- ALTER TABLE IF EXISTS public.reports ADD COLUMN IF NOT EXISTS client_name text;

-- Recreate any Row Level Security policies that referenced consent_log.user_id; clauses should now use consultant_id.
