-- Exige nome com pelo menos 4 caracteres para o perfil ser considerado
-- completo. Mesma regra do client (MIN_NOME em src/lib/validation.ts), mas
-- aqui e a que vale: validacao de formulario sozinha nao protege nada, como
-- ja vimos no achado de auto-concessao de destaque/selo.
--
-- Motivo: contas como "St" e "Tr" apareciam na busca publica como prestador,
-- minando a confianca na plataforma. Nao se exige duas palavras de proposito
-- — nome legitimo de uma palavra so existe.
--
-- Efeito nas contas que ja existem: nenhuma e alterada ou apagada. Elas
-- simplesmente deixam de satisfazer is_profile_complete() e passam a cair no
-- feature gate que ja existe (triggers em worker_services, job_postings e
-- contact_unlocks + filtro da busca), exatamente como uma conta sem CEP hoje.
-- Voltam a funcionar sozinhas assim que o nome for corrigido.
--
-- Alcance real, medido na base em 05/10/2026 antes de aplicar: das 6 contas
-- com nome suspeito, 3 tem menos de 4 caracteres ("St", "Tr" e um nome em
-- coreano) e so 1 delas ("St") era considerada completa hoje — as outras 5 ja
-- eram incompletas por CPF/CEP/telefone faltando. "Fleipas", "Icarok9" e um
-- e-mail usado como nome passam nesta regra; barra-los exigiria criterio
-- adicional (duas palavras, so letras, sem "@"), decisao em aberto.
--
-- Unica alteracao em relacao a versao anterior da funcao: a primeira linha do
-- SELECT. O restante esta reproduzido como estava em producao.
CREATE OR REPLACE FUNCTION public.is_profile_complete(u users)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    u.name IS NOT NULL AND length(btrim(u.name)) >= 4
    AND u.cpf IS NOT NULL AND btrim(u.cpf) <> ''
    AND u.phone_verified IS TRUE
    AND u.city_id IS NOT NULL
    AND u.neighborhood IS NOT NULL AND btrim(u.neighborhood) <> ''
    AND u.cep IS NOT NULL AND btrim(u.cep) <> ''
    AND u.house_number IS NOT NULL AND btrim(u.house_number) <> ''
    AND (u.type IS DISTINCT FROM 'worker' OR (u.category IS NOT NULL AND btrim(u.category) <> ''));
$function$;
