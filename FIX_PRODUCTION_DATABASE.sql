-- ========================================
-- FIX PRODUCTION DATABASE SCHEMA
-- ========================================
-- Execute este script no Supabase SQL Editor
-- para corrigir o relacionamento users/user_roles

-- 1. Verificar se a tabela user_roles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        RAISE NOTICE 'Tabela user_roles não existe. Criando...';
        
        CREATE TABLE public.user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'moderator')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id)
        );
        
        -- Habilitar RLS
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Política de leitura pública
        CREATE POLICY "Allow public read access to user_roles"
            ON public.user_roles
            FOR SELECT
            USING (true);
        
        -- Política de escrita apenas para admins
        CREATE POLICY "Allow admin write access to user_roles"
            ON public.user_roles
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
        
        RAISE NOTICE 'Tabela user_roles criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela user_roles já existe.';
    END IF;
END $$;

-- 2. Verificar se a FK existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_fkey'
        AND table_name = 'user_roles'
    ) THEN
        RAISE NOTICE 'FK user_roles_user_id_fkey não existe. Criando...';
        
        ALTER TABLE public.user_roles
        ADD CONSTRAINT user_roles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'FK criada com sucesso!';
    ELSE
        RAISE NOTICE 'FK user_roles_user_id_fkey já existe.';
    END IF;
END $$;

-- 3. Inserir role admin para o usuário principal (se não existir)
-- IMPORTANTE: Substitua 'SEU_EMAIL@AQUI.COM' pelo seu email real!
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Buscar ID do usuário pelo email
    SELECT id INTO v_user_id
    FROM public.users
    WHERE email = '23rogeriomoraes@gmail.com'  -- ⚠️ ALTERE ESTE EMAIL!
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Inserir ou atualizar role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'admin', updated_at = NOW();
        
        RAISE NOTICE 'Role admin atribuída ao usuário %', v_user_id;
    ELSE
        RAISE NOTICE 'Usuário não encontrado. Verifique o email!';
    END IF;
END $$;

-- 4. Verificar resultado
SELECT 
    u.email,
    u.name,
    ur.role,
    ur.created_at
FROM public.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = '23rogeriomoraes@gmail.com'  -- ⚠️ ALTERE ESTE EMAIL!
LIMIT 5;

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Você deve ver:
-- - Tabela user_roles criada (se não existia)
-- - FK user_roles_user_id_fkey criada
-- - Seu usuário com role='admin'
-- - Nenhum erro de relacionamento
