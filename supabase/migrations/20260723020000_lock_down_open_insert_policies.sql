-- Remove policies de INSERT completamente abertas (with_check: true, roles: public)
-- em users e profiles. Nenhuma delas tem uso real no app — o cadastro acontece via
-- triggers SECURITY DEFINER (handle_new_user_safe, handle_new_user), que ignoram RLS
-- por natureza. registrations foi mantida propositalmente aberta: é o formulário
-- público de lista de espera (PreLaunchLanding.tsx), sem policy de SELECT associada.

DROP POLICY IF EXISTS "Allow individual insert" ON public.users;

DROP POLICY IF EXISTS "Inserção de perfil via trigger" ON public.profiles;

CREATE POLICY profiles_insert_own
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
