-- Jobs.tsx precisa migrar de public.users direto para users_public (mesmo
-- motivo do SearchWorkers.tsx/RecentWorkersSection.tsx: RLS bloqueia SELECT
-- pra usuario comum). Faltam mais 2 campos nao-sensiveis que essa tela usa.

CREATE OR REPLACE VIEW public.users_public AS
SELECT u.id,
    u.name,
    u.profile_photo,
    u.verified,
    u.category,
    u.rating_avg,
    u.rating_count,
    c.name AS city,
    u.neighborhood,
    u.type,
    u.plan_active,
    u.destaque_expires_at,
    c.state,
    u.city_id,
    u.jobs_done,
    u.created_at,
    u.price,
    u.description
FROM users u
LEFT JOIN cities c ON c.id = u.city_id;
