-- Adicionar valor in_process ao enum payment_status
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'in_process';

-- Adicionar campos de controle de uso gratuito na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_usage_at TIMESTAMP WITH TIME ZONE;

-- Criar função para incrementar contador de uso
CREATE OR REPLACE FUNCTION increment_usage_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Incrementar quando criar job ou oferecer serviço
  UPDATE users 
  SET usage_count = usage_count + 1,
      last_usage_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para jobs
DROP TRIGGER IF EXISTS on_job_created ON jobs;
CREATE TRIGGER on_job_created
AFTER INSERT ON jobs
FOR EACH ROW
WHEN (NEW.contractor_id IS NOT NULL)
EXECUTE FUNCTION increment_usage_count();

-- Criar trigger para serviços oferecidos
DROP TRIGGER IF EXISTS on_service_offered ON worker_services;
CREATE TRIGGER on_service_offered
AFTER INSERT ON worker_services
FOR EACH ROW
EXECUTE FUNCTION increment_usage_count();