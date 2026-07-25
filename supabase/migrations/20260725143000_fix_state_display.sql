-- Fix: users.state is unreliable (11 users have a state that doesn't match
-- their selected city_id's real state, e.g. city in PR but state='SP').
-- The correct source of truth is cities.state via users.city_id.
-- Also adds state to users_public, which previously only exposed city.

-- CREATE OR REPLACE VIEW cannot reorder/insert columns mid-list (Postgres
-- treats that as a column rename), so the new "state" column is appended
-- at the end to keep all existing column positions/names unchanged.
CREATE OR REPLACE VIEW public.users_public AS
SELECT
  u.id,
  u.name,
  u.profile_photo,
  u.verified,
  u.category,
  u.rating_avg,
  u.rating_count,
  c.name AS city,
  u.neighborhood,
  u.type,
  u.plan_active,
  u.destaque_expires_at,
  c.state AS state
FROM users u
LEFT JOIN cities c ON c.id = u.city_id;

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

  IF result_row.city_id IS NOT NULL THEN
    SELECT name, state INTO result_row.city, result_row.state
    FROM public.cities WHERE id = result_row.city_id;
  END IF;

  RETURN result_row;
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN NULL;
  WHEN others THEN
    RETURN NULL;
END;
$function$;
