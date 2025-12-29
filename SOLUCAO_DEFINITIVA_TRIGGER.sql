-- SOLUÇÃO DEFINITIVA: Trigger corrigido para inserir id corretamente
-- Problema: coluna id é NOT NULL mas não tem default

-- 1. Dropar trigger e função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Criar função que insere id = auth_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    display_name,
    last_mode
  ) VALUES (
    NEW.id,  -- Usar o ID do auth.users como id da tabela users
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'contractor'
  )
  ON CONFLICT (id) DO NOTHING;

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
-- 3. Teste o login em: https://www.bicobrasil.com.br/auth
-- 
-- DEVE FUNCIONAR AGORA! ✅
