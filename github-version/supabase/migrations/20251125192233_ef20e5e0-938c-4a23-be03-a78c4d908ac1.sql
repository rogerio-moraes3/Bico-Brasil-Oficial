-- CORREÇÃO 1: Alterar política RLS de users para permitir busca de todos os profissionais
-- Remove política atual restritiva
DROP POLICY IF EXISTS "Public can view worker profiles without sensitive data" ON users;

-- Cria nova política que permite ver workers e contractors sem restrição de plan_active
CREATE POLICY "Public can view worker profiles without sensitive data" 
ON users FOR SELECT
USING (
  -- Qualquer pessoa pode ver workers (sem necessidade de plan_active)
  (type = 'worker'::user_type)
  OR 
  -- Qualquer pessoa pode ver contractors para joins em job_postings
  (type = 'contractor'::user_type)
  OR
  -- Usuário sempre pode ver seu próprio perfil
  (auth.uid() = auth_id)
);

-- CORREÇÃO 2: Adicionar política de DELETE em notifications
-- Esta política estava faltando, causando falha silenciosa nas exclusões
CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);