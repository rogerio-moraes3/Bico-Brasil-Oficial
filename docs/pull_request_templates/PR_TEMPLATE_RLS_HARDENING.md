# PR: RLS Hardening — Phase 1 (Review artifacts only)

## Files
- docs/supabase/bico_brasil_rls_hardening.sql.review
- docs/supabase/bico_brasil_phase1_runbook.md
- docs/supabase/PR_CHECKLIST_RLS_CI.md

## Risco / Impacto
- pagamentos
- signup
- dashboards admin

## Plano de Teste (staging)
Executar runbook em staging e anexar evidências (logs + artifacts do CI).

## Go/No-Go + Rollback
Definir critérios e rollback manual.

## Placeholders
<ADMIN_CHECK_EXPRESSION>, <TEST_USER_ID>, <VIEW_NAMES>, <TABLE_LIST>, <EDGE_FUNCTION_NAMES>, <SERVICE_ROLE_SECRET_LOCATION>, <ALLOW_REGISTRATION_CLAIM>
