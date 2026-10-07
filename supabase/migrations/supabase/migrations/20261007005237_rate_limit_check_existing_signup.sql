-- Mitiga o risco de enumeracao em check_existing_signup: como a funcao e
-- publica (anon, pra rodar na tela de cadastro antes do login) e responde
-- com um boolean puro pra email/telefone, alguem podia varrer uma lista de
-- emails/telefones e descobrir quais ja tem conta, um por um, sem limite.
--
-- IP vem de cf-connecting-ip (current_setting('request.headers', true), que
-- o PostgREST expõe pra toda chamada via API). Confirmado em teste real que
-- esse header sobrevive intacto até o Postgres e bate com o IP publico
-- real do cliente (verificado contra o ipify) — e por isso e o unico usado
-- aqui. x-forwarded-for e x-real-ip ficaram de fora de proposito: a
-- Cloudflare APENDA no XFF em vez de substituir (o primeiro elemento seria
-- um valor forjado pelo proprio cliente) e nao define x-real-ip — usar
-- qualquer um dos dois tornaria o limite forjavel.
--
-- Sem IP identificavel (ex.: chamada que nao passou pelo PostgREST), deixa
-- passar sem contar tentativa: um balde unico "desconhecido" compartilhado
-- por todo mundo nessa situacao viraria bloqueio geral.
CREATE TABLE IF NOT EXISTS public.signup_check_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signup_check_attempts_ip_created_idx
  ON public.signup_check_attempts (ip, created_at DESC);

-- RLS como defesa em profundidade: anon/authenticated nunca recebem GRANT
-- direto nesta tabela (so chegam a ela via check_existing_signup, que e
-- SECURITY DEFINER) — ligar RLS sem nenhuma policy garante que, mesmo que
-- um GRANT futuro seja aplicado por engano, a tabela continua inacessivel
-- por padrao.
ALTER TABLE public.signup_check_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.signup_check_attempts FROM PUBLIC, anon, authenticated;

-- Limpeza: a tabela so existe pra contar tentativas na ultima hora, nao
-- precisa de historico. Roda a cada 20 min e descarta qualquer coisa com
-- mais de 2 horas (folga sobre a janela de 1h usada no rate limit).
SELECT cron.schedule(
  'limpar-signup-check-attempts',
  '*/20 * * * *',
  $$ DELETE FROM public.signup_check_attempts WHERE created_at < now() - interval '2 hours' $$
);

CREATE OR REPLACE FUNCTION public.check_existing_signup(
  p_email text,
  p_phone text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  LIMITE_MINUTO constant integer := 10;
  LIMITE_HORA   constant integer := 60;

  v_headers text;
  v_ip      text;
  v_minuto  integer;
  v_hora    integer;
BEGIN
  v_headers := current_setting('request.headers', true);

  IF v_headers IS NOT NULL AND v_headers <> '' THEN
    v_ip := nullif(btrim(v_headers::json ->> 'cf-connecting-ip'), '');
  END IF;

  IF v_ip IS NOT NULL THEN
    SELECT
      count(*) FILTER (WHERE created_at > now() - interval '1 minute'),
      count(*) FILTER (WHERE created_at > now() - interval '1 hour')
      INTO v_minuto, v_hora
    FROM public.signup_check_attempts
    WHERE ip = v_ip
      AND created_at > now() - interval '1 hour';

    IF v_minuto >= LIMITE_MINUTO OR v_hora >= LIMITE_HORA THEN
      RAISE EXCEPTION
        'Muitas verificacoes de cadastro deste endereco. Tente de novo em alguns minutos.'
        USING ERRCODE = '54000';
    END IF;

    INSERT INTO public.signup_check_attempts (ip) VALUES (v_ip);
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE (p_email IS NOT NULL AND trim(p_email) <> '' AND lower(trim(email)) = lower(trim(p_email)))
       OR (p_phone IS NOT NULL AND length(regexp_replace(p_phone, '[^0-9]', '', 'g')) >= 10
           AND regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g'))
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_existing_signup(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_existing_signup(text, text) TO anon, authenticated;
