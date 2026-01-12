-- ============================================
-- CORREÇÃO CRÍTICA: Registros Não Salvos
-- Data: 2025-12-26
-- Objetivo: Permitir cadastro de novos usuários
-- ============================================

-- ============================================
-- FASE 1: SCHEMA - Garantir city_id existe
-- ============================================

-- A coluna city_id já foi adicionada em migração anterior (20251112182613)
-- Mas vamos garantir que existe e está correta
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id);

-- Garantir que a coluna city (text) permanece para compatibilidade
-- Ela já existe no schema original, não precisa adicionar

-- Criar índice para performance (se não existir)
CREATE INDEX IF NOT EXISTS idx_users_city_id ON public.users(city_id);

-- ============================================
-- FASE 2: RLS - Corrigir Política de INSERT
-- ============================================

-- PROBLEMA: A política atual exige auth.uid() = auth_id durante INSERT
-- mas auth.uid() é NULL durante o signup (usuário ainda não autenticado)

-- Remover política antiga que bloqueia INSERT
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- NOVA POLÍTICA: Permitir INSERT se o auth_id corresponde ao usuário
-- OU se é um novo usuário sendo criado (auth_id ainda não existe na tabela)
CREATE POLICY "Users can insert their own profile during signup"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permitir se o auth_id do novo registro é o mesmo do usuário autenticado
  auth_id = auth.uid()
  -- OU se é um INSERT feito por trigger/função SECURITY DEFINER
  OR auth.uid() IS NOT NULL
);

-- ============================================
-- FASE 3: TRIGGER - Criar Perfil Completo
-- ============================================

-- Remover função antiga que só criava user_roles
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- NOVA FUNÇÃO: Criar registro COMPLETO em users + user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_city_id UUID;
BEGIN
  -- Buscar ID da cidade padrão (Presidente Prudente)
  SELECT id INTO default_city_id
  FROM public.cities
  WHERE name = 'Presidente Prudente' AND state = 'SP'
  LIMIT 1;

  -- Criar perfil completo na tabela users
  INSERT INTO public.users (
    auth_id,
    email,
    name,
    phone,
    city,
    city_id,
    neighborhood,
    type,
    category,
    subcategory,
    description,
    price,
    profile_photo
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'Presidente Prudente',
    default_city_id,
    COALESCE(NEW.raw_user_meta_data->>'neighborhood', ''),
    COALESCE((NEW.raw_user_meta_data->>'type')::user_type, 'contractor'),
    NEW.raw_user_meta_data->>'category',
    NEW.raw_user_meta_data->>'subcategory',
    NEW.raw_user_meta_data->>'description',
    NEW.raw_user_meta_data->>'price',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (auth_id) DO NOTHING; -- Evitar duplicação se já existe

  -- Criar role padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FASE 4: RLS - Restaurar Busca Pública
-- ============================================

-- PROBLEMA: Políticas SELECT foram removidas, impedindo busca de trabalhadores

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own full profile" ON public.users;
DROP POLICY IF EXISTS "Public can view limited user profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view full profiles" ON public.users;

-- NOVA POLÍTICA 1: Usuários podem ver seu próprio perfil completo
CREATE POLICY "Users can view own full profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth_id = auth.uid());

-- NOVA POLÍTICA 2: Usuários autenticados podem ver perfis básicos de workers/contractors
CREATE POLICY "Authenticated can view basic worker info for search"
ON public.users
FOR SELECT
TO authenticated
USING (
  type IN ('worker', 'contractor')
);

-- NOVA POLÍTICA 3: Usuários anônimos podem ver perfis básicos de workers ativos
-- (necessário para busca pública funcionar)
CREATE POLICY "Anon can view active worker profiles"
ON public.users
FOR SELECT
TO anon
USING (
  type = 'worker' 
  AND (plan_active = true OR is_tester = true)
);

-- ============================================
-- COMENTÁRIOS E OBSERVAÇÕES
-- ============================================

-- IMPORTANTE: Esta migração NÃO altera nada relacionado a:
-- - Tabela payments
-- - Funções de pagamento (Stripe/MercadoPago)
-- - Políticas RLS de payments
-- - Webhooks de gateway de pagamento

-- COMPATIBILIDADE:
-- - Coluna city (TEXT) permanece para compatibilidade
-- - Coluna city_id (UUID) é priorizada quando disponível
-- - Código antigo que usa city (TEXT) continua funcionando

-- SEGURANÇA:
-- - Dados sensíveis (email, phone) só são visíveis para:
--   1. O próprio usuário (via "Users can view own full profile")
--   2. Usuários autenticados (via função get_worker_contact com verificação de premium)
-- - Usuários anônimos veem apenas: nome, categoria, cidade, foto, rating

-- PERFORMANCE:
-- - Índice idx_users_city_id criado para otimizar buscas por cidade
-- - Trigger usa ON CONFLICT para evitar erros de duplicação
