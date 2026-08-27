-- Log resumivel para a campanha de notificacao de lancamento nacional.
-- Permite retomar de onde parou (ex: apos bater o limite diario de 100
-- e-mails do Resend) sem reenviar pra quem ja recebeu.

-- user_id (FK pra public.users.id) e usado pro join de conveniencia
-- (users(name) etc.); auth_id e usado pra escrever em notifications.user_id,
-- que o NotificationContext busca pelo id da sessao de Auth. Os dois quase
-- sempre coincidem, mas 2 dos 184 usuarios reais tem valores diferentes —
-- confirmado antes desta migration, entao guardamos os dois explicitamente
-- em vez de assumir que sao a mesma coisa.
CREATE TABLE public.national_launch_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  auth_id uuid NOT NULL,
  email text NOT NULL,
  phone_verified_at_seed boolean NOT NULL DEFAULT false,
  email_status text NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
  email_sent_at timestamptz,
  email_error text,
  in_app_status text NOT NULL DEFAULT 'pending' CHECK (in_app_status IN ('pending', 'sent', 'failed')),
  in_app_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- RLS habilitada sem policies: acesso só via service role (mesmo padrão de
-- phone_verification_codes) — a Edge Function é a única que le/escreve aqui.
ALTER TABLE public.national_launch_notification_log ENABLE ROW LEVEL SECURITY;
