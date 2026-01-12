-- 1) Criar tabela registrations
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  cidade text NOT NULL,
  tipo_interesse text NOT NULL,
  phone text,
  source text DEFAULT 'landing',
  created_at timestamptz DEFAULT now()
);

-- 2) Habilitar RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 3) Policy INSERT público (qualquer um pode cadastrar)
CREATE POLICY "public_insert_registrations"
ON public.registrations
FOR INSERT
WITH CHECK (true);

-- 4) Policy SELECT somente admin (usando has_role existente)
CREATE POLICY "admin_select_registrations"
ON public.registrations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5) Migrar dados existentes de pre_cadastro
INSERT INTO public.registrations (nome, email, cidade, tipo_interesse, source, created_at)
SELECT nome, email, cidade, tipo_interesse, 'migrated_pre'::text, COALESCE(created_at, now())
FROM public.pre_cadastro
ON CONFLICT DO NOTHING;

-- 6) Índice para performance
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);

-- 7) Função RPC segura para admin visualizar usuários
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id uuid,
  auth_id uuid,
  name text,
  email text,
  phone text,
  city text,
  state text,
  neighborhood text,
  category text,
  subcategory text,
  user_role text,
  type user_type,
  verified boolean,
  plan_active boolean,
  is_tester boolean,
  created_at timestamptz,
  last_usage_at timestamptz,
  profile_photo text,
  view_credits integer,
  free_posts_remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o caller é admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Retornar dados (excluindo CPF, endereço completo, documentos sensíveis)
  RETURN QUERY 
  SELECT 
    u.id,
    u.auth_id,
    u.name,
    u.email,
    u.phone,
    u.city,
    u.state,
    u.neighborhood,
    u.category,
    u.subcategory,
    u.user_role,
    u.type,
    u.verified,
    u.plan_active,
    u.is_tester,
    u.created_at,
    u.last_usage_at,
    u.profile_photo,
    u.view_credits,
    u.free_posts_remaining
  FROM public.users u
  ORDER BY u.created_at DESC;
END;
$$;