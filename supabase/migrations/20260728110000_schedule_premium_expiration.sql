-- Auto-expiração do Premium baseada em subscription_end (já calculado no
-- momento do pagamento). NÃO é cobrança recorrente — só desativa
-- plan_active quando a data já calculada passou, exigindo novo pagamento
-- pra renovar. Só toca contas com subscription_end preenchido (assinaturas
-- pagas via Mercado Pago) — is_tester/concessões manuais nunca têm esse
-- campo, então nunca são afetadas.

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'expire-premium-plans',
  '0 3 * * *',
  $$
    UPDATE public.users
    SET plan_active = false, updated_at = now()
    WHERE plan_active = true
      AND subscription_end IS NOT NULL
      AND subscription_end < now();
  $$
);
