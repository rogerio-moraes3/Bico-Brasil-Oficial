-- Extensao do aviso "cadastro parecido" (ja existente no CompleteProfile via
-- check_possible_duplicate_signup) pra tela inicial de cadastro (Auth.tsx),
-- avisando ja na primeira etapa se o email ou telefone digitado ja tem conta
-- — antes so descobria depois de logar e cair no CompleteProfile.
--
-- Diferente da irma (que compara nome+cidade, so entre contas incompletas,
-- e so authenticated), esta precisa ser callable por quem ainda NAO tem
-- sessao (a pessoa esta preenchendo o formulario de cadastro, ainda anon) —
-- por isso GRANT pra anon tambem. Mesma garantia de privacidade: retorna so
-- um boolean, nunca expoe nome/email/telefone de quem ja cadastrou.
CREATE OR REPLACE FUNCTION public.check_existing_signup(
  p_email text,
  p_phone text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE (p_email IS NOT NULL AND trim(p_email) <> '' AND lower(trim(email)) = lower(trim(p_email)))
       OR (p_phone IS NOT NULL AND length(regexp_replace(p_phone, '[^0-9]', '', 'g')) >= 10
           AND regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g'))
  );
$$;

REVOKE ALL ON FUNCTION public.check_existing_signup(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_existing_signup(text, text) TO anon, authenticated;
