-- FASE 2 & 3: Índices para melhorar performance da busca
-- Índice de busca full-text em português para worker_services
CREATE INDEX IF NOT EXISTS idx_worker_services_search 
ON worker_services 
USING gin(to_tsvector('portuguese', title || ' ' || description));

-- Índice para localização dos usuários
CREATE INDEX IF NOT EXISTS idx_users_location 
ON users (city_id, neighborhood) 
WHERE type = 'worker' AND plan_active = true;

-- Índice para categoria e subcategoria
CREATE INDEX IF NOT EXISTS idx_worker_services_category 
ON worker_services (category_id, subcategory_id) 
WHERE active = true;

-- FASE 3: Trigger de validação para worker_services
CREATE OR REPLACE FUNCTION validate_worker_service()
RETURNS TRIGGER AS $$
BEGIN
  -- Garantir que user tem type='worker'
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = NEW.user_id AND type = 'worker'
  ) THEN
    RAISE EXCEPTION 'Usuário não é do tipo worker';
  END IF;
  
  -- Garantir que category existe
  IF NEW.category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM categories WHERE id = NEW.category_id
  ) THEN
    RAISE EXCEPTION 'Categoria inválida';
  END IF;
  
  -- Garantir que subcategory pertence à categoria (se fornecida)
  IF NEW.subcategory_id IS NOT NULL AND NEW.category_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM subcategories 
      WHERE id = NEW.subcategory_id 
      AND category_id = NEW.category_id
    ) THEN
      RAISE EXCEPTION 'Subcategoria não pertence à categoria selecionada';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS check_worker_service_consistency ON worker_services;
CREATE TRIGGER check_worker_service_consistency
BEFORE INSERT OR UPDATE ON worker_services
FOR EACH ROW EXECUTE FUNCTION validate_worker_service();

-- FASE 5: Criar tabelas para sistema de Comunidade
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('duvida', 'sugestao', 'oportunidade', 'aviso')),
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- RLS para community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem criar posts"
ON community_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Todos podem ver posts"
ON community_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas autor pode editar seus posts"
ON community_posts FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Autor e admin podem deletar posts"
ON community_posts FOR DELETE
TO authenticated
USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- RLS para community_comments
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem comentar"
ON community_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Todos podem ver comentários"
ON community_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas autor pode deletar comentário"
ON community_comments FOR DELETE
TO authenticated
USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- RLS para community_likes
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem curtir"
ON community_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Usuários podem ver curtidas"
ON community_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem remover suas curtidas"
ON community_likes FOR DELETE
TO authenticated
USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

-- Trigger para atualizar contadores
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'community_comments' THEN
      UPDATE community_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'community_likes' THEN
      UPDATE community_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'community_comments' THEN
      UPDATE community_posts 
      SET comments_count = comments_count - 1 
      WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'community_likes' THEN
      UPDATE community_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_comments_count ON community_comments;
CREATE TRIGGER update_comments_count
AFTER INSERT OR DELETE ON community_comments
FOR EACH ROW EXECUTE FUNCTION update_post_counters();

DROP TRIGGER IF EXISTS update_likes_count ON community_likes;
CREATE TRIGGER update_likes_count
AFTER INSERT OR DELETE ON community_likes
FOR EACH ROW EXECUTE FUNCTION update_post_counters();