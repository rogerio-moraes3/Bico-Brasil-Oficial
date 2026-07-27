-- SearchWorkers.tsx e RecentWorkersSection.tsx consultavam public.users
-- diretamente ("query users table directly instead of view for reliability"),
-- o que parou de funcionar depois que o RLS de users foi travado só para
-- admin/service_role/dono-da-linha — usuários comuns não enxergavam mais
-- nenhum trabalhador. A view users_public já existe com os campos seguros
-- certos (nunca cpf/email/phone/address); só falta os 3 campos abaixo,
-- todos não-sensíveis, que esses dois componentes usam hoje.

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
    u.created_at
FROM users u
LEFT JOIN cities c ON c.id = u.city_id;
