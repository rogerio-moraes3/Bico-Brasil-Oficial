-- ============================================
-- MIGRAÇÃO: Sistema de Publicações Grátis para Empregadores
-- ============================================

-- Adicionar campos para sistema de empregador
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'prestador',
ADD COLUMN IF NOT EXISTS free_posts_remaining INTEGER DEFAULT 0;

-- Criar trigger para dar 10 publicações grátis
CREATE OR REPLACE FUNCTION give_employer_free_posts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_role = 'empregador' AND (OLD.user_role IS NULL OR OLD.user_role != 'empregador') THEN
    NEW.free_posts_remaining = 10;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS employer_free_posts_trigger ON public.users;
CREATE TRIGGER employer_free_posts_trigger
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION give_employer_free_posts();

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_user_role ON public.users(user_role);

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================