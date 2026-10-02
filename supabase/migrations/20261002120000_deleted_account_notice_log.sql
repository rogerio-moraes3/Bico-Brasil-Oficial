-- Fila resumivel para o aviso as contas destruidas pelo cron de exclusao
-- automatica (ver INCIDENTS.md). Mesma ideia do
-- national_launch_notification_log: permite retomar depois de bater o limite
-- diario do Resend sem reenviar pra quem ja recebeu.
--
-- Diferenca importante: essas contas NAO existem mais. Nao ha public.users
-- nem auth.users pra referenciar — a unica identidade preservada e o e-mail
-- em auth.audit_log_entries. Por isso a chave aqui e o proprio e-mail.
CREATE TABLE public.deleted_account_notice_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  deleted_at timestamptz NOT NULL,
  -- 'skipped' = pessoa ja voltou por conta propria antes do aviso sair;
  -- convidar pra se cadastrar de novo so confundiria.
  email_status text NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'failed', 'skipped')),
  email_sent_at timestamptz,
  email_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);

-- RLS habilitada sem policies: acesso so via service role (mesmo padrao do
-- national_launch_notification_log) — a Edge Function e a unica que le/escreve.
ALTER TABLE public.deleted_account_notice_log ENABLE ROW LEVEL SECURITY;

-- Popula a fila com as 194 contas das tres janelas documentadas no
-- INCIDENTS.md. Os limites usam >= / < em vez de BETWEEN de proposito:
-- BETWEEN ... '04:00:18+00' corta a fracao de segundo do ultimo segundo da
-- janela e perde 3 linhas (da 191 em vez de 194).
INSERT INTO public.deleted_account_notice_log (email, deleted_at, email_status)
SELECT DISTINCT ON (lower(trim(e.payload->'traits'->>'user_email')))
  lower(trim(e.payload->'traits'->>'user_email')) AS email,
  e.created_at AS deleted_at,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM auth.users u
      WHERE lower(u.email) = lower(trim(e.payload->'traits'->>'user_email'))
    ) THEN 'skipped'
    ELSE 'pending'
  END AS email_status
FROM auth.audit_log_entries e
WHERE e.payload->>'action' = 'user_deleted'
  AND (
    (e.created_at >= '2026-09-11 04:24:54+00' AND e.created_at < '2026-09-11 04:24:57+00')
    OR (e.created_at >= '2026-09-14 04:00:10+00' AND e.created_at < '2026-09-14 04:00:19+00')
    OR (e.created_at >= '2026-09-15 04:00:08+00' AND e.created_at < '2026-09-15 04:00:10+00')
  )
  AND lower(trim(e.payload->'traits'->>'user_email')) ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
ORDER BY 1, e.created_at
ON CONFLICT (email) DO NOTHING;
