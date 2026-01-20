-- ============================================
-- FIX CPF TRIGGER - Bico Brasil
-- ============================================
-- PROBLEMA: CPF é enviado no cadastro mas não aparece na tabela public.users
-- CAUSA: Trigger handle_new_user() não copia CPF do auth.users para public.users
-- SOLUÇÃO: Atualizar trigger para incluir CPF, phone e city_id
-- ============================================

-- Step 1: Verificar se coluna CPF existe (executar primeiro para diagnóstico)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN ('cpf', 'phone', 'city_id')
ORDER BY column_name;

-- Step 2: Se CPF não existir, criar a coluna (EXECUTAR APENAS SE NECESSÁRIO)
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Step 3: Atualizar o trigger handle_new_user para copiar CPF
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir usuário na tabela public.users com TODOS os dados do metadata
  INSERT INTO public.users (
    auth_id,
    email,
    name,
    cpf,          -- ← NOVO
    phone,        -- ← NOVO
    city_id,      -- ← NOVO
    neighborhood, -- ← NOVO (se existir no metadata)
    created_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email), -- Nome ou email como fallback
    new.raw_user_meta_data->>'cpf',                        -- ← NOVO
    new.raw_user_meta_data->>'phone',                      -- ← NOVO
    new.raw_user_meta_data->>'city_id',                    -- ← NOVO
    new.raw_user_meta_data->>'neighborhood',               -- ← NOVO
    now()
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    cpf = COALESCE(EXCLUDED.cpf, public.users.cpf),        -- ← NOVO
    phone = COALESCE(EXCLUDED.phone, public.users.phone),  -- ← NOVO
    city_id = COALESCE(EXCLUDED.city_id, public.users.city_id); -- ← NOVO
  
  RETURN new;
END;
$$;

-- Step 4: Garantir que trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Popular CPF para usuários existentes (EXECUTAR APENAS UMA VEZ)
-- Este comando copia CPF de auth.users.raw_user_meta_data para public.users
UPDATE public.users u
SET 
  cpf = au.raw_user_meta_data->>'cpf',
  phone = COALESCE(u.phone, au.raw_user_meta_data->>'phone'),
  city_id = COALESCE(u.city_id, au.raw_user_meta_data->>'city_id')
FROM auth.users au
WHERE u.auth_id = au.id
  AND au.raw_user_meta_data->>'cpf' IS NOT NULL
  AND u.cpf IS NULL;

-- Step 6: Verificar resultado
-- Execute isso para confirmar que CPF foi populado
SELECT 
  u.id,
  u.name,
  u.email,
  u.cpf,
  u.phone,
  u.city_id,
  au.raw_user_meta_data->>'cpf' as cpf_from_auth
FROM public.users u
LEFT JOIN auth.users au ON u.auth_id = au.id
ORDER BY u.created_at DESC
LIMIT 10;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Execute os comandos na ordem (Step 1 → Step 6)
-- 2. Step 2 (ALTER TABLE) só execute se coluna CPF não existir
-- 3. Step 5 (UPDATE) execute UMA VEZ para popular dados antigos
-- 4. O trigger funcionará automaticamente para novos cadastros
-- 5. Se algo der errado, você pode reverter com:
--    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- ============================================
