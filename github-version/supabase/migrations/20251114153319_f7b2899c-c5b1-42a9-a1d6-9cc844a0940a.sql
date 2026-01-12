-- FASE 1: Criar tabela worker_services
CREATE TABLE IF NOT EXISTS public.worker_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  subcategory_id UUID REFERENCES public.subcategories(id),
  price DECIMAL(10,2),
  availability TEXT DEFAULT 'todos_os_dias',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca eficiente
CREATE INDEX IF NOT EXISTS idx_worker_services_user ON public.worker_services(user_id);
CREATE INDEX IF NOT EXISTS idx_worker_services_category ON public.worker_services(category_id);
CREATE INDEX IF NOT EXISTS idx_worker_services_active ON public.worker_services(active);
CREATE INDEX IF NOT EXISTS idx_worker_services_search ON public.worker_services USING gin(to_tsvector('portuguese', title || ' ' || description));

-- RLS Policies
ALTER TABLE public.worker_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own services"
  ON public.worker_services FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their own services"
  ON public.worker_services FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Public can view active services from paid users"
  ON public.worker_services FOR SELECT
  USING (active = true AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = worker_services.user_id 
    AND users.plan_active = true
  ));

-- Criar tabela job_postings
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  city_id UUID REFERENCES public.cities(id),
  neighborhood TEXT NOT NULL,
  urgent BOOLEAN DEFAULT false,
  date_time TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_job_postings_user ON public.job_postings(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_category ON public.job_postings(category_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_city ON public.job_postings(city_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_search ON public.job_postings USING gin(to_tsvector('portuguese', title || ' ' || description));

-- RLS Policies
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own job postings"
  ON public.job_postings FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their own job postings"
  ON public.job_postings FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Public can view open job postings"
  ON public.job_postings FOR SELECT
  USING (status = 'open');

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_worker_services()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_worker_services_updated_at
  BEFORE UPDATE ON public.worker_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_worker_services();

CREATE OR REPLACE FUNCTION public.update_updated_at_job_postings()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_job_postings();

-- FASE 2: Políticas RLS para Storage (avatars bucket)
-- Política para INSERT
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para UPDATE
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para SELECT (público pode ver avatars)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política para DELETE
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);