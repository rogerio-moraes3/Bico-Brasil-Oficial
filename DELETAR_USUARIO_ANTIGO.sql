-- Script SIMPLIFICADO para deletar usuário antigo
-- Nome: Rogerio Moraes

-- PASSO 1: Deletar da tabela public.users pelo nome
DELETE FROM public.users 
WHERE name ILIKE '%Rogerio%Moraes%';

-- PASSO 2: Para deletar do auth.users, você precisa fazer manualmente:
-- 1. Vá em: Supabase Dashboard → Authentication → Users
-- 2. Procure por "Rogerio Moraes" ou "23rogeriomoraes@gmail.com"
-- 3. Clique nos 3 pontinhos (...) ao lado do usuário
-- 4. Clique em "Delete User"
-- 5. Confirme a exclusão

-- DEPOIS DE DELETAR:
-- 1. Vá para: https://www.bicobrasil.com.br/auth
-- 2. Clique em "Entrar com Google"
-- 3. Autorizar
-- 4. Deve criar usuário novo e entrar no /app!
