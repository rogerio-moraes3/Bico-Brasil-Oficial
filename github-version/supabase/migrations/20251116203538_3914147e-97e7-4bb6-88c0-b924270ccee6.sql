-- FASE 1: Remover categoria duplicada de Jardinagem
-- Consolidar tudo na categoria "Jardinagem e Externo" (ID: 707466fd-fa6a-4320-910e-13c238ece426)

-- 1. Atualizar subcategorias que apontam para a categoria antiga
UPDATE subcategories 
SET category_id = '707466fd-fa6a-4320-910e-13c238ece426' 
WHERE category_id = 'cdea0a13-3ea5-468a-8909-84b4f231ab89';

-- 2. Atualizar worker_services que usam a categoria antiga
UPDATE worker_services 
SET category_id = '707466fd-fa6a-4320-910e-13c238ece426' 
WHERE category_id = 'cdea0a13-3ea5-468a-8909-84b4f231ab89';

-- 3. Atualizar job_postings que usam a categoria antiga
UPDATE job_postings 
SET category_id = '707466fd-fa6a-4320-910e-13c238ece426' 
WHERE category_id = 'cdea0a13-3ea5-468a-8909-84b4f231ab89';

-- 4. Deletar categoria duplicada
DELETE FROM categories 
WHERE id = 'cdea0a13-3ea5-468a-8909-84b4f231ab89';

-- FASE 6: Índices de Performance para melhorar buscas
-- Índice composto para worker_services
CREATE INDEX IF NOT EXISTS idx_worker_services_search 
ON worker_services(active, category_id, subcategory_id);

-- Índice composto para users (profissionais ativos)
CREATE INDEX IF NOT EXISTS idx_users_search 
ON users(plan_active, destaque_expires_at, rating_avg) 
WHERE plan_active = true;