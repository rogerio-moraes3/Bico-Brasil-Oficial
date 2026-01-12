-- ============================================
-- CORREÇÃO: Login do Google (404 NOT_FOUND)
-- Data: 2025-12-27
-- Executar no Supabase Dashboard → SQL Editor
-- ============================================

-- PASSO 1: Recriar função que cria usuário após login social
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_city_id UUID;
BEGIN
  -- Buscar ID da cidade padrão (Presidente Prudente)
  SELECT id INTO default_city_id
  FROM public.cities
  WHERE name = 'Presidente Prudente' AND state = 'SP'
  LIMIT 1;

  -- Criar perfil completo na tabela users
  INSERT INTO public.users (
    auth_id,
    email,
    name,
    phone,
    city,
    city_id,
    type,
    last_mode,
    profile_photo
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'Presidente Prudente',
    default_city_id,
    'contractor',
    'contractor',
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, users.name),
    profile_photo = COALESCE(EXCLUDED.profile_photo, users.profile_photo);

  -- Criar role padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- PASSO 2: Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASSO 3: Verificar se o trigger foi criado
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- ============================================
-- RESULTADO ESPERADO:
-- trigger_name         | enabled
-- on_auth_user_created | O
-- 
-- Se aparecer isso, o trigger está ativo! ✅
-- ============================================
