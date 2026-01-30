-- Migration: Etapa 2 - Create ocupacao_termos_busca table with RLS
-- Termos de busca com normalização e peso de relevância

CREATE TABLE IF NOT EXISTS public.ocupacao_termos_busca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ocupacao_id UUID NOT NULL REFERENCES public.ocupacoes(id) ON DELETE CASCADE,
  termo TEXT NOT NULL,
  termo_norm TEXT NOT NULL,
  tipo_termo TEXT NOT NULL CHECK (tipo_termo IN ('oficial', 'popular', 'erro_ortografico', 'regional', 'giria')),
  peso_relevancia INTEGER NOT NULL DEFAULT 5 CHECK (peso_relevancia BETWEEN 1 AND 10),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ocupacao_id, termo_norm)
);

-- Enable RLS
ALTER TABLE public.ocupacao_termos_busca ENABLE ROW LEVEL SECURITY;

-- Policy: Public SELECT onde ativo = true (catálogo público somente-leitura)
DROP POLICY IF EXISTS termos_public_select ON public.ocupacao_termos_busca;
CREATE POLICY termos_public_select
ON public.ocupacao_termos_busca
FOR SELECT
TO public
USING (ativo = true);

-- Comment
COMMENT ON TABLE public.ocupacao_termos_busca IS 'Termos de busca associados a ocupações com suporte a fuzzy matching';
COMMENT ON COLUMN public.ocupacao_termos_busca.termo IS 'Termo original não normalizado';
COMMENT ON COLUMN public.ocupacao_termos_busca.termo_norm IS 'Termo normalizado (usado na busca)';
COMMENT ON COLUMN public.ocupacao_termos_busca.tipo_termo IS 'Classificação: oficial, popular, erro_ortografico, regional, giria';
COMMENT ON COLUMN public.ocupacao_termos_busca.peso_relevancia IS 'Peso 1-10 para ordenação de resultados';
