-- Criar tabela de desbloqueios de contato para sistema freemium
CREATE TABLE IF NOT EXISTS public.contact_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_unlock UNIQUE(user_id, worker_id)
);

-- Índices para performance
CREATE INDEX idx_contact_unlocks_user ON contact_unlocks(user_id);
CREATE INDEX idx_contact_unlocks_worker ON contact_unlocks(worker_id);

-- Comentário na tabela
COMMENT ON TABLE contact_unlocks IS 'Registra desbloqueios de contato gratuitos (3 por usuário)';

-- RLS Policies
ALTER TABLE contact_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unlocks"
  ON contact_unlocks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own unlocks"
  ON contact_unlocks FOR INSERT
  WITH CHECK (user_id = auth.uid());