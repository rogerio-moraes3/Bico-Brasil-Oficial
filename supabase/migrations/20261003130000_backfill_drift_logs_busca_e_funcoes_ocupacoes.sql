-- Backfill de drift: registra no repositorio objetos que ja existem em
-- producao mas nunca tiveram migration (criados direto no Studio).
-- Identificados na auditoria de 03/10/2026.
--
-- Nada aqui muda comportamento: as definicoes foram extraidas da propria
-- producao (pg_get_functiondef / information_schema) e estao reproduzidas
-- como estao. O objetivo e so permitir que o repo reconstrua o banco.
--
-- Duas excecoes conscientes, ambas registradas no fim do arquivo:
--   1. buscar_ocupacoes e buscar_e_logar_ocupacoes ganham
--      SET search_path TO 'public' (uma linha cada), fechando o aviso
--      function_search_path_mutable do advisor. Seguro: toda referencia a
--      tabela ja e qualificada com public., e similarity() vem do pg_trgm,
--      que esta instalado no schema public neste projeto (verificado).
--   2. O corpo de sync_avatar_to_auth esta gravado em producao com
--      quebras CRLF; aqui ele fica em LF. Diferenca de whitespace dentro
--      da string do corpo, sem efeito nenhum na execucao.

-- ---------------------------------------------------------------------
-- Tabela public.logs_busca
-- ---------------------------------------------------------------------
-- Log de termos buscados que nao casaram com nenhuma ocupacao. Escrita
-- apenas: a policy permite INSERT publico e nao existe policy de SELECT,
-- entao o cliente grava mas nao le (confirmado: anon enxerga 0 linhas).
CREATE TABLE IF NOT EXISTS public.logs_busca (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  termo_buscado text NOT NULL,
  encontrou_resultado boolean,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT logs_busca_pkey PRIMARY KEY (id)
);

ALTER TABLE public.logs_busca ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'logs_busca'
      AND policyname = 'Inserção pública de logs'
  ) THEN
    CREATE POLICY "Inserção pública de logs"
      ON public.logs_busca FOR INSERT TO public WITH CHECK (true);
  END IF;
END $$;

-- Grants que a producao ja tem (default do Supabase para tabelas novas).
GRANT ALL ON TABLE public.logs_busca TO anon;
GRANT ALL ON TABLE public.logs_busca TO authenticated;
GRANT ALL ON TABLE public.logs_busca TO service_role;

-- ---------------------------------------------------------------------
-- public.buscar_ocupacoes(text)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.buscar_ocupacoes(termo_usuario text)
 RETURNS TABLE(ocupacao_id uuid, nome_oficial text, slug text, similaridade real)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT o.id AS ocupacao_id,
         o.nome_oficial,
         o.slug,
         similarity(tb.termo, termo_usuario) AS similaridade
  FROM public.termos_busca tb
  JOIN public.ocupacoes o ON tb.ocupacao_id = o.id
  WHERE similarity(tb.termo, termo_usuario) > 0.2
  ORDER BY similaridade DESC, tb.peso_relevancia DESC
  LIMIT 10;
END;
$function$;

-- ---------------------------------------------------------------------
-- public.buscar_e_logar_ocupacoes(text)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.buscar_e_logar_ocupacoes(termo_txt text)
 RETURNS TABLE(ocupacao_id uuid, nome_oficial text, slug text, similaridade real)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  achou BOOLEAN;
BEGIN
  -- Return results from existing search function
  RETURN QUERY SELECT * FROM public.buscar_ocupacoes(termo_txt);

  -- Determine if any rows were returned
  GET DIAGNOSTICS achou = ROW_COUNT;

  -- Insert log (use achou > 0)
  INSERT INTO public.logs_busca (termo_buscado, encontrou_resultado)
  VALUES (termo_txt, achou > 0);
END;
$function$;

-- ---------------------------------------------------------------------
-- public.sync_avatar_to_auth() — trigger AFTER UPDATE OF avatar_url em users
-- ---------------------------------------------------------------------
-- Ja tinha search_path fixado em producao; reproduzido como esta.
CREATE OR REPLACE FUNCTION public.sync_avatar_to_auth()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Só prossegue se houver um auth_id válido e o avatar realmente mudou
  IF NEW.auth_id IS NOT NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data =
      -- jsonb_set cria/atualiza a chave "avatar_url" sem remover outras chaves
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{avatar_url}',
        to_jsonb(NEW.avatar_url),
        true
      )
    WHERE id = NEW.auth_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- ---------------------------------------------------------------------
-- public.sync_user_avatar_profile_photo() — trigger BEFORE INSERT/UPDATE em users
-- ---------------------------------------------------------------------
-- Ja tinha search_path fixado em producao; reproduzido como esta.
CREATE OR REPLACE FUNCTION public.sync_user_avatar_profile_photo()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If avatar_url changed, copy to profile_photo
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.avatar_url IS DISTINCT FROM OLD.avatar_url) THEN
    NEW.profile_photo := NEW.avatar_url;
  END IF;
  -- If profile_photo changed and avatar_url is null or different, mirror back
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.profile_photo IS DISTINCT FROM OLD.profile_photo) THEN
    NEW.avatar_url := NEW.profile_photo;
  END IF;
  RETURN NEW;
END;
$function$;

-- ---------------------------------------------------------------------
-- Triggers que usam as duas funcoes acima (ja existem em producao).
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.users'::regclass AND tgname = 'sync_avatar_trigger'
  ) THEN
    CREATE TRIGGER sync_avatar_trigger
      AFTER UPDATE OF avatar_url ON public.users
      FOR EACH ROW
      WHEN (old.avatar_url IS DISTINCT FROM new.avatar_url)
      EXECUTE FUNCTION public.sync_avatar_to_auth();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.users'::regclass AND tgname = 'users_sync_avatar_profile_photo_trg'
  ) THEN
    CREATE TRIGGER users_sync_avatar_profile_photo_trg
      BEFORE INSERT OR UPDATE ON public.users
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_user_avatar_profile_photo();
  END IF;
END $$;
