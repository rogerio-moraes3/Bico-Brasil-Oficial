-- Estende o guard de colunas privilegiadas de public.users.
--
-- Buraco fechado aqui: a policy users_update_own permite ao dono gravar na
-- propria linha, e o grant de UPDATE cobre as 42 colunas da tabela. O trigger
-- so protegia is_tester, plan_active e free_posts_remaining, entao um usuario
-- logado podia dar PATCH direto na API REST e:
--   - se auto-destacar (destaque_expires_at), que e o produto vendido por
--     create-destaque-payment e gravado por mercadopago-destaque-webhook;
--   - se dar o selo verified, exibido publicamente via users_public;
--   - inflar rating_avg / rating_count / jobs_done (prova social publica);
--   - forjar plan_type e subscription_start/end.
--
-- Quem escreve essas colunas legitimamente (verificado antes desta migration):
--   destaque_expires_at                      -> mercadopago-destaque-webhook
--   plan_type, subscription_start/end        -> mercadopago-webhook
--   verified, rating_avg, rating_count, jobs_done -> ninguem hoje
-- Os dois webhooks usam createClient(url, SUPABASE_SERVICE_ROLE_KEY), entao
-- caem no bypass do topo da funcao e nao sao afetados. Nenhuma funcao do banco
-- e nenhum caminho do frontend grava essas colunas.
--
-- Diferenca de forma em relacao aos tres IFs antigos: aqui qualquer mudanca e
-- barrada (IS DISTINCT FROM puro), nao so o sentido "para mais". plan_active
-- segue com a regra antiga, que permite o proprio usuario desativar o plano
-- (cancelamento em Profile.tsx), e free_posts_remaining segue permitindo a
-- queda natural a cada publicacao.
CREATE OR REPLACE FUNCTION public.prevent_users_privilege_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF current_user IN ('postgres', 'supabase_admin', 'service_role')
     OR (auth.jwt() ->> 'role') = 'service_role'
     OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.is_tester IS DISTINCT FROM OLD.is_tester THEN
    RAISE EXCEPTION 'Alteração de is_tester não permitida pelo próprio usuário';
  END IF;

  IF NEW.plan_active IS DISTINCT FROM OLD.plan_active AND NEW.plan_active = true THEN
    RAISE EXCEPTION 'Ativação de plan_active não permitida pelo próprio usuário';
  END IF;

  IF NEW.free_posts_remaining IS DISTINCT FROM OLD.free_posts_remaining
     AND NEW.free_posts_remaining > OLD.free_posts_remaining THEN
    RAISE EXCEPTION 'Aumento de free_posts_remaining não permitido pelo próprio usuário';
  END IF;

  IF NEW.destaque_expires_at IS DISTINCT FROM OLD.destaque_expires_at THEN
    RAISE EXCEPTION 'Alteração de destaque_expires_at não permitida pelo próprio usuário';
  END IF;

  IF NEW.verified IS DISTINCT FROM OLD.verified THEN
    RAISE EXCEPTION 'Alteração de verified não permitida pelo próprio usuário';
  END IF;

  IF NEW.rating_avg IS DISTINCT FROM OLD.rating_avg THEN
    RAISE EXCEPTION 'Alteração de rating_avg não permitida pelo próprio usuário';
  END IF;

  IF NEW.rating_count IS DISTINCT FROM OLD.rating_count THEN
    RAISE EXCEPTION 'Alteração de rating_count não permitida pelo próprio usuário';
  END IF;

  IF NEW.jobs_done IS DISTINCT FROM OLD.jobs_done THEN
    RAISE EXCEPTION 'Alteração de jobs_done não permitida pelo próprio usuário';
  END IF;

  IF NEW.plan_type IS DISTINCT FROM OLD.plan_type THEN
    RAISE EXCEPTION 'Alteração de plan_type não permitida pelo próprio usuário';
  END IF;

  IF NEW.subscription_start IS DISTINCT FROM OLD.subscription_start THEN
    RAISE EXCEPTION 'Alteração de subscription_start não permitida pelo próprio usuário';
  END IF;

  IF NEW.subscription_end IS DISTINCT FROM OLD.subscription_end THEN
    RAISE EXCEPTION 'Alteração de subscription_end não permitida pelo próprio usuário';
  END IF;

  RETURN NEW;
END;
$function$;
