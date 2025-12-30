-- ==========================================
-- SCRIPT DE AUDITORIA: RLS E RELACIONAMENTOS
-- ==========================================

-- 1. VERIFICAR TABELAS E POLÍTICAS RLS
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. VERIFICAR RELACIONAMENTOS (FOREIGN KEYS)
-- Crucial para evitar o erro "Could not find a relationship"
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS foreign_table_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype = 'f' AND connamespace = 'public'::regnamespace
AND conrelid::regclass::text IN ('user_roles', 'job_postings', 'worker_services', 'subcategories');

-- 3. RESUMO DE DADOS PARA VALIDAÇÃO
SELECT 'Categories' as table, count(*) FROM public.categories
UNION ALL
SELECT 'Subcategories', count(*) FROM public.subcategories
UNION ALL
SELECT 'Cities (Active)', count(*) FROM public.cities WHERE active = true
UNION ALL
SELECT 'Users', count(*) FROM public.users;

-- 4. VERIFICAÇÃO DE INTEGRIDADE: USUÁRIOS SEM PAPÉIS
SELECT 
    'Usuários sem Role' as status, 
    count(*) 
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL;

-- 5. TESTE DE JOIN AMPLIADO (LIMIT 50)
SELECT 
    u.name, 
    u.email,
    ur.role
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC
LIMIT 50;

-- 6. BUSCA DE TABELAS SEM FK (PARA PREVENIR ERROS DE API)
-- Lista tabelas que referenciam outras mas podem não ter a FK definida no Postgres
SELECT 
    relname as table_name,
    n_tup_ins as inserts
FROM pg_stat_user_tables 
WHERE schemaname = 'public';

