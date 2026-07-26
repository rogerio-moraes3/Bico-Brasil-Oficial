-- Segunda verificação para troca de e-mail via recuperação por CPF.
-- CPF não é segredo no Brasil, então trocar o e-mail de login só com o CPF
-- era uma porta aberta para takeover de conta. Este fluxo exige um código de
-- 6 dígitos enviado ao e-mail JÁ CADASTRADO antes de liberar a troca.

CREATE TABLE IF NOT EXISTS public.email_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  new_email text NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Só usada pelas edge functions (service role). Nenhuma policy é criada de
-- propósito: RLS habilitada + zero policies = acesso negado por padrão para
-- anon/authenticated; service_role sempre ignora RLS.
ALTER TABLE public.email_change_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_email_change_requests_user_id ON public.email_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_expires_at ON public.email_change_requests(expires_at);
