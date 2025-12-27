-- Create enum for user type
CREATE TYPE public.user_type AS ENUM ('contractor', 'worker');

-- Create enum for job status
CREATE TYPE public.job_status AS ENUM ('published', 'in_progress', 'done', 'cancelled');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed');

-- Create enum for payment gateway
CREATE TYPE public.payment_gateway AS ENUM ('stripe', 'mercadopago');

-- Create users table (profiles)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  type public.user_type NOT NULL DEFAULT 'worker',
  city TEXT NOT NULL DEFAULT 'Presidente Prudente',
  neighborhood TEXT,
  category TEXT,
  subcategory TEXT,
  description TEXT,
  availability TEXT,
  price TEXT,
  profile_photo TEXT,
  verified BOOLEAN DEFAULT FALSE,
  plan_active BOOLEAN DEFAULT FALSE,
  jobs_done INTEGER DEFAULT 0,
  rating_avg FLOAT DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  urgent BOOLEAN DEFAULT FALSE,
  address TEXT,
  neighborhood TEXT,
  city TEXT DEFAULT 'Presidente Prudente',
  date_time TIMESTAMPTZ,
  contractor_name TEXT NOT NULL,
  contractor_phone TEXT NOT NULL,
  contractor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status public.job_status DEFAULT 'published',
  rating_worker INTEGER CHECK (rating_worker >= 1 AND rating_worker <= 5),
  rating_contractor INTEGER CHECK (rating_contractor >= 1 AND rating_contractor <= 5),
  contractor_comment TEXT,
  worker_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount FLOAT NOT NULL DEFAULT 9.90,
  gateway public.payment_gateway,
  status public.payment_status DEFAULT 'pending',
  webhook_response JSONB,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ratings table for storing individual ratings
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  rated_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- RLS Policies for jobs table
CREATE POLICY "Jobs are viewable by everyone"
  ON public.jobs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create jobs"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Job owner can update their job"
  ON public.jobs FOR UPDATE
  USING (auth.uid() IN (
    SELECT auth_id FROM public.users WHERE id = contractor_id
  ));

-- RLS Policies for payments table
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_id FROM public.users WHERE id = user_id
  ));

CREATE POLICY "Users can create their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT auth_id FROM public.users WHERE id = user_id
  ));

-- RLS Policies for ratings table
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT auth_id FROM public.users WHERE id = rating_user_id
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update user rating average
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    rating_avg = (
      SELECT AVG(rating)::FLOAT
      FROM public.ratings
      WHERE rated_user_id = NEW.rated_user_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.ratings
      WHERE rated_user_id = NEW.rated_user_id
    )
  WHERE id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update rating average
CREATE TRIGGER update_rating_on_insert
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_rating();

-- Insert initial categories data
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Subcategories are viewable by everyone"
  ON public.subcategories FOR SELECT
  USING (true);

-- Insert categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Construção e Reforma', 'construcao-reforma', '🧱'),
  ('Montagem e Reparos', 'montagem-reparos', '🪵'),
  ('Jardinagem e Externos', 'jardinagem-externos', '🌳'),
  ('Limpeza', 'limpeza', '🧹'),
  ('Transporte e Ajuda', 'transporte-ajuda', '🚚');

-- Insert subcategories for Construction
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, subcategory, LOWER(REPLACE(subcategory, ' ', '-'))
FROM public.categories,
UNNEST(ARRAY[
  'Pedreiro por dia',
  'Ajudante de obra',
  'Pintor residencial',
  'Encanador',
  'Eletricista',
  'Gesseiro',
  'Azulejista',
  'Carpinteiro',
  'Serraleiro/Soldador'
]) AS subcategory
WHERE slug = 'construcao-reforma';

-- Insert subcategories for Assembly
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, subcategory, LOWER(REPLACE(subcategory, ' ', '-'))
FROM public.categories,
UNNEST(ARRAY[
  'Montagem de móveis',
  'Desmontagem',
  'Instalação de TV',
  'Instalação de cortinas',
  'Instalação de prateleiras',
  'Troca de fechaduras',
  'Limpeza de caixa d''água',
  'Troca de chuveiro/lâmpadas'
]) AS subcategory
WHERE slug = 'montagem-reparos';

-- Insert subcategories for Gardening
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, subcategory, LOWER(REPLACE(subcategory, ' ', '-'))
FROM public.categories,
UNNEST(ARRAY[
  'Corte de grama',
  'Poda de árvores',
  'Capina',
  'Pintura de muro',
  'Limpeza de quintal',
  'Lavagem de calçada',
  'Manutenção de jardim',
  'Manutenção de piscina'
]) AS subcategory
WHERE slug = 'jardinagem-externos';

-- Insert subcategories for Cleaning
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, subcategory, LOWER(REPLACE(subcategory, ' ', '-'))
FROM public.categories,
UNNEST(ARRAY[
  'Faxina residencial',
  'Limpeza pós-obra',
  'Lavagem de vidros',
  'Limpeza de garagem',
  'Limpeza de tapetes',
  'Limpeza de fachada',
  'Limpeza de toldos',
  'Limpeza de calhas'
]) AS subcategory
WHERE slug = 'limpeza';

-- Insert subcategories for Transport
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, subcategory, LOWER(REPLACE(subcategory, ' ', '-'))
FROM public.categories,
UNNEST(ARRAY[
  'Ajudante de mudança',
  'Descarregar caminhão',
  'Moto-frete',
  'Motorista por diária',
  'Panfletagem',
  'Montagem de barracas/tendas',
  'Transporte leve'
]) AS subcategory
WHERE slug = 'transporte-ajuda';