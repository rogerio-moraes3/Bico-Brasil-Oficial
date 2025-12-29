-- FIX DEFINITIVO: Trigger handle_new_user simplificado
-- Corrige erro: Database error saving new user

-- 1. Dropar trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Criar função simplificada (sem campos opcionais que podem causar erro)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir apenas campos obrigatórios
  INSERT INTO public.users (
    auth_id,
    email,
    name,
    type,
    last_mode
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'contractor',
    'contractor'
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name);

  RETURN NEW;
END;
$$;

-- 3. Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar se funcionou
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- INSTRUÇÕES:
-- 1. Copie TODO este código
-- 2. Vá em: Supabase Dashboard → SQL Editor
-- 3. Cole e clique em "Run"
-- 4. Depois delete o usuário antigo em: Authentication → Users
-- 5. Teste o login novamente em: https://www.bicobrasil.com.br/auth
