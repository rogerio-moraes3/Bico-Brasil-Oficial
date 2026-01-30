# Runbook — Fase 1: Habilitação de RLS e Hardening de Policies (Bico Brasil)

## AVISO
- Documento manual: apenas instruções e queries **read-only**.
- Não contém comandos prontos para execução automática.
- Substitua placeholders antes de qualquer execução.

## Pré-verificação (read-only)
Execute manualmente (somente SELECT):

- Status RLS:
  SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity, c.relforcerowsecurity
  FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname='public' AND c.relname IN (<TABLE_LIST>);

- Policies:
  SELECT schemaname, tablename, policyname, perm, roles, qual, with_check
  FROM pg_policies
  WHERE schemaname='public' AND tablename IN (<TABLE_LIST>);

- Grants em views admin:
  SELECT table_schema, table_name, grantee, privilege_type
  FROM information_schema.role_table_grants
  WHERE table_name IN (<VIEW_NAMES>);

- Funções SECURITY DEFINER:
  SELECT n.nspname, p.proname
  FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid
  WHERE pg_get_functiondef(p.oid) ILIKE '%SECURITY DEFINER%';

## Ordem faseada (manual)
1) plans  
2) ads_highlight, signup_errors, payments_backup, user_credits (uma por vez)  
3) job_applications  
4) payments (CRÍTICO)  
5) policies permissivas (users, profiles, logs_busca, registrations) — uma por vez  
6) views admin (revogar grants) + views públicas com subset

## Go/No-Go
GO se: signup + pagamentos + admin dashboards + smoke tests OK.  
NO-GO se: pagamento falhar, signup falhar, admin perder acesso crítico.

## Placeholders
<ADMIN_CHECK_EXPRESSION>, <TEST_USER_ID>, <VIEW_NAMES>, <TABLE_LIST>, <EDGE_FUNCTION_NAMES>, <SERVICE_ROLE_SECRET_LOCATION>, <ALLOW_REGISTRATION_CLAIM>
