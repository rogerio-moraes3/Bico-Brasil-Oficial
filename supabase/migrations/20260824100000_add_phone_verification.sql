-- Verificação de telefone via SMS (Twilio Verify) — item 11 da auditoria.
-- A partir do lançamento (2026-08-24), cadastro exige telefone verificado por
-- código antes de liberar o app; contas criadas antes dessa data têm 30 dias
-- de carência (calculados a partir de created_at vs. data de lançamento, sem
-- precisar de coluna extra pra isso).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;

-- Guarda apenas o estado da verificação (rate limit, tentativas, SID da
-- Twilio para debug) — o código em si nunca é armazenado aqui, quem gera e
-- valida o código de 6 dígitos é o Twilio Verify Service.
CREATE TABLE IF NOT EXISTS public.phone_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'failed', 'expired')),
  twilio_sid text,
  attempts int NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Só usada pelas edge functions (service role). Nenhuma policy é criada de
-- propósito: RLS habilitada + zero policies = acesso negado por padrão para
-- anon/authenticated; service_role sempre ignora RLS.
ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_user_id ON public.phone_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_phone ON public.phone_verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_created_at ON public.phone_verification_codes(created_at);
