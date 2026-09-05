-- M5: nada impedia um usuario autenticado de se autopromover via
-- `supabase.from('users').update({ plan_active: true, is_tester: true,
-- view_credits: 999 })` direto pelo REST — RLS so restringe LINHAS
-- (auth.uid() = id em users_update_own), nao COLUNAS.
--
-- Confirmado ao vivo (nao so nas migrations) que:
-- - view_credits nunca e escrito por nenhum caminho legitimo hoje (nem
--   edge function, nem frontend) — so lido. Bloqueio total e seguro.
-- - is_tester idem: sem nenhum .update() no codigo atual.
-- - plan_active TEM um caminho legitimo: Profile.tsx deixa o proprio
--   usuario cancelar a assinatura (plan_active: false). So a direcao
--   false -> true (auto-premium) precisa ser bloqueada pra quem nao e
--   service_role/admin.
CREATE OR REPLACE FUNCTION public.prevent_users_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Conexao direta e privilegiada (Studio/CLI como postgres, ou service_role
  -- via Edge Function) e admin autenticado: sem restricao.
  IF current_user IN ('postgres', 'supabase_admin', 'service_role')
     OR (auth.jwt() ->> 'role') = 'service_role'
     OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.is_tester IS DISTINCT FROM OLD.is_tester THEN
    RAISE EXCEPTION 'Alteração de is_tester não permitida pelo próprio usuário';
  END IF;

  IF NEW.view_credits IS DISTINCT FROM OLD.view_credits THEN
    RAISE EXCEPTION 'Alteração de view_credits não permitida pelo próprio usuário';
  END IF;

  IF NEW.plan_active IS DISTINCT FROM OLD.plan_active AND NEW.plan_active = true THEN
    RAISE EXCEPTION 'Ativação de plan_active não permitida pelo próprio usuário';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_guard_privileged_columns ON public.users;
CREATE TRIGGER users_guard_privileged_columns
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_users_privilege_escalation();
