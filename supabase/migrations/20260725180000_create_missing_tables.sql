-- Recria tabelas referenciadas por código real e ativo mas que nunca foram
-- de fato aplicadas ao banco (schema drift): contact_unlocks e profile_views
-- (gate de 3 consultas grátis, useAccessControl.ts) e conversations/messages
-- (Messages.tsx, botão "Contatar" em WorkerProfile.tsx). RLS já criada com o
-- padrão otimizado (select auth.uid()) aprendido nesta sessão.

-- contact_unlocks: desbloqueios de contato gratuitos (3 por usuário)
CREATE TABLE IF NOT EXISTS public.contact_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_unlock UNIQUE (user_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_unlocks_user ON public.contact_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_worker ON public.contact_unlocks(worker_id);

ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_unlocks_select_own"
  ON public.contact_unlocks FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "contact_unlocks_insert_own"
  ON public.contact_unlocks FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- profile_views: rastreio de visualizações de perfil (gate de 3 views grátis)
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_profile_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (viewer_id, viewed_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON public.profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_profile ON public.profile_views(viewed_profile_id);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_views_select_own"
  ON public.profile_views FOR SELECT
  USING (viewer_id = (SELECT auth.uid()));

CREATE POLICY "profile_views_insert_own"
  ON public.profile_views FOR INSERT
  WITH CHECK (viewer_id = (SELECT auth.uid()));

-- conversations: threads de mensagem entre contratante e prestador
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (contractor_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_contractor ON public.conversations(contractor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_worker ON public.conversations(worker_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_own"
  ON public.conversations FOR SELECT
  USING ((SELECT auth.uid()) = contractor_id OR (SELECT auth.uid()) = worker_id);

CREATE POLICY "conversations_insert_own"
  ON public.conversations FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = contractor_id OR (SELECT auth.uid()) = worker_id);

CREATE POLICY "conversations_update_own"
  ON public.conversations FOR UPDATE
  USING ((SELECT auth.uid()) = contractor_id OR (SELECT auth.uid()) = worker_id);

-- messages: mensagens dentro de uma conversa (inclui media_url/media_type,
-- usados por Messages.tsx e não presentes na definição original de 2025)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_in_own_conversation"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND ((SELECT auth.uid()) = c.contractor_id OR (SELECT auth.uid()) = c.worker_id)
    )
  );

CREATE POLICY "messages_insert_in_own_conversation"
  ON public.messages FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND ((SELECT auth.uid()) = c.contractor_id OR (SELECT auth.uid()) = c.worker_id)
    )
  );

CREATE POLICY "messages_update_in_own_conversation"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND ((SELECT auth.uid()) = c.contractor_id OR (SELECT auth.uid()) = c.worker_id)
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Nota: sem trigger de updated_at — Messages.tsx já seta esse campo
-- manualmente no update (não existe public.update_updated_at_column()).
