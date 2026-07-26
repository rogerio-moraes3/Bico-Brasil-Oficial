-- Troca de e-mail no perfil passa a usar o fluxo nativo do Supabase Auth
-- (auth.updateUser({ email }) + confirmação por e-mail) em vez de escrever
-- direto em public.users.email. Esse trigger mantém public.users.email em
-- sincronia assim que a troca é de fato confirmada (o auth.users.email só
-- muda depois do clique no link de confirmação), sem depender de o usuário
-- estar com uma sessão ativa no app nesse momento.

CREATE OR REPLACE FUNCTION public.sync_user_email_on_auth_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET email = NEW.email, updated_at = now()
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;

CREATE TRIGGER on_auth_user_email_changed
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
WHEN (NEW.email IS DISTINCT FROM OLD.email)
EXECUTE FUNCTION public.sync_user_email_on_auth_change();
