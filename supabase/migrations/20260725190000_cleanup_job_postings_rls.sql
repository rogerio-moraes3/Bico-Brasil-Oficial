-- Consolida as 13 policies de RLS de job_postings (5 DELETE, 3 SELECT,
-- 3 INSERT, 2 UPDATE) em 1 por comando. Não é só limpeza de performance:
-- achado real de segurança no caminho — "job_postings_insert" só checava
-- `auth.uid() IS NOT NULL`, sem nenhuma verificação de dono, então
-- qualquer usuário autenticado podia inserir uma vaga com user_id de
-- OUTRA pessoa. Várias policies também comparavam auth.uid() direto
-- contra job_postings.user_id, mas user_id guarda o id de public.users
-- (não o auth.users.id) — PostJob.tsx confirma isso (grava
-- user_id: userData.id, vindo de public.users). Só a policy que resolve
-- o dono via "EXISTS (SELECT ... FROM users WHERE users.id = user_id
-- AND users.auth_id = auth.uid())" está correta; mantém essa forma,
-- otimizada com (select auth.uid()).
--
-- Também remove "Leitura pública de postagens" (qual = true, sem filtro
-- nenhum) que deixava vagas inativas visíveis publicamente, anulando o
-- propósito da policy mais restrita (is_active = true).

DROP POLICY IF EXISTS "Dono pode deletar anúncios" ON public.job_postings;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios postagens" ON public.job_postings;
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias postagens" ON public.job_postings;
DROP POLICY IF EXISTS "job_postings_delete" ON public.job_postings;
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.job_postings;

DROP POLICY IF EXISTS "Leitura pública de postagens" ON public.job_postings;
DROP POLICY IF EXISTS "Public read jobs" ON public.job_postings;
DROP POLICY IF EXISTS "job_postings_select" ON public.job_postings;

DROP POLICY IF EXISTS "job_postings_insert" ON public.job_postings;
DROP POLICY IF EXISTS "job_postings_insert_authenticated" ON public.job_postings;
DROP POLICY IF EXISTS "Users can insert own jobs" ON public.job_postings;

DROP POLICY IF EXISTS "job_postings_update" ON public.job_postings;
DROP POLICY IF EXISTS "Users can update own jobs" ON public.job_postings;

CREATE POLICY "job_postings_select_active"
  ON public.job_postings FOR SELECT
  USING (is_active = true);

CREATE POLICY "job_postings_insert_own"
  ON public.job_postings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = job_postings.user_id AND users.auth_id = (SELECT auth.uid())
    )
  );

-- UPDATE/DELETE também liberam para admin (has_role), porque AdminJobs.tsx
-- edita/exclui vagas de qualquer usuário usando a sessão do próprio admin
-- (não um client de service-role) — sem isso, o painel perderia a
-- capacidade de mexer em vagas que o admin não criou.
CREATE POLICY "job_postings_update_own"
  ON public.job_postings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = job_postings.user_id AND users.auth_id = (SELECT auth.uid())
    )
    OR has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "job_postings_delete_own"
  ON public.job_postings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = job_postings.user_id AND users.auth_id = (SELECT auth.uid())
    )
    OR has_role((SELECT auth.uid()), 'admin')
  );
