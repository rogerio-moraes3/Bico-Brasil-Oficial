-- Expoe a completude do cadastro na admin_user_list, pra o painel poder
-- esconder os incompletos por padrao. So visibilidade: nenhum trigger, RLS ou
-- a propria is_profile_complete sao tocados aqui.
--
-- A logica NAO e reimplementada — a view chama public.is_profile_complete(),
-- a mesma funcao usada pelos triggers de worker_services, job_postings e
-- contact_unlocks e pela users_public.profile_complete. Se a regra de
-- completude mudar, muda num lugar so.
--
-- Detalhe que obriga a recriar a view inteira em vez de so adicionar colunas:
-- o RTE da view antiga foi resolvido quando public.users tinha 37 colunas e
-- ficou congelado assim. cep, phone_verified e house_number foram adicionados
-- depois e por isso NAO existiam dentro da view — is_profile_complete(t.*)
-- receberia um registro truncado. O CREATE OR REPLACE abaixo re-resolve o RTE
-- contra a tabela atual.
--
-- As 31 colunas originais ficam na mesma ordem e com os mesmos nomes (exigencia
-- do CREATE OR REPLACE VIEW); profile_complete e phone_verified entram no fim.
CREATE OR REPLACE VIEW public.admin_user_list AS
SELECT
  t.id,
  t.display_name,
  t.city,
  t.created_at,
  t.city_id,
  t.last_mode,
  t.auth_id,
  t.name,
  t.phone,
  t.cpf,
  t.email,
  t.neighborhood,
  t.address,
  t.description,
  t.price,
  t.avatar_url,
  t.type,
  t.category_id,
  t.subcategory_id,
  t.rating_avg,
  t.rating_count,
  t.plan_active,
  t.updated_at,
  t.user_role,
  t.free_posts_remaining,
  t.verified,
  t.is_tester,
  t.last_usage_at,
  t.state,
  t.phone_type,
  t.jobs_done,
  public.is_profile_complete(t.*) AS profile_complete,
  t.phone_verified
FROM public._admin_all_users_internal() t
WHERE public.has_role(auth.uid(), 'admin'::text);
