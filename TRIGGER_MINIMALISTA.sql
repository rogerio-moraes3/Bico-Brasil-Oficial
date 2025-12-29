-- TRIGGER ULTRA-MINIMALISTA
-- Remove TODOS os campos opcionais que podem causar erro

-- 1. Dropar trigger e função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Criar função minimalista (APENAS id, email, name)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    auth_id,
    email,
    name
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (auth_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- INSTRUÇÕES:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Delete o usuário em: Authentication → Users
-- 3. Teste o login novamente
-- 
-- SE AINDA DER ERRO:
-- Vá em Logs → Database e me envie o erro exato
