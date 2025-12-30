-- ==========================================
-- FIX RLS POLICIES: BICO BRASIL
-- ==========================================
-- Este script corrige as políticas de Row Level Security (RLS)
-- para permitir leitura pública das tabelas essenciais.
-- 
-- PROBLEMA: Sem essas políticas, o app não consegue carregar
-- cidades, categorias e subcategorias sem autenticação.
--
-- SOLUÇÃO: Criar políticas de leitura pública (SELECT) para
-- permitir que usuários não autenticados vejam esses dados.
-- ==========================================

-- ==========================================
-- 1. CITIES TABLE - Leitura Pública
-- ==========================================

-- Habilitar RLS na tabela cities (se ainda não estiver)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Remover política antiga se existir (para evitar duplicatas)
DROP POLICY IF EXISTS "Allow public read cities" ON public.cities;
DROP POLICY IF EXISTS "Public read access for cities" ON public.cities;
DROP POLICY IF EXISTS "cities_select_policy" ON public.cities;

-- Criar política de leitura pública para cities
CREATE POLICY "Public read access for cities"
ON public.cities
FOR SELECT
USING (true);

-- Comentário explicativo
COMMENT ON POLICY "Public read access for cities" ON public.cities IS 
'Permite que qualquer usuário (autenticado ou não) leia a lista de cidades. Essencial para o funcionamento do app.';

-- ==========================================
-- 2. CATEGORIES TABLE - Leitura Pública
-- ==========================================

-- Habilitar RLS na tabela categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Public read access for categories" ON public.categories;
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;

-- Criar política de leitura pública para categories
CREATE POLICY "Public read access for categories"
ON public.categories
FOR SELECT
USING (true);

-- Comentário explicativo
COMMENT ON POLICY "Public read access for categories" ON public.categories IS 
'Permite que qualquer usuário leia a lista de categorias de serviços.';

-- ==========================================
-- 3. SUBCATEGORIES TABLE - Leitura Pública
-- ==========================================

-- Habilitar RLS na tabela subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow public read subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Public read access for subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "subcategories_select_policy" ON public.subcategories;

-- Criar política de leitura pública para subcategories
CREATE POLICY "Public read access for subcategories"
ON public.subcategories
FOR SELECT
USING (true);

-- Comentário explicativo
COMMENT ON POLICY "Public read access for subcategories" ON public.subcategories IS 
'Permite que qualquer usuário leia a lista de subcategorias de serviços.';

-- ==========================================
-- 4. VERIFICAÇÃO - Listar todas as políticas
-- ==========================================

-- Execute esta query para verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('cities', 'categories', 'subcategories')
ORDER BY tablename, policyname;

-- ==========================================
-- 5. TESTE - Verificar se os dados existem
-- ==========================================

-- Verificar quantidade de registros em cada tabela
SELECT 'cities' as table_name, COUNT(*) as record_count FROM public.cities
UNION ALL
SELECT 'categories', COUNT(*) FROM public.categories
UNION ALL
SELECT 'subcategories', COUNT(*) FROM public.subcategories;

-- ==========================================
-- INSTRUÇÕES DE USO
-- ==========================================
-- 1. Abra o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script completo
-- 4. Execute (Run)
-- 5. Verifique os resultados das queries de verificação
-- 6. Teste o app em produção (modo anônimo/incógnito)
-- ==========================================
