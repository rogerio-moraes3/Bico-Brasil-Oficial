-- Mesmo padrao de seguranca do users_public (view dona de postgres, contorna
-- a RLS de job_postings/users deliberadamente, mas so projeta colunas
-- seguras — nunca contact_phone, nunca user_id cru, nunca dado de quem
-- postou). Existe pro rodizio de "gente real" na hero da home: cards de
-- contratante Premium mostrando so o que ele esta procurando.
--
-- Sem isso, o unico jeito de listar vagas pra anon seria a policy
-- job_postings_select_active (is_active=true pra "public"), que expoe a
-- TABELA INTEIRA incluindo contact_phone — nao da pra usar isso num card
-- publico da home.
CREATE VIEW public.job_postings_public AS
SELECT
  jp.id,
  jp.title,
  COALESCE(cat.name, jp.custom_category) AS category,
  ci.name AS city,
  ci.state,
  jp.neighborhood,
  jp.urgent,
  jp.created_at
FROM public.job_postings jp
JOIN public.users u ON u.id = jp.user_id
LEFT JOIN public.categories cat ON cat.id = jp.category_id
LEFT JOIN public.cities ci ON ci.id = jp.city_id
WHERE jp.is_active = true
  AND jp.status = 'open'
  AND u.type = 'contractor'
  AND u.plan_active = true;

ALTER VIEW public.job_postings_public OWNER TO postgres;
GRANT SELECT ON public.job_postings_public TO anon, authenticated;
