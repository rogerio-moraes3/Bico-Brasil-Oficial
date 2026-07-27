-- A política de INSERT em contact_unlocks só verificava user_id = auth.uid(),
-- sem nenhum limite de quantidade — o cap de "3 desbloqueios grátis" existia
-- só no frontend (useAccessControl.ts), e podia ser burlado chamando o client
-- do Supabase direto (insert em contact_unlocks pra quantos worker_id quiser,
-- depois get_worker_contact pra cada um). Agora a trava é real, no servidor.

CREATE OR REPLACE FUNCTION public.has_unlock_capacity(p_auth_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE((SELECT is_tester OR plan_active FROM public.users WHERE auth_id = p_auth_id), false)
    OR (SELECT count(*) FROM public.contact_unlocks WHERE user_id = p_auth_id) < 3
$$;

DROP POLICY IF EXISTS "contact_unlocks_insert_own" ON public.contact_unlocks;

CREATE POLICY "contact_unlocks_insert_own"
ON public.contact_unlocks
FOR INSERT
WITH CHECK (
  user_id = (select auth.uid())
  AND public.has_unlock_capacity((select auth.uid()))
);
