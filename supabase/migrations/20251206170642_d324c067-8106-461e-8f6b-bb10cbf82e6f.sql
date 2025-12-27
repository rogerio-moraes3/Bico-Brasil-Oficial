-- 1. Remover policy SELECT atual que só mostra ativos
DROP POLICY IF EXISTS "Public can view active services" ON public.worker_services;

-- 2. Criar nova policy SELECT que permite:
--    - Qualquer pessoa ver serviços ATIVOS
--    - Dono ver TODOS os seus serviços (ativos e inativos)
CREATE POLICY "View own or active services"
ON public.worker_services
FOR SELECT
USING (
  active = true 
  OR 
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);