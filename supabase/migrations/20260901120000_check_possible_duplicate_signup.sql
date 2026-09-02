-- Suporte ao aviso "notamos um cadastro parecido" no CompleteProfile.
-- Retorna so um boolean - nunca expoe nome, email ou qualquer dado da
-- outra conta ao cliente. So sinaliza quando o "outro" cadastro tambem
-- parece incompleto (sem cpf ou telefone), pra reduzir falso positivo
-- de nomes comuns que ja completaram o cadastro por conta propria.
CREATE OR REPLACE FUNCTION public.check_possible_duplicate_signup(
  p_name text,
  p_city_id uuid,
  p_exclude_id uuid
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE lower(trim(name)) = lower(trim(p_name))
      AND city_id = p_city_id
      AND id != p_exclude_id
      AND created_at > now() - interval '7 days'
      AND (cpf IS NULL OR phone IS NULL OR phone = '')
  );
$$;

REVOKE ALL ON FUNCTION public.check_possible_duplicate_signup(text, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_possible_duplicate_signup(text, uuid, uuid) TO authenticated;
