-- Cria a função que faltava para o gate de 3 consultas grátis funcionar de
-- verdade. WorkerProfile.tsx já chamava get_worker_contact, mas ela nunca
-- existiu no banco. Consolida o mecanismo em contact_unlocks (dono do
-- contato, premium/tester, ou já desbloqueado antes liberam o telefone).
CREATE OR REPLACE FUNCTION public.get_worker_contact(worker_id uuid)
RETURNS TABLE(phone text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  caller_internal_id uuid;
  caller_premium boolean;
BEGIN
  SELECT id, (COALESCE(is_tester, false) OR COALESCE(plan_active, false))
    INTO caller_internal_id, caller_premium
  FROM public.users
  WHERE auth_id = auth.uid();

  IF caller_internal_id IS NULL THEN
    RETURN;
  END IF;

  IF caller_internal_id = worker_id OR caller_premium THEN
    RETURN QUERY SELECT u.phone, u.email FROM public.users u WHERE u.id = worker_id;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.contact_unlocks cu
    WHERE cu.user_id = auth.uid() AND cu.worker_id = worker_id
  ) THEN
    RETURN QUERY SELECT u.phone, u.email FROM public.users u WHERE u.id = worker_id;
    RETURN;
  END IF;

  RETURN;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_worker_contact(uuid) TO authenticated;
