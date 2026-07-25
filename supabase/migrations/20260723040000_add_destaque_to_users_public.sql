-- Adiciona destaque_expires_at à view pública, para a vitrine da home poder
-- priorizar prestadores com destaque ativo (mesma lógica que SearchWorkers.tsx
-- já usa, agora estendida ao ponto mais visível do site).
CREATE OR REPLACE VIEW public.users_public AS
SELECT
  id,
  name,
  profile_photo,
  verified,
  category,
  rating_avg,
  rating_count,
  city,
  neighborhood,
  type,
  plan_active,
  destaque_expires_at
FROM public.users;
