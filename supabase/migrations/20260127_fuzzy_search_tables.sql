-- ============================================
-- SCRIPT: Criação de Tabelas para Busca Fuzzy
-- Data: 27/01/2026
-- Objetivo: Adicionar tabelas ocupacoes, termos_busca e coluna is_profile_complete
-- ============================================

-- 1. Tabela de Ocupações
CREATE TABLE IF NOT EXISTS ocupacoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  categoria VARCHAR(100),
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_ocupacoes_nome ON ocupacoes(nome);
CREATE INDEX IF NOT EXISTS idx_ocupacoes_categoria ON ocupacoes(categoria);

-- 2. Tabela de Termos de Busca (para fuzzy matching)
CREATE TABLE IF NOT EXISTS termos_busca (
  id SERIAL PRIMARY KEY,
  termo_original VARCHAR(255) NOT NULL,
  termo_normalizado VARCHAR(255) NOT NULL,
  ocupacao_id INTEGER REFERENCES ocupacoes(id) ON DELETE CASCADE,
  relevancia INTEGER DEFAULT 100 CHECK (relevancia >= 0 AND relevancia <= 100),
  tipo VARCHAR(50) DEFAULT 'sinonimo', -- sinonimo, variacao, abreviacao
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_termos_busca_normalizado ON termos_busca(termo_normalizado);
CREATE INDEX IF NOT EXISTS idx_termos_busca_ocupacao ON termos_busca(ocupacao_id);
CREATE INDEX IF NOT EXISTS idx_termos_busca_relevancia ON termos_busca(relevancia DESC);

-- 3. Adicionar coluna is_profile_complete à tabela profiles (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_profile_complete'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_profile_complete BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Índice para filtrar perfis completos/incompletos
CREATE INDEX IF NOT EXISTS idx_profiles_complete ON profiles(is_profile_complete);

-- 4. Inserir ocupações iniciais (exemplos comuns)
INSERT INTO ocupacoes (nome, categoria) VALUES
  ('Pedreiro', 'Construção'),
  ('Eletricista', 'Construção'),
  ('Encanador', 'Construção'),
  ('Pintor', 'Construção'),
  ('Marceneiro', 'Construção'),
  ('Jardineiro', 'Serviços Gerais'),
  ('Faxineiro', 'Serviços Gerais'),
  ('Diarista', 'Serviços Gerais'),
  ('Cozinheiro', 'Alimentação'),
  ('Garçom', 'Alimentação'),
  ('Motorista', 'Transporte'),
  ('Entregador', 'Transporte'),
  ('Babá', 'Cuidados'),
  ('Cuidador de Idosos', 'Cuidados'),
  ('Professor Particular', 'Educação'),
  ('Técnico de Informática', 'Tecnologia'),
  ('Fotógrafo', 'Eventos'),
  ('Músico', 'Eventos'),
  ('Personal Trainer', 'Saúde'),
  ('Manicure', 'Beleza')
ON CONFLICT (nome) DO NOTHING;

-- 5. Inserir termos de busca (sinônimos e variações)
INSERT INTO termos_busca (termo_original, termo_normalizado, ocupacao_id, relevancia, tipo) VALUES
  -- Pedreiro
  ('pedreiro', 'pedreiro', (SELECT id FROM ocupacoes WHERE nome = 'Pedreiro'), 100, 'principal'),
  ('mestre de obras', 'mestre de obras', (SELECT id FROM ocupacoes WHERE nome = 'Pedreiro'), 90, 'sinonimo'),
  ('servente', 'servente', (SELECT id FROM ocupacoes WHERE nome = 'Pedreiro'), 80, 'relacionado'),
  
  -- Eletricista
  ('eletricista', 'eletricista', (SELECT id FROM ocupacoes WHERE nome = 'Eletricista'), 100, 'principal'),
  ('eletrotecnico', 'eletrotecnico', (SELECT id FROM ocupacoes WHERE nome = 'Eletricista'), 90, 'sinonimo'),
  ('instalador eletrico', 'instalador eletrico', (SELECT id FROM ocupacoes WHERE nome = 'Eletricista'), 85, 'variacao'),
  
  -- Encanador
  ('encanador', 'encanador', (SELECT id FROM ocupacoes WHERE nome = 'Encanador'), 100, 'principal'),
  ('bombeiro hidraulico', 'bombeiro hidraulico', (SELECT id FROM ocupacoes WHERE nome = 'Encanador'), 95, 'sinonimo'),
  ('instalador hidraulico', 'instalador hidraulico', (SELECT id FROM ocupacoes WHERE nome = 'Encanador'), 90, 'variacao'),
  
  -- Pintor
  ('pintor', 'pintor', (SELECT id FROM ocupacoes WHERE nome = 'Pintor'), 100, 'principal'),
  ('pintor de parede', 'pintor de parede', (SELECT id FROM ocupacoes WHERE nome = 'Pintor'), 95, 'variacao'),
  
  -- Diarista
  ('diarista', 'diarista', (SELECT id FROM ocupacoes WHERE nome = 'Diarista'), 100, 'principal'),
  ('faxineira', 'faxineira', (SELECT id FROM ocupacoes WHERE nome = 'Diarista'), 95, 'sinonimo'),
  ('empregada domestica', 'empregada domestica', (SELECT id FROM ocupacoes WHERE nome = 'Diarista'), 90, 'sinonimo')
ON CONFLICT DO NOTHING;

-- 6. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_ocupacoes_updated_at ON ocupacoes;
CREATE TRIGGER update_ocupacoes_updated_at
  BEFORE UPDATE ON ocupacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_termos_busca_updated_at ON termos_busca;
CREATE TRIGGER update_termos_busca_updated_at
  BEFORE UPDATE ON termos_busca
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Comentários nas tabelas
COMMENT ON TABLE ocupacoes IS 'Tabela de ocupações/profissões disponíveis no sistema';
COMMENT ON TABLE termos_busca IS 'Termos de busca normalizados para fuzzy matching';
COMMENT ON COLUMN profiles.is_profile_complete IS 'Indica se o perfil do usuário está completo (true) ou incompleto (false)';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
