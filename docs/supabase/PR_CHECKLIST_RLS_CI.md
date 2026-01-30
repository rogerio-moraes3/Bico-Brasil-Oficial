# PR Checklist — RLS Hardening (CI-friendly checks)

Objetivo: checks **read-only** no DB de staging/replica + scan estático no repo.

## Static scan (FAIL se achar DDL "solto")
grep -nE '^\s*(ALTER|CREATE|DROP|GRANT|REVOKE)\b' $(git diff --name-only origin/main...HEAD | grep -E '\.sql\.review$|docs/' || true)

## Read-only DB checks (staging/replica)
- RLS status (gera rls_status.csv)
- Policies list (gera policies_after.csv)
- Admin views grants (gera views_grants.csv)
- SECURITY DEFINER list (gera security_definer_list.txt)
- search_path mentions (gera search_path_functions.txt)

FAIL se:
- qualquer policy tiver with_check=true
- qualquer policy der WRITE para role public
- views admin tiver GRANT para public/authenticated

## Secrets obrigatórias
- STAGING_DB_URL
- STAGING_DB_HOST_ALLOWLIST (hosts separados por vírgula)
