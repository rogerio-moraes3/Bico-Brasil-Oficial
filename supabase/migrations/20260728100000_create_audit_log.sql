-- audit_log foi definida numa migration anterior (20251206001545) mas nunca
-- chegou a ser aplicada em produção (mesmo schema drift recorrente do
-- projeto) — recover-by-cpf já chama .insert() nela a cada tentativa de
-- recuperação de senha, falhando silenciosamente sem essa tabela existir.

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

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_log FOR SELECT
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Service can insert audit logs"
ON public.audit_log FOR INSERT
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
