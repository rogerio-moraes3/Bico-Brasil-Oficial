-- Adicionar novos campos à tabela payments para suportar PIX do Mercado Pago
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS qr_code TEXT,
  ADD COLUMN IF NOT EXISTS qr_code_base64 TEXT,
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS plan_type TEXT,
  ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payments_mercadopago_id ON payments(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);

-- Comentários para documentação
COMMENT ON COLUMN payments.qr_code IS 'Código PIX copia e cola';
COMMENT ON COLUMN payments.qr_code_base64 IS 'Imagem QR Code em base64';
COMMENT ON COLUMN payments.mercadopago_payment_id IS 'ID do pagamento no Mercado Pago';
COMMENT ON COLUMN payments.plan_type IS 'Tipo do plano: basico, vip, destaque';
COMMENT ON COLUMN payments.expiration_date IS 'Data de expiração do pagamento PIX';