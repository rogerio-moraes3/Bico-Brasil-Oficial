-- Adiciona campos de assinatura em users, permitindo expiração automática de premium
-- (mercadopago-webhook já escreve nesses nomes de coluna; elas nunca existiram no schema real)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan_type text,
  ADD COLUMN IF NOT EXISTS subscription_start timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_end timestamptz;

COMMENT ON COLUMN public.users.plan_type IS 'Tier do plano ativo (basico, vip, anual). Nulo = sem assinatura.';
COMMENT ON COLUMN public.users.subscription_start IS 'Data de início da assinatura premium atual.';
COMMENT ON COLUMN public.users.subscription_end IS 'Data de expiração da assinatura premium atual.';

CREATE INDEX IF NOT EXISTS idx_users_subscription_end
  ON public.users (subscription_end)
  WHERE subscription_end IS NOT NULL;
