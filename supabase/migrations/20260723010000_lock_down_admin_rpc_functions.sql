-- Corrige funções SECURITY DEFINER chamáveis diretamente por anon via RPC,
-- sem checagem de admin interna, driblando as views corrigidas anteriormente
-- (admin_user_list, admin_user_full, admin_dashboard_stats). Achado ao investigar
-- os alertas CRITICAL do Supabase Advisor.

-- 1) _admin_all_users_internal — sem uso no app, tranca dos dois lados
REVOKE EXECUTE ON FUNCTION public._admin_all_users_internal() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public._admin_all_users_internal()
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  RETURN QUERY SELECT * FROM public.users;
END;$function$;

-- 2) get_admin_records — idem
REVOKE EXECUTE ON FUNCTION public.get_admin_records(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_records(metric_type text)
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF metric_type = 'users' THEN
    RETURN QUERY SELECT * FROM public.users;
    RETURN;
  ELSIF metric_type = 'providers' THEN
    RETURN QUERY SELECT * FROM public.users WHERE type = 'prestador' OR user_role = 'prestador';
    RETURN;
  ELSE
    RAISE EXCEPTION 'Unsupported metric_type: %', metric_type;
  END IF;
END;
$function$;

-- 3) get_admin_users — idem
REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(id uuid, auth_id uuid, name text, email text, phone text, cpf text, city text, state text, neighborhood text, category text, subcategory text, user_role text, verified boolean, plan_active boolean, is_tester boolean, created_at timestamp with time zone, last_usage_at timestamp with time zone, profile_photo text, view_credits integer, free_posts_remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  SELECT
    u.id, u.auth_id, u.name, u.email, u.phone, u.cpf, u.city, u.state, u.neighborhood,
    u.category_id::text AS category, u.subcategory_id::text AS subcategory, u.user_role, u.verified, u.plan_active,
    u.is_tester, u.created_at, u.last_usage_at, u.profile_photo, NULL::integer AS view_credits, u.free_posts_remaining
  FROM public.users u
  ORDER BY u.created_at DESC;
END;
$function$;

-- 4) get_admin_count — idem
REVOKE EXECUTE ON FUNCTION public.get_admin_count(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_count(metric_type text)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $function$
SELECT CASE
  WHEN NOT public.has_role(auth.uid(), 'admin') THEN NULL
  WHEN metric_type = 'users' THEN (SELECT COUNT(*) FROM public.users)
  WHEN metric_type = 'providers' THEN (SELECT COUNT(*) FROM public.users WHERE type = 'prestador' OR user_role = 'prestador')
  WHEN metric_type = 'clients' THEN (SELECT COUNT(*) FROM public.users WHERE type = 'cliente' OR user_role = 'cliente')
  ELSE NULL
END;
$function$;

-- 5) get_user_details_by_id — CONTINUA pública (WorkerProfile.tsx depende dela
-- para exibir o perfil público do prestador), mas nunca mais devolve
-- cpf/email/phone/phone_type/address. Mantido RETURNS users (mesmo formato que
-- o supabase-js já espera) para não quebrar o componente.
CREATE OR REPLACE FUNCTION public.get_user_details_by_id(target_user_id uuid)
RETURNS users
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
  result_row public.users%ROWTYPE;
BEGIN
  IF target_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO result_row
  FROM public.users
  WHERE id = target_user_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  result_row.cpf := NULL;
  result_row.email := NULL;
  result_row.phone := NULL;
  result_row.phone_type := NULL;
  result_row.address := NULL;

  RETURN result_row;
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN NULL;
  WHEN others THEN
    RETURN NULL;
END;
$function$;
