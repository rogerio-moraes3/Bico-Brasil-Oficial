-- Fecha o caso do e-mail usado como nome: alguem digitou o proprio e-mail no
-- campo "nome completo" e o perfil era considerado completo. Mesma regra no
-- client (nomeInvalido/nameSchema em src/lib/validation.ts), mas aqui e a que
-- vale.
--
-- Deliberadamente NAO entram os outros dois criterios levantados na analise:
--   - "so letras" barraria nome em alfabeto nao-latino (ha uma conta em
--     coreano na base que pode ser legitima);
--   - "duas palavras" barraria nome legitimo de uma palavra so.
-- Decisao do dono do projeto: "Fleipas" e o nome em coreano ficam como estao.
--
-- Unica alteracao em relacao a versao anterior: o "AND u.name !~ '@'" na
-- primeira condicao. O restante esta reproduzido como estava em producao.
CREATE OR REPLACE FUNCTION public.is_profile_complete(u users)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    u.name IS NOT NULL AND length(btrim(u.name)) >= 4 AND u.name !~ '@'
    AND u.cpf IS NOT NULL AND btrim(u.cpf) <> ''
    AND u.phone_verified IS TRUE
    AND u.city_id IS NOT NULL
    AND u.neighborhood IS NOT NULL AND btrim(u.neighborhood) <> ''
    AND u.cep IS NOT NULL AND btrim(u.cep) <> ''
    AND u.house_number IS NOT NULL AND btrim(u.house_number) <> ''
    AND (u.type IS DISTINCT FROM 'worker' OR (u.category IS NOT NULL AND btrim(u.category) <> ''));
$function$;
