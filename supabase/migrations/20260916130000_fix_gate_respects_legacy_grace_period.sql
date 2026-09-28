-- Correcao da migration anterior (20260916120000): os triggers e o
-- get_worker_contact estavam usando is_profile_complete() puro, ignorando a
-- carencia de 30 dias que contas LEGADAS (criadas antes de 2026-08-24, ver
-- src/hooks/useProfileCompletion.tsx:PROFILE_COMPLETION_LAUNCH_DATE) ja
-- tem no FRONT via blockHighValueActions. Sem essa correcao, as 2 contas
-- legadas atuais (carencia so acaba em 2026-09-23) seriam bloqueadas pelo
-- banco AGORA MESMO pra publicar vaga/servico/desbloquear contato, mesmo o
-- front liberando essas acoes — quebraria funcionalidade real sem motivo.
--
-- public.is_high_value_action_blocked espelha blockHighValueActions
-- (useProfileCompletion.tsx) e substitui is_profile_complete() puro nos
-- pontos de enforcement (triggers + get_worker_contact). is_profile_complete
-- continua existindo e sendo usado como esta em users_public.profile_complete
-- (visibilidade em busca nao tem excecao de carencia — sempre foi assim
-- pro card de featured/destaque, que ja exige plan_active).

CREATE OR REPLACE FUNCTION public.is_high_value_action_blocked(u public.users)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_signup_at timestamptz;
  v_launch_date CONSTANT timestamptz := '2026-08-24T00:00:00Z';
  v_grace_period_ends timestamptz;
  v_is_legacy boolean;
  v_grace_active boolean;
BEGIN
  IF public.is_profile_complete(u) THEN
    RETURN false;
  END IF;

  SELECT created_at INTO v_signup_at FROM auth.users WHERE id = u.auth_id;

  v_is_legacy := v_signup_at IS NOT NULL AND v_signup_at < v_launch_date;
  v_grace_period_ends := v_launch_date + interval '30 days';
  v_grace_active := now() < v_grace_period_ends;

  -- Conta nova incompleta: bloqueia. Conta legada: só bloqueia depois da
  -- carência (mesma formula de blockHighValueActions no front).
  RETURN NOT v_is_legacy OR NOT v_grace_active;
END;
$$;

COMMENT ON FUNCTION public.is_high_value_action_blocked(public.users) IS
  'Espelha blockHighValueActions de src/hooks/useProfileCompletion.tsx — usar este (nao is_profile_complete puro) em qualquer enforcement de acao de alto valor, pra respeitar a carencia de contas legadas.';

CREATE OR REPLACE FUNCTION public.enforce_profile_complete_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user public.users;
  v_match_column text := TG_ARGV[0];
BEGIN
  IF v_match_column = 'auth_id' THEN
    SELECT * INTO v_user FROM public.users WHERE auth_id = NEW.user_id;
  ELSE
    SELECT * INTO v_user FROM public.users WHERE id = NEW.user_id;
  END IF;

  IF v_user.id IS NULL OR public.is_high_value_action_blocked(v_user) THEN
    RAISE EXCEPTION 'PROFILE_INCOMPLETE: complete seu cadastro (CPF, endereco e telefone confirmado) para usar essa funcao'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_worker_contact(p_worker_id uuid)
RETURNS TABLE(phone text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  caller_row public.users;
  caller_premium boolean;
BEGIN
  SELECT * INTO caller_row FROM public.users WHERE auth_id = auth.uid();

  IF caller_row.id IS NULL THEN
    RETURN;
  END IF;

  IF caller_row.id = p_worker_id THEN
    RETURN QUERY SELECT u.phone, u.email FROM public.users u WHERE u.id = p_worker_id;
    RETURN;
  END IF;

  IF public.is_high_value_action_blocked(caller_row) THEN
    RETURN;
  END IF;

  caller_premium := COALESCE(caller_row.is_tester, false) OR COALESCE(caller_row.plan_active, false);

  IF caller_premium THEN
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
