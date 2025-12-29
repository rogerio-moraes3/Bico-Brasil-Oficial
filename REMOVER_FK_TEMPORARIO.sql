-- SOLUÇÃO: Remover temporariamente a Foreign Key para testar OAuth
-- Baseado na orientação do assistente do Supabase

-- ========================================
-- PASSO 1: Remover a Foreign Key
-- ========================================
-- AVISO: Isso remove a integridade referencial temporariamente
-- Você DEVE recriar a FK após o teste

ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;

-- ========================================
-- PASSO 2: Desabilitar RLS
-- ========================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ========================================
-- PASSO 3: Verificar
-- ========================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';

-- ========================================
-- INSTRUÇÕES:
-- ========================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. TESTE O LOGIN GOOGLE IMEDIATAMENTE
-- 3. Se funcionar, o problema era a FK ou RLS
-- 4. DEPOIS DO TESTE, execute o script de RESTAURAÇÃO abaixo

-- ========================================
-- PASSO 4: RESTAURAR FK (EXECUTE APÓS O TESTE)
-- ========================================
-- IMPORTANTE: Execute este comando APÓS confirmar que o login funciona
-- para restaurar a integridade referencial

-- ALTER TABLE public.users 
-- ADD CONSTRAINT users_id_fkey 
-- FOREIGN KEY (id) 
-- REFERENCES auth.users(id) 
-- ON UPDATE CASCADE 
-- ON DELETE CASCADE;

-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
