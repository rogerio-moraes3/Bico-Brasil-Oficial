-- Correção 2: Adicionar city_id à tabela jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- Atualizar jobs existentes com cidade padrão (Presidente Prudente)
UPDATE jobs 
SET city_id = (SELECT id FROM cities WHERE name = 'Presidente Prudente' LIMIT 1)
WHERE city_id IS NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_jobs_city_id ON jobs(city_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status_city ON jobs(status, city_id);
CREATE INDEX IF NOT EXISTS idx_users_plan_active_city ON users(plan_active, city_id) WHERE type = 'worker';