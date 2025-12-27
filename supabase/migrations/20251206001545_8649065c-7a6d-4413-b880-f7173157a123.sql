-- ============================================
-- CORREÇÕES DE SEGURANÇA PARA LANÇAMENTO
-- ============================================

-- 1. Adicionar RLS policy de rate limit na criação de pagamentos
-- Isso impede que usuários criem múltiplos pagamentos pendentes em curto período
CREATE POLICY "Rate limit payment creation" ON public.payments
FOR INSERT
WITH CHECK (
  public.can_create_payment(
    (SELECT id FROM users WHERE auth_id = auth.uid())
  )
);

-- 2. Converter views para SECURITY INVOKER (resolve warnings do linter)

-- 2.1 Recriar public_worker_profiles com SECURITY INVOKER
DROP VIEW IF EXISTS public.public_worker_profiles;
CREATE VIEW public.public_worker_profiles
WITH (security_invoker = true) AS
SELECT 
  id, name, type, city, city_id, neighborhood, state,
  category, subcategory, description, availability, price,
  profile_photo, verified, rating_avg, rating_count,
  jobs_done, plan_active, subscription_end, destaque_expires_at, created_at
FROM users
WHERE type IN ('worker', 'contractor');

-- 2.2 Recriar ranking_top_workers com SECURITY INVOKER
DROP VIEW IF EXISTS public.ranking_top_workers;
CREATE VIEW public.ranking_top_workers
WITH (security_invoker = true) AS
SELECT 
  u.id,
  u.name,
  u.profile_photo,
  u.category,
  u.subcategory,
  u.rating_avg,
  u.rating_count,
  u.jobs_done,
  u.verified,
  u.destaque_expires_at,
  COUNT(DISTINCT j.id) AS total_jobs,
  COUNT(DISTINCT CASE WHEN j.status = 'done' THEN j.id END) AS completed_jobs
FROM users u
LEFT JOIN jobs j ON j.worker_id = u.id
WHERE u.type = 'worker'
GROUP BY u.id, u.name, u.profile_photo, u.category, u.subcategory, 
         u.rating_avg, u.rating_count, u.jobs_done, u.verified, u.destaque_expires_at
ORDER BY u.rating_avg DESC NULLS LAST, u.jobs_done DESC NULLS LAST;

-- 2.3 Recriar ranking_top_contractors com SECURITY INVOKER
DROP VIEW IF EXISTS public.ranking_top_contractors;
CREATE VIEW public.ranking_top_contractors
WITH (security_invoker = true) AS
SELECT 
  u.id,
  u.name,
  u.profile_photo,
  u.usage_count,
  u.last_usage_at,
  COUNT(DISTINCT jp.id) AS total_job_postings,
  COUNT(DISTINCT j.id) AS total_jobs,
  COUNT(DISTINCT CASE WHEN j.status = 'done' THEN j.id END) AS completed_jobs,
  (COALESCE(u.usage_count, 0) + COUNT(DISTINCT jp.id) + COUNT(DISTINCT j.id)) AS activity_score
FROM users u
LEFT JOIN job_postings jp ON jp.user_id = u.id
LEFT JOIN jobs j ON j.contractor_id = u.id
WHERE u.type = 'contractor'
GROUP BY u.id, u.name, u.profile_photo, u.usage_count, u.last_usage_at
ORDER BY activity_score DESC NULLS LAST;

-- 2.4 Recriar ranking_top_jobs com SECURITY INVOKER
DROP VIEW IF EXISTS public.ranking_top_jobs;
CREATE VIEW public.ranking_top_jobs
WITH (security_invoker = true) AS
SELECT 
  jp.id,
  jp.title,
  jp.description,
  jp.category_id,
  jp.urgent,
  jp.created_at,
  u.name AS contractor_name,
  u.profile_photo AS contractor_photo,
  COUNT(DISTINCT jv.id) AS views_count,
  COUNT(DISTINCT jc.id) AS contacts_count,
  (COUNT(DISTINCT jv.id) + COUNT(DISTINCT jc.id) * 3) AS popularity_score
FROM job_postings jp
JOIN users u ON u.id = jp.user_id
LEFT JOIN job_views jv ON jv.job_id = jp.id
LEFT JOIN job_contacts jc ON jc.job_id = jp.id
WHERE jp.status = 'open'
GROUP BY jp.id, jp.title, jp.description, jp.category_id, jp.urgent, jp.created_at, 
         u.name, u.profile_photo
ORDER BY popularity_score DESC NULLS LAST;

-- 3. Criar tabela de audit log para registrar ações sensíveis
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  user_id uuid,
  ip_address text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS na tabela de audit
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs de auditoria
CREATE POLICY "Admins can view audit logs"
ON public.audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Service role pode inserir logs (para edge functions)
CREATE POLICY "Service can insert audit logs"
ON public.audit_log FOR INSERT
WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);

-- ============================================
-- FIM DAS CORREÇÕES DE SEGURANÇA
-- ============================================