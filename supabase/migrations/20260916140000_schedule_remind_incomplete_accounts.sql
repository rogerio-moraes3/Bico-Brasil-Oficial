-- Substitui o antigo cron delete-incomplete-signup-accounts (pausado
-- manualmente em 2026-09-16 via cron.unschedule, apos apagar ~192 contas
-- reais em duas ondas — 14/09 e 15/09 — de forma irreversivel; ver
-- supabase/migrations/20260916120000_feature_gate_incomplete_profiles.sql
-- pro novo mecanismo de GATE que substitui a exclusao). Este job NUNCA
-- chama delete-incomplete-account nem qualquer outra funcao de exclusao —
-- so envia um lembrete amigavel via notify-incomplete-signup, que agora nao
-- menciona mais exclusao de conta em lugar nenhum.
--
-- Cadencia: roda diario, mas cada conta so recebe um lembrete a cada 7 dias
-- (REMINDER_INTERVAL_DAYS em notify-incomplete-signup/index.ts, que checa
-- incomplete_signup_notice_sent_at antes de reenviar) — nao e spam diario,
-- e repete indefinidamente enquanto a conta continuar incompleta (sem prazo
-- de exclusao atrelado).
--
-- Usa public.is_profile_complete() (mesma fonte de verdade dos triggers e
-- da view users_public) em vez de repetir a condicao em SQL solto.

SELECT cron.schedule(
  'remind-incomplete-signup-accounts',
  '0 13 * * *',
  $$
    SELECT net.http_post(
      url := 'https://pyelmqmhraczgptagvve.supabase.co/functions/v1/notify-incomplete-signup',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_task_secret')
      ),
      body := jsonb_build_object('user_id', u.id)
    )
    FROM public.users u
    WHERE NOT public.is_profile_complete(u)
      AND (
        u.incomplete_signup_notice_sent_at IS NULL
        OR u.incomplete_signup_notice_sent_at <= now() - interval '7 days'
      );
  $$
);
