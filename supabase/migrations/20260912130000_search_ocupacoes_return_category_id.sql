-- search_ocupacoes ate agora so retornava categoria_principal (texto livre).
-- OfferServices.tsx inferia a categoria macro comparando esse texto contra
-- um dicionario manual (CATEGORY_NAME_TO_SLUG) que so cobria ~28% dos casos
-- (categoria_principal tem 35 valores inconsistentes por causa de
-- maiuscula/minuscula e sinonimos). Agora que ocupacoes.category_id existe
-- e esta preenchido pras 407 ocupacoes (ver migration
-- 20260912120000_ocupacoes_category_id_and_new_professions.sql), a funcao
-- passa a retornar category_id direto, eliminando a dependencia do
-- mapeamento fragil.
DROP FUNCTION IF EXISTS public.search_ocupacoes(text, integer, real);

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
  category_id UUID,
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
    o.category_id,
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

GRANT EXECUTE ON FUNCTION public.search_ocupacoes TO public;

COMMENT ON FUNCTION public.search_ocupacoes IS 'Busca fuzzy de ocupacoes com pg_trgm. Retorna category_id (FK real pra categories) desde 2026-09-12, substituindo o mapeamento fragil por categoria_principal (texto). Params: q (query), lim (limit), min_sim (similaridade minima 0-1)';
