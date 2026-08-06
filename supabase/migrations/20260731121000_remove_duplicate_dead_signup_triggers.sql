-- Limpeza dos triggers de auth.users, descobertos durante a investigação do bug
-- de contas órfãs (94/166 contas sem linha em public.users desde 04/01/2026):
--
-- 1. auth_user_insert_trigger (BEFORE INSERT) chamava a MESMA função
--    handle_new_user_safe() que handle_new_user_safe_trigger (AFTER INSERT) já
--    chama — mas rodando BEFORE INSERT, a linha em auth.users ainda não existe,
--    então a FK users_auth_id_fkey sempre falha nessa primeira tentativa
--    (ruído constante em signup_errors, sem nunca conseguir criar o perfil aqui;
--    a segunda tentativa, AFTER INSERT, que é a que realmente funciona).
--
-- 2. on_auth_user_created e on_auth_user_updated_photo apontavam para uma
--    versão ANTIGA de handle_new_user() que insere em public.profiles — tabela
--    que o app não usa mais (resíduo de versão anterior do projeto). Inofensivo
--    mas morto e confuso.
--
-- Mantém apenas handle_new_user_safe_trigger (AFTER INSERT) como único
-- responsável por criar public.users, e on_auth_user_email_changed (não
-- relacionado a este bug).

DROP TRIGGER IF EXISTS auth_user_insert_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated_photo ON auth.users;
