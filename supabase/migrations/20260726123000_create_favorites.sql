-- Tabela favorites nunca chegou a ser criada em produção (schema drift) —
-- FavoriteButton.tsx e FavoritesTab.tsx já referenciam ela desde sempre.
-- FK explicitamente nomeada favorites_worker_id_fkey pois FavoritesTab.tsx
-- usa esse nome no embed do PostgREST (users!favorites_worker_id_fkey(...)).

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL CONSTRAINT favorites_worker_id_fkey REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, worker_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- (select auth.uid()) em vez de auth.uid() puro: evita reavaliação por linha,
-- mesmo padrão de otimização aplicado a todas as demais tabelas.
CREATE POLICY "Users can view their own favorites"
ON public.favorites FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own favorites"
ON public.favorites FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.favorites FOR DELETE
USING ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_worker_id ON public.favorites(worker_id);
