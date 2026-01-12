-- 1. Remover policy UPDATE existente (incompleta - sem WITH CHECK)
DROP POLICY IF EXISTS "Users can update their own services" ON public.worker_services;

-- 2. Criar policy UPDATE completa com USING e WITH CHECK
CREATE POLICY "Users can update their own services"
ON public.worker_services
FOR UPDATE
USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- 3. Criar policy DELETE (não existia)
CREATE POLICY "Users can delete their own services"
ON public.worker_services
FOR DELETE
USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));