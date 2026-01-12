-- =============================================
-- CORREÇÃO 7: Adicionar coluna is_test
-- Para facilitar limpeza de dados de teste
-- =============================================

-- 1. Adicionar coluna is_test nas tabelas principais
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false;
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false;
ALTER TABLE worker_services ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_is_test ON users(is_test);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_test ON job_postings(is_test);
CREATE INDEX IF NOT EXISTS idx_worker_services_is_test ON worker_services(is_test);
CREATE INDEX IF NOT EXISTS idx_payments_is_test ON payments(is_test);

-- 3. Comentários para documentação
COMMENT ON COLUMN users.is_test IS 'Marca registros como dados de teste para facilitar limpeza antes do lançamento';
COMMENT ON COLUMN job_postings.is_test IS 'Marca registros como dados de teste para facilitar limpeza antes do lançamento';
COMMENT ON COLUMN worker_services.is_test IS 'Marca registros como dados de teste para facilitar limpeza antes do lançamento';
COMMENT ON COLUMN payments.is_test IS 'Marca registros como dados de teste para facilitar limpeza antes do lançamento';

-- NOTA: Os dados existentes permanecem com is_test = false (dados reais)
-- NOTA: Para limpar dados de teste no futuro (SOMENTE APÓS BACKUP):
-- DELETE FROM users WHERE is_test = true;
-- DELETE FROM job_postings WHERE is_test = true;
-- DELETE FROM worker_services WHERE is_test = true;
-- DELETE FROM payments WHERE is_test = true;