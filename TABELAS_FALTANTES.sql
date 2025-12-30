-- ==========================================
-- SCRIPT COMPLEMENTAR: TABELAS FALTANTES
-- ==========================================

-- 1. TABELA CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA SUBCATEGORIES
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA WORKER_SERVICES
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

-- 4. TABELA REGISTRATIONS (Lista VIP)
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

-- 5. POLÍTICAS RLS PARA TABELAS NOVAS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.worker_services FOR SELECT USING (true);
CREATE POLICY "Public insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);

-- 6. DADOS INICIAIS DE CATEGORIAS
INSERT INTO public.categories (name, slug, icon) VALUES
('Construção e Reforma', 'construcao-reforma', '🧱'),
('Montagem e Reparos', 'montagem-reparos', '🪵'),
('Jardinagem e Externos', 'jardinagem-externos', '🌳'),
('Limpeza', 'limpeza', '🧹'),
('Transporte e Ajuda', 'transporte-ajuda', '🚚')
ON CONFLICT (slug) DO NOTHING;

-- 7. DADOS INICIAIS DE SUBCATEGORIAS
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, sub_name, LOWER(REPLACE(sub_name, ' ', '-'))
FROM public.categories,
UNNEST(ARRAY[
  'Pedreiro por dia', 'Ajudante de obra', 'Pintor residencial', 'Encanador', 'Eletricista'
]) AS sub_name WHERE slug = 'construcao-reforma'
ON CONFLICT DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, sub_name, LOWER(REPLACE(sub_name, ' ', '-'))
FROM public.categories,
UNNEST(ARRAY[
  'Montagem de móveis', 'Instalação de TV', 'Instalação de cortinas', 'Troca de chuveiro'
]) AS sub_name WHERE slug = 'montagem-reparos'
ON CONFLICT DO NOTHING;

-- 8. VÍNCULOS FALTANTES (Garantir que as tabelas existentes tenham as FKs corretas)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_postings' AND column_name='category_id') THEN
        ALTER TABLE public.job_postings ADD COLUMN category_id UUID REFERENCES public.categories(id);
    END IF;
END $$;
