-- Duas migrations concorrentes adicionaram a mesma coisa (número da
-- residência) com nomes diferentes: house_number (20260824100100) e
-- street_number (aplicada em paralelo, fora do controle desta sessão).
-- Decisão: manter house_number. Profile.tsx já foi atualizado para parar
-- de referenciar street_number antes desta migration rodar.

ALTER TABLE public.users
  DROP COLUMN IF EXISTS street_number;
