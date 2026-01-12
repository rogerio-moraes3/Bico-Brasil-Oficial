-- ============================================
-- FASE 2-6: MIGRATIONS NECESSÁRIAS
-- ⚠️ REQUER APROVAÇÃO ANTES DE EXECUTAR
-- ============================================

-- 1. REMOVER CATEGORIA DUPLICADA "LIMPEZA"
DELETE FROM categories 
WHERE name = 'Limpeza' 
AND id NOT IN (
  SELECT MIN(id) FROM categories WHERE name = 'Limpeza'
);

-- 2. RENOMEAR "MANUTENÇÃO DOMÉSTICA"
UPDATE categories 
SET name = 'Manutenção Doméstica (Reparos)' 
WHERE name = 'Manutenção Doméstica';

-- 3. ADICIONAR CAMPOS DE ENDEREÇO COMPLETO
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS street_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'SP';
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- 4. ADICIONAR CAMPO "MELHOR OPÇÃO DE CONTATO"
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_contact_method TEXT DEFAULT 'whatsapp';

-- 5. CAMPOS PARA SELFIE (usando campos existentes verification_document e verification_status)
-- Não precisa adicionar novos campos, já existem:
-- - verification_document (para URL da selfie)
-- - verification_status (para status: 'pending', 'approved', 'rejected')

-- 6. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_profile_id);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city_id);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_status);

-- ============================================
-- FIM DAS MIGRATIONS
-- ============================================
