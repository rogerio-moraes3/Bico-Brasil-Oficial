-- Reverte duas policies de SELECT em public.users que expunham phone/email/cpf
-- (dado sensivel, LGPD) sem passar pelo sistema de creditos:
--
-- 1. "Authenticated can view basic worker info for search" foi dropada em
--    20251205214417 (comentario original: "P0: CRITICAL SECURITY FIX") e
--    recriada por engano em 20251226162506 — qualquer usuario logado lia a
--    linha inteira (phone/email/cpf) de qualquer worker/contractor.
-- 2. "Anon can view active worker profiles" (tambem de 20251226162506) e ainda
--    mais grave: nunca exigiu login, so a anon key publica do bundle.
--
-- Busca e perfil publico ja usam as views seguras (users_public,
-- public_worker_profiles), que nao dependem destas policies — views nao
-- respeitam RLS por padrao no Postgres, rodam com o privilegio do dono da
-- view (ver comentario em 20260723000001_fix_security_definer_views.sql:30).
DROP POLICY IF EXISTS "Authenticated can view basic worker info for search" ON public.users;
DROP POLICY IF EXISTS "Anon can view active worker profiles" ON public.users;

-- Admin.tsx:loadGeneralMetrics dependia (por acidente) da policy acima pra
-- enxergar linhas de outros usuarios. Substitui por uma view admin-gated,
-- no mesmo padrao de admin_user_list/admin_dashboard_stats: sem PII, so o
-- que a funcao realmente usa (contagem/distribuicao por cidade e por tipo,
-- crescimento mes a mes).
CREATE OR REPLACE VIEW public.admin_users_metrics AS
SELECT id, created_at, city, user_role, type
FROM public.users
WHERE public.has_role(auth.uid(), 'admin');

REVOKE ALL ON public.admin_users_metrics FROM anon, authenticated, public;
GRANT SELECT ON public.admin_users_metrics TO authenticated;
