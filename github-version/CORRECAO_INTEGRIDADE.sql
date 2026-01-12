-- ==========================================
-- SCRIPT DE CORREÇÃO: INTEGRIDADE E ROLES
-- ==========================================

-- 1. CORREÇÃO RETROATIVA: ATRIBUIR ROLE 'user' PARA QUEM NÃO TEM
INSERT INTO public.user_roles (user_id, role)
SELECT 
    u.id, 
    'user'::public.app_role
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 2. ATUALIZAÇÃO DO TRIGGER: GARANTIR ROLE PARA TODOS OS NOVOS USUÁRIOS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- 2.1 Inserir/Atualizar na tabela users
    INSERT INTO public.users (auth_id, name, email, user_role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        'prestador'
    )
    ON CONFLICT (auth_id) DO UPDATE
    SET email = EXCLUDED.email
    RETURNING id INTO new_user_id;
    
    -- 2.2 Atribuir papel 'admin' ou 'user' (default) na tabela user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        new_user_id,
        CASE 
            WHEN NEW.email IN ('23rogeriomoraes@gmail.com', 'nando_petro@hotmail.com') THEN 'admin'::public.app_role
            ELSE 'user'::public.app_role
        END
    )
    ON CONFLICT (user_id) DO UPDATE 
    SET role = EXCLUDED.role;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RE-VINCULAR TRIGGER (Garanti que está ativo)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. VALIDAÇÃO FINAL (Verificar se ainda existem órfãos)
SELECT 
    'Usuários sem Role após fix' as status, 
    count(*) 
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL;
