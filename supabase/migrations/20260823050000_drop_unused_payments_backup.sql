-- Achado #7 da auditoria de segurança (item 13): payments_backup ainda em
-- produção, sem uso confirmado. Verificado antes de dropar: 0 linhas na
-- tabela, nenhuma referência no código (src/, supabase/functions/).
-- Isolada por RLS (só service_role) então nunca foi um risco de exposição,
-- mas é uma ponta solta sem função — removida por limpeza.

DROP TABLE IF EXISTS public.payments_backup;
