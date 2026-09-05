-- A migration anterior (20260905120000) criou esta view partindo do
-- pressuposto (baseado nas migrations antigas) de que Admin.tsx dependia de
-- uma policy de SELECT ampla em public.users pra funcionar. Checagem direta
-- no banco (pg_policies) mostrou que isso ja nao e verdade: a policy
-- "users_select_admin" (has_role(auth.uid(), 'admin')) ja concede acesso
-- total a admins na tabela real, fora do controle das migrations. A view
-- fica redundante — Admin.tsx voltou a consultar public.users diretamente.
DROP VIEW IF EXISTS public.admin_users_metrics;
