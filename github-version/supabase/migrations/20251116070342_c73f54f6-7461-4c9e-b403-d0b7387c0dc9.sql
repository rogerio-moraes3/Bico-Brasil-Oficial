-- Remover política antiga que exige plan_active
DROP POLICY IF EXISTS "Public can view active services from paid users" ON worker_services;

-- Nova política: permite visualizar todos os serviços ativos
-- O controle de limite de visualizações gratuitas é feito no frontend via useAccessControl
CREATE POLICY "Public can view active services" 
ON worker_services 
FOR SELECT 
USING (active = true);