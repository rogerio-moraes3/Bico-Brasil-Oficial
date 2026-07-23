-- Liga RLS nas últimas 7 tabelas que ainda estavam totalmente abertas.
-- Grupo 1: sem uso nenhum no app hoje — bloqueio total, só service_role
ALTER TABLE public.ads_highlight ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_full_access ON public.ads_highlight
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.payments_backup ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_full_access ON public.payments_backup
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_full_access ON public.user_credits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.signup_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_full_access ON public.signup_errors
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Grupo 2: destaque_orders — dono vê o próprio pedido (user_id = auth.uid() direto,
-- diferente de payments), resto só service_role
ALTER TABLE public.destaque_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY destaque_orders_select_own
ON public.destaque_orders FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY service_role_full_access ON public.destaque_orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Grupo 3: job_applications — candidato ou dono da vaga veem; candidato insere a própria
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY job_applications_select_owner_or_posting_owner
ON public.job_applications FOR SELECT TO authenticated
USING (
  applicant_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.job_postings jp
    WHERE jp.id = job_applications.job_posting_id
    AND jp.user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY job_applications_insert_own
ON public.job_applications FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND applicant_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

CREATE POLICY service_role_full_access ON public.job_applications
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Grupo 4: plans — leitura pública (tabela de referência, sem dado sensível)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_public_select
ON public.plans FOR SELECT TO public
USING (true);

CREATE POLICY service_role_full_access ON public.plans
  FOR ALL TO service_role USING (true) WITH CHECK (true);
