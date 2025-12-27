-- Criar tabela de colaboradores autorizados (whitelist)
CREATE TABLE IF NOT EXISTS public.colaboradores_autorizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Inserir os 3 colaboradores iniciais
INSERT INTO public.colaboradores_autorizados (email, nome) VALUES
('rogerio.moraes082@gmail.com', 'Rogério Moraes'),
('fernandojosecorrea19@gmail.com', 'Fernando José'),
('joshuanunessousa@gmail.com', 'Joshua Nunes')
ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.colaboradores_autorizados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Colaboradores podem gerenciar whitelist"
ON public.colaboradores_autorizados
FOR ALL
USING (
  auth.email() IN (SELECT email FROM public.colaboradores_autorizados)
);

CREATE POLICY "Público pode verificar whitelist"
ON public.colaboradores_autorizados
FOR SELECT
USING (true);

-- Criar tabela de pré-cadastro para captura de leads
CREATE TABLE IF NOT EXISTS public.pre_cadastro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cidade TEXT NOT NULL,
  tipo_interesse TEXT NOT NULL CHECK (tipo_interesse IN ('fazer_bico', 'anunciar_servico')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.pre_cadastro ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Qualquer um pode inserir pré-cadastro"
ON public.pre_cadastro
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Colaboradores podem visualizar pré-cadastros"
ON public.pre_cadastro
FOR SELECT
USING (
  auth.email() IN (SELECT email FROM public.colaboradores_autorizados)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON public.colaboradores_autorizados(email);
CREATE INDEX IF NOT EXISTS idx_pre_cadastro_created_at ON public.pre_cadastro(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pre_cadastro_tipo ON public.pre_cadastro(tipo_interesse);