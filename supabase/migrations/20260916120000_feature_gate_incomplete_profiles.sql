-- Substitui o mecanismo de "avisa e apaga em 3 dias" (delete-incomplete-account
-- + cron delete-incomplete-signup-accounts, ja pausado manualmente em
-- 2026-09-16) por um GATE de funcionalidade: cadastro incompleto nunca mais
-- expira nem é apagado — só fica com acesso restrito às ações de alto valor
-- até completar CPF, endereço (cidade+bairro+CEP+número) e telefone
-- confirmado. Ao completar, libera automaticamente.
--
-- Isso formaliza, no banco, a MESMA definição de completude que já existe
-- (só no front, facilmente esquecível) em
-- src/hooks/useProfileCompletion.tsx:computeMissingFields — categoria só é
-- exigida para type='worker', igual lá.

CREATE OR REPLACE FUNCTION public.is_profile_complete(u public.users)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    u.cpf IS NOT NULL AND btrim(u.cpf) <> ''
    AND u.phone_verified IS TRUE
    AND u.city_id IS NOT NULL
    AND u.neighborhood IS NOT NULL AND btrim(u.neighborhood) <> ''
    AND u.cep IS NOT NULL AND btrim(u.cep) <> ''
    AND u.house_number IS NOT NULL AND btrim(u.house_number) <> ''
    AND (u.type IS DISTINCT FROM 'worker' OR (u.category IS NOT NULL AND btrim(u.category) <> ''));
$$;

COMMENT ON FUNCTION public.is_profile_complete(public.users) IS
  'Fonte única de verdade (lado banco) pra completude de cadastro. Espelha src/hooks/useProfileCompletion.tsx:computeMissingFields — mantenha as duas em sincronia se os campos exigidos mudarem.';

-- Camada robusta anti-esquecimento: bloqueia a ESCRITA das 3 ações de alto
-- valor direto no banco, nao so na rota/UI (que ja bloqueia post-job,
-- offer-services etc. via ProfileCompletionGuard, mas isso e so client-side
-- e ja vimos nessa sessao — free_posts_remaining, category no delete-account
-- — como e facil um checklist assim ficar incompleto).
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

  IF v_user.id IS NULL OR NOT public.is_profile_complete(v_user) THEN
    RAISE EXCEPTION 'PROFILE_INCOMPLETE: complete seu cadastro (CPF, endereco e telefone confirmado) para usar essa funcao'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_complete ON public.worker_services;
CREATE TRIGGER trg_enforce_profile_complete
  BEFORE INSERT ON public.worker_services
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_complete_on_insert('id');

DROP TRIGGER IF EXISTS trg_enforce_profile_complete ON public.job_postings;
CREATE TRIGGER trg_enforce_profile_complete
  BEFORE INSERT ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_complete_on_insert('id');

-- contact_unlocks.user_id referencia auth.users(id), nao public.users(id) —
-- por isso o match e por auth_id, diferente das duas tabelas acima.
DROP TRIGGER IF EXISTS trg_enforce_profile_complete ON public.contact_unlocks;
CREATE TRIGGER trg_enforce_profile_complete
  BEFORE INSERT ON public.contact_unlocks
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_complete_on_insert('auth_id');

-- Visibilidade em busca: expõe completude (booleano, nao e PII) na view
-- pública pra toda vitrine de prestadores (busca, home, destaque) filtrar
-- por perfil completo, sem precisar reimplementar a regra em SQL solto em
-- cada tela.
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
  c.state,
  u.city_id,
  u.jobs_done,
  u.created_at,
  u.price,
  u.description,
  public.is_profile_complete(u) AS profile_complete
FROM users u
LEFT JOIN cities c ON c.id = u.city_id;

-- Gate central pra LEITURA de contato: cobre tanto o desbloqueio gratuito
-- (via contact_unlocks) quanto o bypass Premium (caller_premium) num unico
-- lugar, em vez de duplicar a checagem nos dois fluxos — exatamente o tipo
-- de ponto único que evita esquecer um caminho, como o WhatsAppContactButton
-- (via SalesHeroSection.tsx) e o handleFreeUnlock (WorkerProfile.tsx) fazem
-- hoje sem checagem nenhuma de completude de quem está pedindo.
-- Ver a própria ficha (caller_internal_id = p_worker_id) nunca é bloqueado.
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

  IF NOT public.is_profile_complete(caller_row) THEN
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
