-- Migration: Etapa 1 - Create ocupacoes table with RLS
-- Parte das Etapas 1-4: Modelo canônico de ocupações

-- Enable extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create ocupacoes table
CREATE TABLE IF NOT EXISTS public.ocupacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome_oficial TEXT NOT NULL,
  descricao_simples TEXT NOT NULL,
  categoria_principal TEXT NOT NULL,
  tipo_trabalho TEXT NOT NULL CHECK (tipo_trabalho IN ('braçal', 'técnico', 'misto')),
  nivel_instrucao TEXT NOT NULL CHECK (nivel_instrucao IN ('baixa', 'media', 'alta')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on categoria_principal for future filtering
CREATE INDEX IF NOT EXISTS idx_ocupacoes_categoria 
ON public.ocupacoes(categoria_principal) 
WHERE ativo = true;

-- Enable RLS
ALTER TABLE public.ocupacoes ENABLE ROW LEVEL SECURITY;

-- Policy: Public SELECT onde ativo = true (catálogo público somente-leitura)
DROP POLICY IF EXISTS ocupacoes_public_select ON public.ocupacoes;
CREATE POLICY ocupacoes_public_select
ON public.ocupacoes
FOR SELECT
TO public
USING (ativo = true);

-- Comment
COMMENT ON TABLE public.ocupacoes IS 'Catálogo canônico de ocupações para busca inclusiva com tolerância a erros';
COMMENT ON COLUMN public.ocupacoes.slug IS 'Identificador imutável legível por humanos';
COMMENT ON COLUMN public.ocupacoes.descricao_simples IS 'Descrição em linguagem popular (acessível)';
COMMENT ON COLUMN public.ocupacoes.tipo_trabalho IS 'Classificação: braçal, técnico ou misto';
COMMENT ON COLUMN public.ocupacoes.nivel_instrucao IS 'Nível de instrução típico: baixa, media, alta';
