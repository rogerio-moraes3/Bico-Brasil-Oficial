-- FASE 4: Criar função RPC para decrementar créditos de visualização
CREATE OR REPLACE FUNCTION decrement_view_credits(user_auth_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET view_credits = GREATEST(0, COALESCE(view_credits, 3) - 1)
  WHERE auth_id = user_auth_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FASE 4: Adicionar coluna view_credits se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'view_credits'
  ) THEN
    ALTER TABLE users ADD COLUMN view_credits INTEGER DEFAULT 3;
  END IF;
END $$;