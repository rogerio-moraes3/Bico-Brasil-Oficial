-- BUG CRÍTICO: handle_new_user_safe() gravava '' (string vazia) em public.users.cpf
-- quando o cadastro não tinha CPF nos metadados (sempre o caso em login via Google).
-- Como users_cpf_key é UNIQUE, só a primeira conta sem CPF conseguia essa vaga —
-- toda conta seguinte sem CPF falhava permanentemente (duplicate key), sem nunca
-- criar a linha em public.users. Diagnosticado: 94 de 166 contas (57%) órfãs desde
-- 04/01/2026. Fix: gravar NULL em vez de '' quando não há CPF (NULL não colide
-- com UNIQUE, e múltiplos NULLs são permitidos numa coluna UNIQUE).
--
-- cpf também tinha NOT NULL (descoberto ao testar a correção acima — NOT NULL
-- não aparece em pg_constraint, só em pg_attribute.attnotnull, por isso não foi
-- pego no diagnóstico inicial). Sem relaxar isso, gravar NULL falha com
-- "null value in column cpf violates not-null constraint". Nenhum trigger ou
-- constraint em public.users depende de cpf ser NOT NULL.
ALTER TABLE public.users ALTER COLUMN cpf DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user_safe()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_meta jsonb;
BEGIN
  BEGIN
    v_meta := COALESCE(NEW.raw_user_meta_data::jsonb, '{}');
  EXCEPTION WHEN OTHERS THEN
    v_meta := '{}';
  END;

  INSERT INTO public.users(id, auth_id, name, cpf, email, phone, city_id, created_at)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(v_meta->>'name', NEW.email, ''),
    NULLIF(regexp_replace(COALESCE(v_meta->>'cpf', ''), '[^0-9]', '', 'g'), ''),
    COALESCE(NEW.email, ''),
    COALESCE(regexp_replace(v_meta->>'phone', '[^0-9]', '', 'g'), ''),
    (NULLIF(v_meta->>'city_id', ''))::uuid,
    now()
  ) ON CONFLICT (auth_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.signup_errors(user_id, stage, error_message)
  VALUES (NEW.id, 'final_fix_applied', SQLERRM);
  RETURN NEW;
END;$function$;
