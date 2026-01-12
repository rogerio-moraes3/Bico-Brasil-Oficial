-- Normalizar emails para lowercase na tabela colaboradores_autorizados
UPDATE public.colaboradores_autorizados
SET email = LOWER(email)
WHERE email != LOWER(email);