-- DIAGNÓSTICO COMPLETO: Database error saving new user
-- Execute cada bloco SEPARADAMENTE e me envie os resultados

-- ========================================
-- BLOCO 1: Verificar triggers em auth.users
-- ========================================
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid::regclass::text LIKE '%auth.users%'
  AND tgname NOT LIKE 'pg_%';

-- ========================================
-- BLOCO 2: Verificar estrutura da tabela users
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ========================================
-- BLOCO 3: Verificar RLS na tabela users
-- ========================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';

-- ========================================
-- BLOCO 4: Verificar policies de INSERT
-- ========================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
  AND cmd = 'INSERT';

-- ========================================
-- INSTRUÇÕES:
-- 1. Execute BLOCO 1 e me envie o resultado
-- 2. Execute BLOCO 2 e me envie o resultado  
-- 3. Execute BLOCO 3 e me envie o resultado
-- 4. Execute BLOCO 4 e me envie o resultado
--
-- Com esses resultados vou identificar EXATAMENTE o problema!
-- ========================================
