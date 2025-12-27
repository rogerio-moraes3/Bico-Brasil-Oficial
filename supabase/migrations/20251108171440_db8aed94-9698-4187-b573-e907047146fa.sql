-- Create storage buckets for documents and media
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('verification-docs', 'verification-docs', false),
  ('chat-media', 'chat-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification documents
CREATE POLICY "Users can upload their verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- Storage policies for chat media
CREATE POLICY "Users can upload chat media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Conversation participants can view chat media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-media'
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.contractor_id = auth.uid() OR c.worker_id = auth.uid())
  )
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  criteria TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for badges
CREATE POLICY "Badges are viewable by everyone"
ON public.badges FOR SELECT
USING (true);

CREATE POLICY "User badges are viewable by everyone"
ON public.user_badges FOR SELECT
USING (true);

-- Add media_url column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Insert default badges
INSERT INTO public.badges (name, description, icon, criteria) VALUES
  ('Estrela em Ascensão', 'Completou 5 trabalhos com sucesso', '⭐', 'jobs_done >= 5'),
  ('Profissional Confiável', 'Mantém média de avaliação acima de 4.5', '🏆', 'rating_avg >= 4.5 AND rating_count >= 5'),
  ('Especialista Verificado', 'Passou pela verificação de identidade', '✓', 'verified = true'),
  ('Comunicador Ativo', 'Respondeu mais de 50 mensagens', '💬', 'message_count >= 50'),
  ('Mestre dos Bicos', 'Completou 50 trabalhos', '👑', 'jobs_done >= 50')
ON CONFLICT DO NOTHING;