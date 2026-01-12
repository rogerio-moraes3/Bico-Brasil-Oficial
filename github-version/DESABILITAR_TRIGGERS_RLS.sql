-- SOLUÇÃO ALTERNATIVA: Desabilitar apenas triggers e RLS em public.users
-- (não podemos mexer em auth.users por falta de permissão)

-- PASSO 1: Desabilitar TODAS as triggers em public.users
ALTER TABLE public.users DISABLE TRIGGER ALL;

-- PASSO 2: Desabilitar RLS em public.users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- PASSO 3: Verificar se funcionou
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';

-- INSTRUÇÕES:
-- 1. Execute este script no Supabase SQL Editor
-- 2. TESTE O LOGIN GOOGLE IMEDIATAMENTE
--
-- SE FUNCIONAR:
-- ✅ Problema era trigger ou RLS em public.users
-- ✅ OAuth Google funciona
--
-- SE AINDA DER LOOP:
-- Execute o PASSO 4 abaixo

-- PASSO 4 (APENAS SE AINDA DER LOOP):
-- Renomear tabela users temporariamente
-- ALTER TABLE public.users RENAME TO users_backup;
-- 
-- Depois teste o login novamente
-- Se funcionar sem a tabela, significa que a estrutura dela está incompatível
