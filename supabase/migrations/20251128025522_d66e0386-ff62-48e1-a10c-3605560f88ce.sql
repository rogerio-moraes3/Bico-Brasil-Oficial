-- 1) Criar função SECURITY DEFINER que bypassa RLS para verificar email na whitelist
CREATE OR REPLACE FUNCTION public.is_colaborador_autorizado(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM colaboradores_autorizados
    WHERE email = check_email
  );
$$;

-- 2) Dropar policy problemática que causa recursão
DROP POLICY IF EXISTS "Colaboradores podem gerenciar whitelist" ON colaboradores_autorizados;

-- 3) Criar nova policy segura usando a função SECURITY DEFINER
CREATE POLICY "Colaboradores podem gerenciar whitelist (safe)" 
ON colaboradores_autorizados
FOR ALL
USING (is_colaborador_autorizado(auth.email()))
WITH CHECK (is_colaborador_autorizado(auth.email()));