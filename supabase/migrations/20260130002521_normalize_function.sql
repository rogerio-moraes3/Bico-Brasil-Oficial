-- Migration: Etapa 3 - Normalization function
-- Função para normalizar texto de busca com redução de espaços duplicados

CREATE OR REPLACE FUNCTION public.normalize_busca_texto(input TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
STRICT
AS $$
  SELECT REGEXP_REPLACE(
    TRIM(REGEXP_REPLACE(
      LOWER(UNACCENT(input)),
      '[^a-z0-9\s]', '', 'g'
    )),
    '\s+', ' ', 'g'
  );
$$;

-- Comment
COMMENT ON FUNCTION public.normalize_busca_texto IS 'Normaliza texto: lowercase, remove acentos, remove pontuação, reduz espaços duplicados';

-- Example usage (documentation)
-- SELECT public.normalize_busca_texto('Ajudante  de   Pedreiro!!!');
-- Resultado: 'ajudante de pedreiro'
