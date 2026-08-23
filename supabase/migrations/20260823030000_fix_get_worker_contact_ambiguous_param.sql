-- BUG CRÍTICO EM PRODUÇÃO: get_worker_contact(worker_id uuid) falhava com
-- "column reference 'worker_id' is ambiguous" (Postgres 42702) para TODO
-- usuário não-premium/não-tester, sempre que a função chegava na checagem
-- de contato já desbloqueado:
--
--   WHERE cu.user_id = auth.uid() AND cu.worker_id = worker_id
--
-- O parâmetro da função se chama "worker_id" — igual à coluna
-- contact_unlocks.worker_id usada na mesma subquery. PL/pgSQL não consegue
-- decidir se "worker_id" (sem qualificador) se refere ao parâmetro ou à
-- coluna, e aborta com erro. Como esse é exatamente o branch usado pelos
-- 3 desbloqueios grátis (a própria feature "3 contatos grátis"), a função
-- falhava sempre que alguém tentava usar sua cota grátis — depois de já
-- ter sido debitada em contact_unlocks pelo INSERT feito no client antes
-- desta chamada (ver useAccessControl.unlockWorkerContact). Usuário perdia
-- 1 de 3 desbloqueios e não recebia telefone algum.
--
-- Fix: renomeia o parâmetro para p_worker_id (sem conflito com nenhuma
-- coluna). Corpo da função idêntico ao já rodando em produção, só com a
-- referência ambígua eliminada. Client precisa passar { p_worker_id }
-- em vez de { worker_id } — atualizado em WhatsAppContactButton.tsx,
-- WorkerProfile.tsx e UnlockWithCredits.tsx no mesmo commit.

-- Postgres não permite renomear parâmetro via CREATE OR REPLACE; precisa dropar antes.
DROP FUNCTION IF EXISTS public.get_worker_contact(uuid);

CREATE FUNCTION public.get_worker_contact(p_worker_id uuid)
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

  IF caller_internal_id = p_worker_id OR caller_premium THEN
    RETURN QUERY SELECT u.phone, u.email FROM public.users u WHERE u.id = p_worker_id;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.contact_unlocks cu
    WHERE cu.user_id = auth.uid() AND cu.worker_id = p_worker_id
  ) THEN
    RETURN QUERY SELECT u.phone, u.email FROM public.users u WHERE u.id = p_worker_id;
    RETURN;
  END IF;

  RETURN;
END;
$function$;

-- DROP FUNCTION apaga os GRANTs junto; restaura os mesmos papéis que a versão anterior tinha.
GRANT EXECUTE ON FUNCTION public.get_worker_contact(uuid) TO anon, authenticated, service_role;
