-- Adicionar coluna CPF à tabela users com constraint unique
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Criar índice único para CPF (permite NULL mas valores não-nulos devem ser únicos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf_unique ON public.users(cpf) WHERE cpf IS NOT NULL;