-- Backfill do Grupo C do diagnóstico de contas órfãs (94/166 desde 04/01/2026,
-- corrigido em 20260731120000_fix_handle_new_user_safe_null_cpf.sql):
-- 84 contas reais via Google, sem CPF nos metadados, criadas antes do fix e que
-- nunca ganharam linha em public.users por causa do bug do CPF vazio colidindo
-- com a UNIQUE.
--
-- NÃO inclui:
-- - 9 contas de teste (@example.com, lixo de debug de 04/01) — removidas separadamente.
-- - nando_petro@hotmail (provider=email, CPF 28054003803) — CPF já pertence a outra
--   conta existente, é um conflito real, precisa de decisão manual, não backfill automático.
--
-- Mesma lógica do handle_new_user_safe(): cpf fica NULL (usuário completa depois via
-- CompleteProfile/Gatekeeper, já corrigidos para upsert), phone vira '' quando ausente
-- (coluna NOT NULL sem default), created_at preserva a data real de criação da conta.

INSERT INTO public.users (id, auth_id, name, cpf, email, phone, city_id, created_at, updated_at)
SELECT
  u.id,
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'name', ''), u.email, ''),
  NULL,
  COALESCE(u.email, ''),
  COALESCE(regexp_replace(u.raw_user_meta_data->>'phone', '[^0-9]', '', 'g'), ''),
  (NULLIF(u.raw_user_meta_data->>'city_id', ''))::uuid,
  u.created_at,
  now()
FROM auth.users u
LEFT JOIN public.users pu ON pu.auth_id = u.id
WHERE pu.id IS NULL
  AND u.raw_app_meta_data->>'provider' = 'google'
  AND u.email NOT LIKE '%@example.com'
ON CONFLICT (auth_id) DO NOTHING;
