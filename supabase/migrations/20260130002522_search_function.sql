-- Migration: Etapa 4 - Fuzzy search with pg_trgm
-- Índices GIN e função RPC para busca tolerante a erros

-- Create GIN index on termo_norm for trigram similarity
CREATE INDEX IF NOT EXISTS idx_termos_norm_trgm
ON public.ocupacao_termos_busca
USING GIN (termo_norm gin_trgm_ops);

-- Create GIN index on nome_oficial for direct search (optional but useful)
CREATE INDEX IF NOT EXISTS idx_ocupacoes_nome_trgm
ON public.ocupacoes
USING GIN (LOWER(nome_oficial) gin_trgm_ops);

-- Create search function (RPC)
CREATE OR REPLACE FUNCTION public.search_ocupacoes(
  q TEXT,
  lim INT DEFAULT 10,
  min_sim REAL DEFAULT 0.3
)
RETURNS TABLE (
  ocupacao_id UUID,
  slug TEXT,
  nome_oficial TEXT,
  descricao_simples TEXT,
  categoria_principal TEXT,
  tipo_trabalho TEXT,
  nivel_instrucao TEXT,
  termo_match TEXT,
  similarity_score REAL
)
LANGUAGE SQL
STABLE
AS $$
  WITH query_normalized AS (
    SELECT public.normalize_busca_texto(q) AS qn
  ),
  matches AS (
    SELECT
      t.ocupacao_id,
      t.termo,
      t.peso_relevancia,
      SIMILARITY(t.termo_norm, qn.qn) AS sim
    FROM public.ocupacao_termos_busca t, query_normalized qn
    WHERE t.ativo = true
      AND SIMILARITY(t.termo_norm, qn.qn) >= min_sim
  )
  SELECT
    o.id AS ocupacao_id,
    o.slug,
    o.nome_oficial,
    o.descricao_simples,
    o.categoria_principal,
    o.tipo_trabalho,
    o.nivel_instrucao,
    m.termo AS termo_match,
    m.sim AS similarity_score
  FROM matches m
  JOIN public.ocupacoes o ON m.ocupacao_id = o.id
  WHERE o.ativo = true
  ORDER BY m.sim DESC, m.peso_relevancia DESC, o.nome_oficial ASC
  LIMIT lim;
$$;

-- Comment
COMMENT ON FUNCTION public.search_ocupacoes IS 'Busca fuzzy de ocupações com pg_trgm. Params: q (query), lim (limit), min_sim (similaridade mínima 0-1)';

-- Grant execute to public (RPC pode ser chamado sem auth para busca pública)
GRANT EXECUTE ON FUNCTION public.search_ocupacoes TO public;
GRANT EXECUTE ON FUNCTION public.normalize_busca_texto TO public;
