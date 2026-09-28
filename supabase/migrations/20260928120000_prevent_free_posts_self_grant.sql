-- Achado da auditoria de seguranca (28/09): prevent_users_privilege_escalation()
-- so protegia is_tester/plan_active — qualquer usuario autenticado podia
-- chamar supabase.from('users').update({ free_posts_remaining: 999999 })
-- na propria linha (RLS users_update_own so checa auth.uid()=id, sem
-- restricao de coluna) e burlar completamente o limite de 10 publicacoes
-- gratis, ja que o decremento em PostJob.tsx e so client-side. Confirmado
-- ao vivo antes desta migration.
--
-- Unica alteracao legitima client-side e DECREMENTAR (apos publicar uma
-- vaga gratis) — nunca aumentar. Aumentos legitimos (reset admin, mudanca
-- de plano) sempre vem do painel admin ou de logica server-side, que ja
-- passam por current_user/service_role/has_role('admin') e continuam
-- liberados pelo early-return existente.
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

  RETURN NEW;
END;
$function$;
