-- ✅ AJUSTE DO BANCO PARA CADASTRO SIMPLIFICADO
-- Execute este SQL no Supabase SQL Editor

-- Tornar campos opcionais na tabela users
ALTER TABLE users 
  ALTER COLUMN type DROP NOT NULL,
  ALTER COLUMN user_role SET DEFAULT 'prestador',
  ALTER COLUMN category DROP NOT NULL,
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN price DROP NOT NULL,
  ALTER COLUMN primary_contact_method SET DEFAULT 'whatsapp';

-- Verificar se funcionou
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('type', 'user_role', 'category', 'description', 'price', 'primary_contact_method');
