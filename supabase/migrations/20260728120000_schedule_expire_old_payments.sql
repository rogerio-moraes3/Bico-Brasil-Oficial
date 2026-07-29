-- A edge function expire-old-payments (expira pagamentos PIX pendentes há
-- mais de 15min) nunca teve nenhum cron real disparando ela — não há
-- schedule no config.toml, nem GitHub Action, nem cron externo documentado
-- em lugar nenhum do repo. Mesmo padrão validado para o Premium: substitui
-- por um job pg_cron direto no Postgres, sem depender de HTTP/edge function.
--
-- Achado extra: public.payments não tem coluna updated_at — a function
-- original tentava gravar esse campo (.update({status,updated_at}))), o que
-- teria dado erro em toda chamada real (mais um indício de que ela nunca
-- rodou de fato). A versão em SQL abaixo só atualiza status.

SELECT cron.schedule(
  'expire-old-pix-payments',
  '*/5 * * * *',
  $$
    UPDATE public.payments
    SET status = 'failed'
    WHERE status = 'pending'
      AND created_at < now() - interval '15 minutes';
  $$
);
