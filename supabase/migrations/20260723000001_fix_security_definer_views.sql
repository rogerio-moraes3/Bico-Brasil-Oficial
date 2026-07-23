-- Corrige exposição de dados sensíveis via views SECURITY DEFINER
-- Achado do Supabase Advisor: users_public, admin_user_full, admin_dashboard_stats
-- e admin_user_list estavam com grants de SELECT (e até INSERT/UPDATE/DELETE/TRUNCATE)
-- para anon e/ou authenticated sem nenhuma checagem de admin.

-- users_public: reaproveitada para alimentar a vitrine pública "Profissionais em
-- Destaque" (FeaturedServicesSection.tsx), com só campos seguros — nunca CPF,
-- e-mail ou telefone.
DROP VIEW IF EXISTS public.users_public;

CREATE VIEW public.users_public AS
SELECT
  id,
  name,
  profile_photo,
  verified,
  category,
  rating_avg,
  rating_count,
  city,
  neighborhood,
  type,
  plan_active
FROM public.users;

REVOKE ALL ON public.users_public FROM anon, authenticated, public;
GRANT SELECT ON public.users_public TO anon, authenticated;

-- admin_user_full, admin_user_list, admin_dashboard_stats: continuam SECURITY
-- DEFINER de propósito (views não respeitam RLS por padrão), mas agora com
-- has_role(auth.uid(), 'admin') embutido na própria view, já que GRANT do
-- Postgres não distingue "authenticated comum" de "authenticated admin".
CREATE OR REPLACE VIEW public.admin_user_full AS
SELECT id, auth_id, name, email, cpf, phone, city, neighborhood, type, profile_photo, created_at, updated_at
FROM public.users
WHERE public.has_role(auth.uid(), 'admin');

REVOKE ALL ON public.admin_user_full FROM anon, authenticated, public;
GRANT SELECT ON public.admin_user_full TO authenticated;

CREATE OR REPLACE VIEW public.admin_user_list AS
SELECT id, display_name, city, created_at, city_id, last_mode, auth_id, name, phone, cpf, email,
       neighborhood, address, description, price, avatar_url, type, category_id, subcategory_id,
       rating_avg, rating_count, plan_active, updated_at, user_role, free_posts_remaining, verified,
       is_tester, last_usage_at, state, phone_type, jobs_done
FROM public._admin_all_users_internal() AS t(id, display_name, city, created_at, city_id, last_mode, auth_id, name, phone, cpf, email, neighborhood, address, description, price, avatar_url, type, category_id, subcategory_id, rating_avg, rating_count, plan_active, updated_at, user_role, free_posts_remaining, verified, is_tester, last_usage_at, state, phone_type, jobs_done)
WHERE public.has_role(auth.uid(), 'admin');

REVOKE ALL ON public.admin_user_list FROM anon, authenticated, public;
GRANT SELECT ON public.admin_user_list TO authenticated;

CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT * FROM (
  SELECT
    (SELECT count(*) FROM public.users WHERE true) AS total_users,
    (SELECT count(*) FROM public.users WHERE (type = 'prestador' OR user_role = 'prestador')) AS providers_active,
    (SELECT count(*) FROM public.users WHERE (type = 'cliente' OR user_role = 'cliente')) AS clients_total,
    (SELECT COALESCE(sum(amount), 0::numeric) FROM public.payments) AS revenue_total,
    now() AS generated_at
) stats
WHERE public.has_role(auth.uid(), 'admin');

REVOKE ALL ON public.admin_dashboard_stats FROM anon, authenticated, public;
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;
