-- Correções de categorias e campos adicionais
-- 1. Remover categoria "Limpeza" duplicada (corrigido para UUID)
DELETE FROM categories 
WHERE name = 'Limpeza' 
AND id NOT IN (
  SELECT id FROM categories WHERE name = 'Limpeza' ORDER BY created_at LIMIT 1
);

-- 2. Renomear "Manutenção Doméstica"
UPDATE categories 
SET name = 'Manutenção Doméstica (Reparos)' 
WHERE name = 'Manutenção Doméstica';

-- 3. Adicionar campos de endereço completo ao perfil
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS street_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'SP';
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- 4. Adicionar campo "melhor opção de contato"
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_contact_method TEXT DEFAULT 'whatsapp';

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_profile_id);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city_id);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_status);
