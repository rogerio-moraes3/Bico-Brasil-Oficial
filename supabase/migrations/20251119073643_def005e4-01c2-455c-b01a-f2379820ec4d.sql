-- Adicionar colunas para campo "Outros" customizado
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS custom_category TEXT;
ALTER TABLE worker_services ADD COLUMN IF NOT EXISTS custom_category TEXT;

-- Adicionar coluna city (texto) para backup além de city_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;

-- Criar índice para notificações (performance)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- Criar índice para custom_category (busca)
CREATE INDEX IF NOT EXISTS idx_job_postings_custom_category 
ON job_postings(custom_category) WHERE custom_category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_worker_services_custom_category 
ON worker_services(custom_category) WHERE custom_category IS NOT NULL;