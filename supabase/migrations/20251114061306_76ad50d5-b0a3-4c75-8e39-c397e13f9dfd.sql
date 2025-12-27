-- Forçar regeneração de tipos para phone_type
COMMENT ON COLUMN users.phone_type IS 'Tipo de telefone: whatsapp_only, whatsapp_and_call, call_only';

-- Garantir que o campo availability existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'availability') THEN
    ALTER TABLE users ADD COLUMN availability TEXT;
  END IF;
END $$;