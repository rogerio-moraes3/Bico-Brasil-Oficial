-- ETAPA 1: Adicionar campo phone_type
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_type TEXT DEFAULT 'whatsapp_only';

-- ETAPA 1: Índices para performance e indexação imediata
CREATE INDEX IF NOT EXISTS idx_users_category_active ON users(category, plan_active) WHERE plan_active = true;
CREATE INDEX IF NOT EXISTS idx_users_city_neighborhood ON users(city_id, neighborhood) WHERE neighborhood IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_category_status ON jobs(category, status);
CREATE INDEX IF NOT EXISTS idx_jobs_city_status ON jobs(city_id, status);

-- ETAPA 3: Ativar Realtime para notificações admin
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE users;