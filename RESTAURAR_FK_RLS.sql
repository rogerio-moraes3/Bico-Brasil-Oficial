-- RESTAURAR FK E RLS APÓS TESTE
-- Execute este script APÓS confirmar que o login Google funciona

-- Recriar Foreign Key
ALTER TABLE public.users 
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON UPDATE CASCADE 
ON DELETE CASCADE;

-- Reativar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verificar
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';
