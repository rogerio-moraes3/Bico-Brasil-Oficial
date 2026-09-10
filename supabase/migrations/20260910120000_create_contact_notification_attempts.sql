-- Rate limit para a edge function notify-contact-message (chamada publica,
-- verify_jwt = false, pra notificar contato.bicobrasil@gmail.com quando
-- alguem usa o formulario /contact). Sem isso, qualquer um poderia chamar a
-- function direto (sem passar pelo formulario) e floodar a caixa de suporte.
-- A tabela contacts em si tambem nao tem nenhum rate limit (confirmado ao
-- vivo: nenhum trigger nela) — o toast de "aguarde, rate limit" em
-- Contact.tsx e codigo morto, nunca existiu no banco.
CREATE TABLE public.contact_notification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_notification_attempts_email_created
  ON public.contact_notification_attempts (email, created_at DESC);

CREATE INDEX idx_contact_notification_attempts_ip_created
  ON public.contact_notification_attempts (ip, created_at DESC);

ALTER TABLE public.contact_notification_attempts ENABLE ROW LEVEL SECURITY;

-- Sem policies para anon/authenticated (deny-all por padrao). So a service
-- role, usada dentro da edge function, le/escreve aqui (service role
-- ignora RLS).
