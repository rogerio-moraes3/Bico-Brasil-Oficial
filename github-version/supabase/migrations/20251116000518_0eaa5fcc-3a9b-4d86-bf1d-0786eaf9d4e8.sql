-- Fase 1: Adicionar campos de plano na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_mercadopago_id 
ON payments(mercadopago_payment_id) 
WHERE mercadopago_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_user_status 
ON payments(user_id, status);

-- Adicionar comentários para documentação
COMMENT ON COLUMN users.plan_type IS 'Tipo de plano: free, basico, vip';
COMMENT ON COLUMN users.subscription_start IS 'Data de início da assinatura';
COMMENT ON COLUMN users.subscription_end IS 'Data de término da assinatura';