-- FASE 1: Adicionar campo is_tester e criar tabela de tracking

-- 1.1 Adicionar coluna is_tester na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_tester BOOLEAN DEFAULT false;

-- Marcar Rogério e Fernando como beta testers
UPDATE users 
SET is_tester = true 
WHERE auth_id IN (
  '26fd13cb-22d6-4754-9adc-536218b9a831',  -- Rogério Moraes
  '1f749779-e001-4c87-8aab-46636aa92117'   -- Fernando dos Santos Lima
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_is_tester ON users(is_tester);

-- 1.2 Criar tabela profile_views para rastrear visualizações
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_profile_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(viewer_id, viewed_profile_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_profile ON profile_views(viewed_profile_id);

-- 1.3 Habilitar RLS na tabela profile_views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profile_views
CREATE POLICY "Users can record their own profile views"
  ON profile_views
  FOR INSERT
  TO authenticated
  WITH CHECK (viewer_id = auth.uid());

CREATE POLICY "Users can view their own profile views"
  ON profile_views
  FOR SELECT
  TO authenticated
  USING (viewer_id = auth.uid());

-- 1.4 Criar função helper para verificar se é tester
CREATE OR REPLACE FUNCTION is_beta_tester(user_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_tester FROM users WHERE auth_id = user_auth_id),
    false
  );
$$;

-- 1.5 Atualizar política RLS de users para expor is_tester
DROP POLICY IF EXISTS "Public can view worker profiles without contact" ON users;

CREATE POLICY "Public can view worker profiles without sensitive data"
  ON users
  FOR SELECT
  USING (
    (type = 'worker' AND plan_active = true)
    OR 
    (auth.uid() = auth_id)
  );