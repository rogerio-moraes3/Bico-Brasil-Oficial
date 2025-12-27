-- ============================================
-- CORREÇÃO CRÍTICA: Tabela conversations
-- Problema: contractor_id e worker_id devem referenciar auth.uid()
-- ============================================

-- 1. Remover constraints antigas
ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_contractor_id_fkey,
  DROP CONSTRAINT IF EXISTS conversations_worker_id_fkey;

-- 2. Adicionar novas constraints referenciando auth.users
ALTER TABLE conversations
  ADD CONSTRAINT conversations_contractor_id_fkey 
    FOREIGN KEY (contractor_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT conversations_worker_id_fkey 
    FOREIGN KEY (worker_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- 3. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_contractor 
  ON conversations(contractor_id);
  
CREATE INDEX IF NOT EXISTS idx_conversations_worker 
  ON conversations(worker_id);

-- 4. Atualizar política RLS (já está correta, mas garantir)
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = contractor_id) OR (auth.uid() = worker_id)
  );

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = contractor_id) OR (auth.uid() = worker_id)
  );