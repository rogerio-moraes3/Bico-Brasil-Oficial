-- Inserir roles de admin para os colaboradores autorizados
-- Primeiro, buscar os user_ids dos usuários na tabela users pelo auth_id
INSERT INTO public.user_roles (user_id, role)
SELECT u.auth_id, 'admin'::app_role
FROM public.users u
WHERE LOWER(u.email) IN ('23rogeriomoraes@gmail.com', 'nando_petro@hotmail.com')
AND u.auth_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;