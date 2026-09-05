-- Correcao de um segundo bug na mesma trigger (20260905123000 /
-- 20260905123500): por ser SECURITY DEFINER (dono postgres), o
-- "current_user" DENTRO da funcao e sempre 'postgres' — nao o chamador
-- real — entao o bypass "current_user IN ('postgres', ...)" passava
-- incondicionalmente pra qualquer usuario, admin ou nao. Confirmado com
-- teste simulando um usuario comum (nao-admin) tentando is_tester=true e
-- plan_active=true: ambos passaram quando deveriam ter sido bloqueados.
--
-- Fix: remove SECURITY DEFINER. has_role() ja e SECURITY DEFINER por conta
-- propria, entao continua funcionando normalmente chamada em modo invoker.
-- Sem SECURITY DEFINER, current_user reflete o role real da conexao
-- (postgres no Studio/CLI, service_role nas Edge Functions, authenticated/
-- anon via PostgREST).
CREATE OR REPLACE FUNCTION public.prevent_users_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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

  RETURN NEW;
END;
$$;
