-- A migration de ontem (20260910150000_reset_free_posts_remaining_and_fix_gate.sql)
-- resetou as 215 contas existentes pra free_posts_remaining = 10, mas nao
-- alterou o DEFAULT da coluna, que continuou em 3 (herdado de antes da cota
-- ter sido definida como 10 publicacoes gratis no produto). Resultado: toda
-- conta nova criada depois daquela migration nasceu com 3 em vez de 10.
--
-- Corrige o DEFAULT pra 10, alinhando com o texto exibido ao usuario ("suas
-- 10 publicacoes gratis") e com o valor que as contas existentes ja tem.
ALTER TABLE public.users
  ALTER COLUMN free_posts_remaining SET DEFAULT 10;

COMMENT ON COLUMN public.users.free_posts_remaining IS
  'Publicacoes gratis restantes pra contratantes (type=contractor). Cota de 10, decrementada a cada job_postings novo. DEFAULT corrigido pra 10 em 2026-09-11 (estava em 3, resquicio de antes da cota do produto ser 10).';
