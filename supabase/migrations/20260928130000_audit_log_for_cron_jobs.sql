-- Auditoria de todos os cron jobs (28/09), depois do incidente das 194
-- contas apagadas em 09-14/15: os outros dois jobs ativos (expire-premium-
-- plans, expire-old-pix-payments) tinham a mesma lacuna que ajudou o
-- incidente a passar despercebido por dias — nenhuma acao muda o estado de
-- ninguem sem deixar rastro em audit_log. As queries de selecao de cada um
-- foram testadas isoladamente (SELECT read-only antes desta migration) e
-- sao precisas — nenhum bug de NULL/fuso horario encontrado.
--
-- Os dois passam a usar uma CTE modificadora (UPDATE ... RETURNING) + INSERT
-- na mesma instrucao atomica, em vez de "loga, depois roda" separado — evita
-- logar algo que a acao real nao chegou a fazer se o UPDATE falhar no meio.

SELECT cron.unschedule('expire-premium-plans');
SELECT cron.schedule(
  'expire-premium-plans',
  '0 3 * * *',
  $$
    WITH expired AS (
      UPDATE public.users
      SET plan_active = false, updated_at = now()
      WHERE plan_active = true
        AND subscription_end IS NOT NULL
        AND subscription_end < now()
      RETURNING id, subscription_end
    )
    INSERT INTO public.audit_log (action, table_name, record_id, user_id, payload)
    SELECT 'plan_expired_by_cron', 'users', id, id,
      jsonb_build_object('subscription_end', subscription_end)
    FROM expired;
  $$
);

SELECT cron.unschedule('expire-old-pix-payments');
SELECT cron.schedule(
  'expire-old-pix-payments',
  '*/5 * * * *',
  $$
    WITH expired AS (
      UPDATE public.payments
      SET status = 'failed'
      WHERE status = 'pending'
        AND created_at < now() - interval '15 minutes'
      RETURNING id, user_id, amount, mercadopago_payment_id
    )
    INSERT INTO public.audit_log (action, table_name, user_id, payload)
    SELECT 'pix_payment_expired_by_cron', 'payments', user_id,
      jsonb_build_object('payment_id', id, 'amount', amount, 'mercadopago_payment_id', mercadopago_payment_id)
    FROM expired;
  $$
);
