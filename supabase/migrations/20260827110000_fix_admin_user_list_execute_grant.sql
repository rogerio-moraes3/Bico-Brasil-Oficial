-- Corrige regressao: a migration 20260723010000_lock_down_admin_rpc_functions
-- revogou EXECUTE de authenticated em _admin_all_users_internal() achando que
-- "nao tem uso no app", mas a view admin_user_list (Admin.tsx) depende dela.
-- Resultado: todo carregamento do Admin batia em 403 e caia no fallback pra
-- tabela users. A function ja tem checagem de admin embutida (RAISE EXCEPTION
-- 'Acesso negado' pra quem nao e admin), entao reconceder EXECUTE nao abre
-- brecha nenhuma pra nao-admin.
GRANT EXECUTE ON FUNCTION public._admin_all_users_internal() TO authenticated;
