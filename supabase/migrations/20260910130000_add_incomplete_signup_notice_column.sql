-- Parte do fluxo de aviso + exclusao de contas com cadastro incompleto
-- (CPF pendente e/ou telefone nao verificado, tanto type='worker' quanto
-- type='contractor'). Guarda quando o e-mail de aviso ("sua conta sera
-- excluida em 3 dias") foi enviado, pra:
--   1) nao mandar o aviso duas vezes pra mesma conta;
--   2) o job de exclusao (pg_cron) saber quais contas ja passaram dos 3 dias.
-- NULL = nunca avisado. Preenchido = aviso enviado com sucesso naquele instante.
ALTER TABLE public.users
  ADD COLUMN incomplete_signup_notice_sent_at timestamptz;

COMMENT ON COLUMN public.users.incomplete_signup_notice_sent_at IS
  'Quando o e-mail de aviso de exclusao por cadastro incompleto foi enviado. NULL = nunca avisado. Usado pelo job delete-incomplete-account (3 dias depois, se a conta continuar incompleta).';
