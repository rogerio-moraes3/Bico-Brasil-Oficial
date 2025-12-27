-- ============================================
-- ADICIONAR CAMPO last_mode
-- Data: 2025-12-26
-- ============================================

-- Adicionar coluna last_mode à tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_mode TEXT DEFAULT 'contractor' CHECK (last_mode IN ('contractor', 'professional'));

-- Comentário da coluna
COMMENT ON COLUMN public.users.last_mode IS 'Último modo usado pelo usuário (contractor ou professional)';

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_users_last_mode ON public.users(last_mode);
