-- ACHADO DE SEGURANÇA (auditoria dedicada, item 13): colaboradores_select
-- permitia SELECT (nome + e-mail da equipe interna) para QUALQUER usuário
-- autenticado (roles={authenticated}, qual=true) — sem nenhuma restrição.
-- O código já migrou a verificação de admin para has_role()/user_roles há
-- tempo (ver comentários "colaboradores_autorizados foi descontinuada" em
-- AdminIcon.tsx, AdminServices.tsx, AdminPayments.tsx, AdminJobs.tsx), então
-- essa tabela não tem mais função de autorização real — só continuava
-- expondo e-mails internos sem necessidade (risco de phishing/engenharia
-- social direcionada à equipe).
--
-- Também encontrado no mesmo levantamento: colaboradores_insert tinha
-- with_check nulo, ou seja, INSERT igualmente liberado a qualquer
-- authenticated — corrigido junto, já que é a mesma tabela e o mesmo tipo
-- de problema (nenhum motivo pra usuário comum inserir linha nela).
--
-- colaboradores_delete já exigia admin (via claim JWT legado); mantém como
-- estava, só troca pro padrão atual has_role() por consistência.

DROP POLICY IF EXISTS colaboradores_select ON public.colaboradores_autorizados;
CREATE POLICY colaboradores_select
ON public.colaboradores_autorizados
FOR SELECT
TO authenticated
USING (has_role((select auth.uid()), 'admin'));

DROP POLICY IF EXISTS colaboradores_insert ON public.colaboradores_autorizados;
CREATE POLICY colaboradores_insert
ON public.colaboradores_autorizados
FOR INSERT
TO authenticated
WITH CHECK (has_role((select auth.uid()), 'admin'));

DROP POLICY IF EXISTS colaboradores_delete ON public.colaboradores_autorizados;
CREATE POLICY colaboradores_delete
ON public.colaboradores_autorizados
FOR DELETE
TO authenticated
USING (has_role((select auth.uid()), 'admin'));
