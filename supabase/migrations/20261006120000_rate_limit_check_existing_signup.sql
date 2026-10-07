-- Rate limit para public.check_existing_signup.
--
-- Contexto: a funcao tem GRANT EXECUTE para anon (precisa, porque roda na
-- tela de cadastro antes de existir sessao) e nenhuma barreira. O onBlur do
-- Auth.tsx so reduz chamadas vindas do proprio formulario; qualquer um pode
-- bater direto em POST /rest/v1/rpc/check_existing_signup e varrer uma lista
-- de e-mails/telefones. Confirmado na pratica: 25 chamadas anonimas seguidas
-- em producao responderam 200, nenhum 429. Os rate limits do painel Supabase
-- cobrem so /auth/v1/*, nao o Data API.

-- ---------------------------------------------------------------------------
-- 1. Tabela de tentativas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.signup_check_attempts (
  id         bigserial PRIMARY KEY,
  ip         text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.signup_check_attempts IS
  'Janela deslizante de chamadas a check_existing_signup, por IP. Escrita e '
  'lida apenas pela propria funcao (SECURITY DEFINER). Limpa por cron.';

-- Indice na ordem (ip, created_at DESC): a unica consulta e "quantas vezes
-- este IP chamou depois de X".
CREATE INDEX IF NOT EXISTS signup_check_attempts_ip_created_idx
  ON public.signup_check_attempts (ip, created_at DESC);

-- Defesa em duas camadas. As outras tabelas de log do projeto ficam com o
-- GRANT ALL padrao do Supabase e dependem so de RLS; para uma tabela que E o
-- controle de seguranca, tiramos tambem o grant.
ALTER TABLE public.signup_check_attempts ENABLE ROW LEVEL SECURITY;
-- Sem nenhuma policy: RLS sem policy nega tudo para anon/authenticated.
-- O dono da funcao SECURITY DEFINER passa por cima, que e o unico acesso.
REVOKE ALL ON TABLE public.signup_check_attempts FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. A funcao, com a MESMA assinatura e o MESMO retorno
-- ---------------------------------------------------------------------------
-- Muda de LANGUAGE sql STABLE para plpgsql VOLATILE: STABLE nao pode gravar,
-- e sem gravar nao ha janela deslizante. Assinatura, tipo de retorno e grants
-- seguem identicos, entao nada que chama a funcao precisa mudar.
CREATE OR REPLACE FUNCTION public.check_existing_signup(p_email text, p_phone text)
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  -- Folga grande para o uso legitimo: o formulario dispara no onBlur do
  -- e-mail e do telefone, entao uma pessoa faz ~2 chamadas, ~10 com
  -- correcoes. O limite por hora e o que segura a varredura: 60/h deixa a
  -- enumeracao lenta e barulhenta sem incomodar um escritorio atras de um
  -- NAT so.
  LIMITE_MINUTO constant integer := 10;
  LIMITE_HORA   constant integer := 60;

  v_headers text;
  v_ip      text;
  v_minuto  integer;
  v_hora    integer;
BEGIN
  v_headers := current_setting('request.headers', true);

  -- SO cf-connecting-ip. O endpoint fica atras da Cloudflare (confirmado:
  -- Server: cloudflare, CF-Ray na resposta) e a Cloudflare REESCREVE esse
  -- cabecalho com o IP real em todo request que passa por ela, entao o valor
  -- que chega aqui nao e forjavel pelo cliente.
  --
  -- x-forwarded-for ficou DE FORA de proposito. Pela documentacao da
  -- Cloudflare, quando o request ja vem com um XFF ela APENDA o IP no fim em
  -- vez de substituir. Um atacante mandando "X-Forwarded-For: 9.9.9.9"
  -- chegaria aqui como "9.9.9.9, <ip real>", e ler o primeiro elemento
  -- entregaria o valor forjado — bastava trocar esse cabecalho a cada
  -- requisicao para ganhar um balde novo e furar o limite por completo. Ler o
  -- ULTIMO elemento tambem nao resolve, porque a camada interna do Supabase
  -- pode apendar o proprio endereco depois da Cloudflare.
  --
  -- x-real-ip tambem saiu: a Cloudflare nao o define, entao ele chegaria
  -- exatamente como o cliente mandou.
  IF v_headers IS NOT NULL AND v_headers <> '' THEN
    v_ip := nullif(btrim(v_headers::json ->> 'cf-connecting-ip'), '');
  END IF;

  -- Sem IP identificavel nao da para separar um abusador de todo mundo: um
  -- balde unico "desconhecido" transformaria o limite em bloqueio geral.
  -- Entao aqui a funcao deixa passar. Isso so vale se os cabecalhos sumirem;
  -- a verificacao logo apos o deploy confirma que estao chegando.
  IF v_ip IS NOT NULL THEN
    SELECT
      count(*) FILTER (WHERE created_at > now() - interval '1 minute'),
      count(*) FILTER (WHERE created_at > now() - interval '1 hour')
      INTO v_minuto, v_hora
    FROM public.signup_check_attempts
    WHERE ip = v_ip
      AND created_at > now() - interval '1 hour';

    IF v_minuto >= LIMITE_MINUTO OR v_hora >= LIMITE_HORA THEN
      -- Nao grava a tentativa bloqueada: a janela escorre sozinha e a tabela
      -- nao cresce com o volume do ataque.
      RAISE EXCEPTION
        'Muitas verificacoes de cadastro deste endereco. Tente de novo em alguns minutos.'
        USING ERRCODE = '54000';
    END IF;

    INSERT INTO public.signup_check_attempts (ip) VALUES (v_ip);
  END IF;

  -- Daqui para baixo e exatamente a consulta que ja existia hoje.
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE (p_email IS NOT NULL AND trim(p_email) <> '' AND lower(trim(email)) = lower(trim(p_email)))
       OR (p_phone IS NOT NULL AND length(regexp_replace(p_phone, '[^0-9]', '', 'g')) >= 10
           AND regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g'))
  );
END;
$function$;

-- CREATE OR REPLACE preserva os grants, mas deixamos explicito que o conjunto
-- de quem executa NAO mudou (anon continua podendo, por desenho).
GRANT EXECUTE ON FUNCTION public.check_existing_signup(text, text) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Limpeza
-- ---------------------------------------------------------------------------
-- A janela maior e de 1 hora; 2 horas de retencao da folga e mantem a tabela
-- pequena (so IP + timestamp).
SELECT cron.schedule(
  'limpar-signup-check-attempts',
  '*/20 * * * *',
  $$DELETE FROM public.signup_check_attempts WHERE created_at < now() - interval '2 hours'$$
);
