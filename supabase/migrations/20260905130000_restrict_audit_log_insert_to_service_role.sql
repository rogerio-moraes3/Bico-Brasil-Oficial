-- M4: "Service can insert audit logs" tinha WITH CHECK (true) pra role
-- {public} (nao {service_role}) — confirmado ao vivo via pg_policies.
-- Qualquer authenticated/anon conseguia inserir linha forjada no log de
-- auditoria (action/table_name/user_id/payload todos controlados pelo
-- atacante). SELECT ja e admin-only; isso so restringe quem pode escrever.
-- Confirmado via grep que nada no frontend insere em audit_log — só as
-- Edge Functions, que usam a service role key.
DROP POLICY IF EXISTS "Service can insert audit logs" ON public.audit_log;
CREATE POLICY "Service can insert audit logs"
ON public.audit_log
FOR INSERT
TO service_role
WITH CHECK (true);
