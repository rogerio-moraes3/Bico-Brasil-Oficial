-- Fecha um gap real: o cron destrutivo delete-incomplete-signup-accounts
-- (ver 20260910140000_schedule_delete_incomplete_accounts.sql e INCIDENTS.md
-- — apagou 194 contas reais em 09-14/15) so foi desligado a mao em producao
-- via `SELECT cron.unschedule(...)` rodado direto no SQL Editor em 16/09,
-- NUNCA atraves de uma migration. Isso significa que rodar as migrations do
-- zero (staging, disaster recovery, `supabase db reset`) recria o cron.job
-- original e ele volta a rodar, apagando contas de novo.
--
-- cron.unschedule(text) lanca excecao se o job ja nao existir ("could not
-- find valid entry for job <nome>") — por isso o DO block com exception
-- handling: essa migration precisa ser segura tanto no cenario onde o job
-- foi criado por 20260910140000 e ainda existe (banco novo, replay do zero)
-- quanto no cenario onde ele ja foi desligado a mao (producao atual).
DO $$
BEGIN
  PERFORM cron.unschedule('delete-incomplete-signup-accounts');
EXCEPTION
  WHEN OTHERS THEN
    -- Job ja nao existe (caso do banco de producao atual, desligado a mao
    -- em 16/09) — nada a fazer, a migration so precisa garantir que o job
    -- NAO exista ao final, nao que ele tenha existido antes.
    NULL;
END $$;
