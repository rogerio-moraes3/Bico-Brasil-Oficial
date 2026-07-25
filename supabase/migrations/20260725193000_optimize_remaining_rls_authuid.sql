-- Completa a otimização de RLS (auth.uid() -> (select auth.uid())) nas
-- tabelas que ficaram de fora da leva de hoje: job_applications,
-- notifications, destaque_orders. Mesma lógica de acesso, só a forma
-- otimizada (avaliada uma vez por consulta em vez de uma vez por linha).

DROP POLICY IF EXISTS "job_applications_insert_own" ON public.job_applications;
CREATE POLICY "job_applications_insert_own"
  ON public.job_applications FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND applicant_id = (SELECT users.id FROM public.users WHERE users.auth_id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "job_applications_select_owner_or_posting_owner" ON public.job_applications;
CREATE POLICY "job_applications_select_owner_or_posting_owner"
  ON public.job_applications FOR SELECT
  USING (
    applicant_id = (SELECT users.id FROM public.users WHERE users.auth_id = (SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.job_postings jp
      WHERE jp.id = job_applications.job_posting_id
        AND jp.user_id = (SELECT users.id FROM public.users WHERE users.auth_id = (SELECT auth.uid()))
    )
    OR has_role((SELECT auth.uid()), 'admin')
  );

DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
CREATE POLICY "notifications_delete"
  ON public.notifications FOR DELETE
  USING (user_id = (SELECT auth.uid()) OR ((SELECT auth.jwt() ->> 'user_role') = 'admin'));

DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert"
  ON public.notifications FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()) OR ((SELECT auth.jwt() ->> 'user_role') = 'admin'));

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select"
  ON public.notifications FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR ((SELECT auth.jwt() ->> 'user_role') = 'admin'));

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update"
  ON public.notifications FOR UPDATE
  USING (user_id = (SELECT auth.uid()) OR ((SELECT auth.jwt() ->> 'user_role') = 'admin'))
  WITH CHECK (user_id = (SELECT auth.uid()) OR ((SELECT auth.jwt() ->> 'user_role') = 'admin'));

DROP POLICY IF EXISTS "destaque_orders_select_own" ON public.destaque_orders;
CREATE POLICY "destaque_orders_select_own"
  ON public.destaque_orders FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- Índices faltando (achado da auditoria: única FK sem índice nas tabelas
-- principais, além de worker_services.subcategory_id).
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_worker_services_subcategory_id ON public.worker_services(subcategory_id);
