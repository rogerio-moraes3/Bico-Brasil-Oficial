-- ============================================
-- LIMPEZA DE DADOS - Perfil de Teste
-- Data: 2025-12-26
-- ============================================

-- Deletar perfil 'Rogerio Moraes' e dados relacionados

-- 1. Buscar o ID do usuário
SELECT id, auth_id, name, email 
FROM public.users 
WHERE name ILIKE '%Rogerio%Moraes%' OR email ILIKE '%rogerio%';

-- 2. Deletar o usuário (CASCADE vai deletar dados relacionados)
DELETE FROM public.users
WHERE name ILIKE '%Rogerio%Moraes%' OR email ILIKE '%rogerio%';

-- 3. Verificar remoção
SELECT COUNT(*) as usuarios_restantes FROM public.users;

-- ============================================
-- OBSERVAÇÃO
-- ============================================
-- Após executar este script, você também precisa deletar
-- o usuário da tabela auth.users no painel do Supabase:
-- 1. Acesse: Authentication → Users
-- 2. Procure por 'Rogerio Moraes'
-- 3. Clique nos 3 pontos → Delete user
