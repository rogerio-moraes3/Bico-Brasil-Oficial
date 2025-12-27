-- ============================================
-- RESET TOTAL DE CADASTROS
-- Preservando APENAS os 2 Administradores
-- Data: 2025-12-26
-- ============================================

-- ⚠️ ATENÇÃO: Este script deleta TODOS os usuários exceto os administradores
-- Execute com CUIDADO e apenas se tiver certeza

-- ============================================
-- PASSO 1: Identificar Administradores
-- ============================================

-- Listar usuários com role 'admin' (para conferência antes de deletar)
SELECT 
  u.id,
  u.auth_id,
  u.email,
  u.name,
  ur.role,
  'Admin via user_roles' as admin_source
FROM public.users u
INNER JOIN public.user_roles ur ON ur.user_id = u.auth_id
WHERE ur.role = 'admin'

UNION

-- Também listar colaboradores autorizados (whitelist)
SELECT 
  u.id,
  u.auth_id,
  u.email,
  u.name,
  NULL as role,
  'Admin via colaboradores_autorizados' as admin_source
FROM public.users u
INNER JOIN public.colaboradores_autorizados ca ON LOWER(ca.email) = LOWER(u.email);

-- ⚠️ IMPORTANTE: Confira se os 2 administradores aparecem acima
-- Se não aparecerem, NÃO execute o resto do script!

-- ============================================
-- PASSO 2: Deletar Usuários (EXCETO Admins)
-- ============================================

-- Deletar registros da tabela users (exceto admins)
-- O CASCADE vai deletar automaticamente registros relacionados em:
-- - user_roles
-- - job_postings (via user_id foreign key)
-- - worker_services (via user_id foreign key)
-- - payments (via user_id foreign key)
-- - ratings (via rated_user_id e rating_user_id)
-- - profile_views (via viewer_id e viewed_profile_id)
-- - contact_unlocks (via user_id e worker_id)
-- - favorites (via user_id e worker_id)
-- - messages (via sender_id e receiver_id)
-- - conversations (via user1_id e user2_id)
-- - appointments (via user_id e worker_id)
-- - destaque_orders (via user_id)
-- - community_posts (via user_id)
-- - community_comments (via user_id)
-- - community_likes (via user_id)
-- - user_badges (via user_id)

DELETE FROM public.users
WHERE id NOT IN (
  -- Preservar usuários com role 'admin'
  SELECT u.id
  FROM public.users u
  INNER JOIN public.user_roles ur ON ur.user_id = u.auth_id
  WHERE ur.role = 'admin'
  
  UNION
  
  -- Preservar colaboradores autorizados
  SELECT u.id
  FROM public.users u
  INNER JOIN public.colaboradores_autorizados ca ON LOWER(ca.email) = LOWER(u.email)
);

-- ============================================
-- PASSO 3: Limpar Tabelas Órfãs (se necessário)
-- ============================================

-- Algumas tabelas podem não ter CASCADE configurado
-- Vamos limpar manualmente para garantir

-- Limpar job_contacts órfãos
DELETE FROM public.job_contacts
WHERE user_id NOT IN (SELECT id FROM public.users);

-- Limpar push_subscriptions órfãos
DELETE FROM public.push_subscriptions
WHERE user_id NOT IN (SELECT id FROM public.users);

-- Limpar audit_log órfão (se existir)
DELETE FROM public.audit_log
WHERE user_id NOT IN (SELECT auth_id FROM public.users)
AND user_id IS NOT NULL;

-- ============================================
-- PASSO 4: Verificação Pós-Reset
-- ============================================

-- Contar usuários restantes (deve ser 2)
SELECT COUNT(*) as usuarios_restantes FROM public.users;

-- Listar usuários restantes (deve mostrar apenas os 2 admins)
SELECT 
  id,
  email,
  name,
  type,
  created_at
FROM public.users
ORDER BY created_at;

-- Verificar roles restantes
SELECT 
  u.email,
  u.name,
  ur.role
FROM public.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.auth_id
ORDER BY u.email;

-- ============================================
-- ESTATÍSTICAS PÓS-RESET
-- ============================================

SELECT 
  'users' as tabela,
  COUNT(*) as registros_restantes
FROM public.users

UNION ALL

SELECT 
  'user_roles' as tabela,
  COUNT(*) as registros_restantes
FROM public.user_roles

UNION ALL

SELECT 
  'job_postings' as tabela,
  COUNT(*) as registros_restantes
FROM public.job_postings

UNION ALL

SELECT 
  'worker_services' as tabela,
  COUNT(*) as registros_restantes
FROM public.worker_services

UNION ALL

SELECT 
  'payments' as tabela,
  COUNT(*) as registros_restantes
FROM public.payments

UNION ALL

SELECT 
  'ratings' as tabela,
  COUNT(*) as registros_restantes
FROM public.ratings

UNION ALL

SELECT 
  'profile_views' as tabela,
  COUNT(*) as registros_restantes
FROM public.profile_views

UNION ALL

SELECT 
  'contact_unlocks' as tabela,
  COUNT(*) as registros_restantes
FROM public.contact_unlocks

UNION ALL

SELECT 
  'favorites' as tabela,
  COUNT(*) as registros_restantes
FROM public.favorites

UNION ALL

SELECT 
  'messages' as tabela,
  COUNT(*) as registros_restantes
FROM public.messages

UNION ALL

SELECT 
  'conversations' as tabela,
  COUNT(*) as registros_restantes
FROM public.conversations;

-- ============================================
-- OBSERVAÇÕES IMPORTANTES
-- ============================================

-- 1. Este script NÃO deleta da tabela auth.users
--    Você precisa deletar manualmente no painel do Supabase
--    Veja instruções no arquivo RESET_AUTH_USERS.md

-- 2. Os 2 administradores são preservados baseado em:
--    - Ter role='admin' na tabela user_roles
--    - OU estar na whitelist colaboradores_autorizados

-- 3. Tabelas que serão limpas automaticamente (CASCADE):
--    - user_roles, job_postings, worker_services, payments
--    - ratings, profile_views, contact_unlocks, favorites
--    - messages, conversations, appointments, destaque_orders
--    - community_posts, community_comments, community_likes
--    - user_badges

-- 4. Tabelas limpas manualmente neste script:
--    - job_contacts, push_subscriptions, audit_log

-- 5. Tabelas NÃO afetadas (dados preservados):
--    - categories, subcategories, cities
--    - colaboradores_autorizados
--    - badges
--    - pre_cadastro (se existir)

-- ============================================
-- FIM DO SCRIPT
-- ============================================
