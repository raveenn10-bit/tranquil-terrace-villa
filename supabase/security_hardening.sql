-- =============================================================================
-- Tranquil Terrace Villa - Supabase RLS Security Hardening & Zero-Trust Audit
-- =============================================================================

-- 1. Ensure Row Level Security (RLS) is strictly enabled on all tables
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;

-- 2. Revoke all public / anonymous permissions on tables and sequences
REVOKE ALL ON TABLE public.bookings FROM anon, authenticated;
REVOKE ALL ON TABLE public.guests FROM anon, authenticated;
REVOKE ALL ON TABLE public.settings FROM anon, authenticated;

-- 3. Explicitly grant full permissions to service_role (the privileged server backend)
GRANT ALL ON TABLE public.bookings TO service_role;
GRANT ALL ON TABLE public.guests TO service_role;
GRANT ALL ON TABLE public.settings TO service_role;

-- 4. Create explicit Service Role RLS Policies (Zero browser/anon access)
DROP POLICY IF EXISTS "Service role full access on bookings" ON public.bookings;
CREATE POLICY "Service role full access on bookings"
  ON public.bookings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on guests" ON public.guests;
CREATE POLICY "Service role full access on guests"
  ON public.guests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on settings" ON public.settings;
CREATE POLICY "Service role full access on settings"
  ON public.settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Verify RLS status
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('bookings', 'guests', 'settings');
