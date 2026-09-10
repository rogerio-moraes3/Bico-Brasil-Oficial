-- Job agendado (mesmo padrao de expire-premium-plans e expire-old-pix-payments:
-- pg_cron direto no Postgres) que dispara a exclusao definitiva de contas com
-- cadastro incompleto (CPF pendente e/ou telefone nao verificado, em
-- type='worker' OU type='contractor') 3 dias depois do e-mail de aviso.
--
-- Diferente dos jobs anteriores, a exclusao de verdade precisa da Auth Admin
-- API (supabase.auth.admin.deleteUser) e da Storage API pra remover arquivos
-- de verdade — coisas que SQL puro nao faz (DELETE FROM storage.objects so
-- apaga o metadado, nao o arquivo real; e nao da pra deletar auth.users
-- corretamente via SQL sem deixar sessions/identities orfas). Por isso este
-- job so seleciona as contas elegiveis e dispara, via pg_net, uma chamada
-- HTTP pra edge function delete-incomplete-account — que faz toda a limpeza
-- (tabelas relacionadas + storage + Auth) e re-verifica a elegibilidade por
-- conta propria antes de apagar qualquer coisa.
--
-- O segredo usado no header (x-internal-secret) fica no Supabase Vault
-- (nome: internal_task_secret) — nunca em texto puro nesta migration.

CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'delete-incomplete-signup-accounts',
  '0 4 * * *',
  $$
    SELECT net.http_post(
      url := 'https://pyelmqmhraczgptagvve.supabase.co/functions/v1/delete-incomplete-account',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_task_secret')
      ),
      body := jsonb_build_object('user_id', u.id)
    )
    FROM public.users u
    WHERE u.incomplete_signup_notice_sent_at IS NOT NULL
      AND u.incomplete_signup_notice_sent_at <= now() - interval '3 days'
      AND ((u.cpf IS NULL OR u.cpf = '') OR u.phone_verified = false);
  $$
);
