-- Correção urgente da migration anterior (20260905123000): o trigger
-- referenciava NEW.view_credits/OLD.view_credits, mas essa coluna nao
-- existe em public.users (o sistema de creditos vive em outra tabela,
-- public.user_credits, coluna "credits" — nao usada por nenhum caminho
-- ativo do app). Como PL/pgSQL nao valida colunas na criacao da funcao,
-- isso so quebraria no primeiro UPDATE real em public.users. Removendo a
-- checagem antes que isso aconteca.
CREATE OR REPLACE FUNCTION public.prevent_users_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
