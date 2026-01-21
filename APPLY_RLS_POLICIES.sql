-- =========================
-- RLS Policies: job_postings
-- =========================
-- Gerado pela IA do Supabase para corrigir problema de exclusão de anúncios

-- Enable RLS if not already enabled (no efeito se já estiver)
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- UPDATE: permitir usuários atualizarem apenas seus próprios job_postings
DROP POLICY IF EXISTS "Users can update own jobs" ON public.job_postings;
CREATE POLICY "Users can update own jobs"
  ON public.job_postings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = public.job_postings.user_id
        AND users.auth_id = auth.uid()
    )
  );

-- DELETE: permitir usuários deletarem apenas seus próprios job_postings
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.job_postings;
CREATE POLICY "Users can delete own jobs"
  ON public.job_postings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = public.job_postings.user_id
        AND users.auth_id = auth.uid()
    )
  );

-- INSERT: permitir usuários criarem job_postings (com checagem do user_id)
DROP POLICY IF EXISTS "Users can insert own jobs" ON public.job_postings;
CREATE POLICY "Users can insert own jobs"
  ON public.job_postings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = public.job_postings.user_id
        AND users.auth_id = auth.uid()
    )
  );

-- ============================
-- RLS Policies: worker_services
-- ============================

-- Enable RLS if not already enabled (no efeito se já estiver)
ALTER TABLE public.worker_services ENABLE ROW LEVEL SECURITY;

-- UPDATE: permitir usuários atualizarem apenas seus próprios worker_services
DROP POLICY IF EXISTS "Users can update own services" ON public.worker_services;
CREATE POLICY "Users can update own services"
  ON public.worker_services
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = public.worker_services.user_id
        AND users.auth_id = auth.uid()
    )
  );

-- DELETE: permitir usuários deletarem apenas seus próprios worker_services
DROP POLICY IF EXISTS "Users can delete own services" ON public.worker_services;
CREATE POLICY "Users can delete own services"
  ON public.worker_services
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = public.worker_services.user_id
        AND users.auth_id = auth.uid()
    )
  );

-- INSERT: permitir usuários criarem worker_services (com checagem do user_id)
DROP POLICY IF EXISTS "Users can insert own services" ON public.worker_services;
CREATE POLICY "Users can insert own services"
  ON public.worker_services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = public.worker_services.user_id
        AND users.auth_id = auth.uid()
    )
  );

-- =========================
-- Quick validation query
-- =========================
-- Lista as políticas existentes para as duas tabelas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('job_postings', 'worker_services')
ORDER BY tablename, cmd;
