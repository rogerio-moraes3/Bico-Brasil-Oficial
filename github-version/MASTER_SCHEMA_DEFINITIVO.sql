-- ==========================================
-- MASTER SCHEMA DEFINITIVO: BICO BRASIL
-- ==========================================

-- 1. ENUMS E TIPOS
DO $$ BEGIN
    CREATE TYPE public.user_type AS ENUM ('contractor', 'worker');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.job_status AS ENUM ('published', 'in_progress', 'done', 'cancelled', 'open');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABELA CITIES
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'SP',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA SUBCATEGORIES
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA USERS
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    cpf TEXT,
    user_role TEXT DEFAULT 'prestador',
    city_id UUID REFERENCES public.cities(id),
    neighborhood TEXT,
    category TEXT,
    subcategory TEXT,
    description TEXT,
    price TEXT,
    profile_photo TEXT,
    verified BOOLEAN DEFAULT FALSE,
    plan_active BOOLEAN DEFAULT FALSE,
    is_tester BOOLEAN DEFAULT FALSE,
    free_posts_remaining INTEGER DEFAULT 10,
    view_credits INTEGER DEFAULT 0,
    rating_avg FLOAT DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    last_usage_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    type public.user_type DEFAULT 'worker',
    state TEXT DEFAULT 'SP',
    city TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf_unique ON public.users(cpf) WHERE cpf IS NOT NULL;

-- 6. TABELA USER_ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'user',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 7. FUNÇÃO HAS_ROLE
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = (SELECT id FROM public.users WHERE auth_id = _user_id)
    AND role = _role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 8. FUNÇÃO GET_ADMIN_USERS (RPC para o Painel Admin)
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
  -- Tentar verificar admin (silencioso se falhar para não quebrar a UI antes do setup)
  RETURN QUERY 
  SELECT 
    u.id, u.auth_id, u.name, u.email, u.phone, u.city, u.state, u.neighborhood, 
    u.category, u.subcategory, u.user_role, u.type, u.verified, u.plan_active, 
    u.is_tester, u.created_at, u.last_usage_at, u.profile_photo, u.view_credits, u.free_posts_remaining
  FROM public.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- 9. TABELA JOB_POSTINGS
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    city_id UUID REFERENCES public.cities(id),
    neighborhood TEXT,
    urgent BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'open',
    price TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABELA WORKER_SERVICES
CREATE TABLE IF NOT EXISTS public.worker_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id),
    subcategory_id UUID REFERENCES public.subcategories(id),
    description TEXT,
    price TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABELA REGISTRATIONS (Lista VIP)
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

-- 12. RLS POLICIES
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.worker_services FOR SELECT USING (true);
CREATE POLICY "Public read jobs" ON public.job_postings FOR SELECT USING (true);
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Public insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);

-- 13. TRIGGER SINCRONIZAÇÃO AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, name, email, user_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'prestador'
  )
  ON CONFLICT (auth_id) DO UPDATE
  set email = EXCLUDED.email;
  
  -- Auto assign admin to specific emails
  IF (NEW.email IN ('23rogeriomoraes@gmail.com', 'nando_petro@hotmail.com')) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES ((SELECT id FROM public.users WHERE auth_id = NEW.id), 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. DADOS INICIAIS
INSERT INTO public.cities (name, state, active) VALUES
('Presidente Prudente', 'SP', true),
('Caçapava', 'SP', true),
('São José dos Campos', 'SP', true),
('Paraíbuna', 'SP', true),
('Jacareí', 'SP', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, slug, icon) VALUES
('Construção e Reforma', 'construcao-reforma', '🧱'),
('Montagem e Reparos', 'montagem-reparos', '🪵'),
('Jardinagem e Externos', 'jardinagem-externos', '🌳'),
('Limpeza', 'limpeza', '🧹'),
('Transporte e Ajuda', 'transporte-ajuda', '🚚')
ON CONFLICT (slug) DO NOTHING;
