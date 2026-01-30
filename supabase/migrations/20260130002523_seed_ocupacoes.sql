-- Migration: Etapa 5 - Seed inicial (20 ocupações + termos)
-- INSERT idempotente usando ON CONFLICT DO NOTHING

-- Função helper para inserir ocupação + termos atomicamente
DO $$
DECLARE
  v_ocupacao_id UUID;
BEGIN
  
  -- 1) Chapa (carga e descarga)
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('chapa-carga-descarga', 'Chapa (carga e descarga)', 'Carregar e descarregar materiais, mercadorias e mudanças', 'frete', 'braçal', 'baixa')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'chapa-carga-descarga';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'chapa', public.normalize_busca_texto('chapa'), 'oficial', 10),
      (v_ocupacao_id, 'xapa', public.normalize_busca_texto('xapa'), 'erro_ortografico', 9),
      (v_ocupacao_id, 'carregador', public.normalize_busca_texto('carregador'), 'popular', 8),
      (v_ocupacao_id, 'descarrega', public.normalize_busca_texto('descarrega'), 'popular', 7),
      (v_ocupacao_id, 'carga e descarga', public.normalize_busca_texto('carga e descarga'), 'oficial', 9),
      (v_ocupacao_id, 'braçal', public.normalize_busca_texto('braçal'), 'popular', 6),
      (v_ocupacao_id, 'carrega caminhão', public.normalize_busca_texto('carrega caminhão'), 'popular', 7),
      (v_ocupacao_id, 'ajudante mudança', public.normalize_busca_texto('ajudante mudança'), 'popular', 7),
      (v_ocupacao_id, 'movimentação carga', public.normalize_busca_texto('movimentação carga'), 'oficial', 6),
      (v_ocupacao_id, 'estiva', public.normalize_busca_texto('estiva'), 'regional', 5)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 2) Ajudante de pedreiro
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('ajudante-pedreiro', 'Ajudante de pedreiro', 'Auxiliar em obras de construção civil', 'construção', 'braçal', 'baixa')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'ajudante-pedreiro';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'ajudante de pedreiro', public.normalize_busca_texto('ajudante de pedreiro'), 'oficial', 10),
      (v_ocupacao_id, 'ajudante pedreiro', public.normalize_busca_texto('ajudante pedreiro'), 'popular', 9),
      (v_ocupacao_id, 'servente', public.normalize_busca_texto('servente'), 'oficial', 8),
      (v_ocupacao_id, 'servente de pedreiro', public.normalize_busca_texto('servente de pedreiro'), 'oficial', 8),
      (v_ocupacao_id, 'ajudante de obra', public.normalize_busca_texto('ajudante de obra'), 'popular', 7),
      (v_ocupacao_id, 'auxiliar de pedreiro', public.normalize_busca_texto('auxiliar de pedreiro'), 'oficial', 7),
      (v_ocupacao_id, 'pedreiro ajudante', public.normalize_busca_texto('pedreiro ajudante'), 'popular', 6),
      (v_ocupacao_id, 'masseiro', public.normalize_busca_texto('masseiro'), 'regional', 5),
      (v_ocupacao_id, 'ajudante construção', public.normalize_busca_texto('ajudante construção'), 'popular', 7),
      (v_ocupacao_id, 'servente obra', public.normalize_busca_texto('servente obra'), 'popular', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 3) Pintor
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('pintor', 'Pintor', 'Pintar paredes, tetos e superfícies residenciais ou comerciais', 'construção', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'pintor';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'pintor', public.normalize_busca_texto('pintor'), 'oficial', 10),
      (v_ocupacao_id, 'pintor de parede', public.normalize_busca_texto('pintor de parede'), 'popular', 8),
      (v_ocupacao_id, 'pintor residencial', public.normalize_busca_texto('pintor residencial'), 'oficial', 7),
      (v_ocupacao_id, 'pintor predial', public.normalize_busca_texto('pintor predial'), 'oficial', 7),
      (v_ocupacao_id, 'pintura', public.normalize_busca_texto('pintura'), 'popular', 6),
      (v_ocupacao_id, 'pinta casa', public.normalize_busca_texto('pinta casa'), 'popular', 5),
      (v_ocupacao_id, 'pintador', public.normalize_busca_texto('pintador'), 'erro_ortografico', 5)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 4) Eletricista
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('eletricista', 'Eletricista', 'Instalar e consertar sistemas elétricos', 'manutenção', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'eletricista';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'eletricista', public.normalize_busca_texto('eletricista'), 'oficial', 10),
      (v_ocupacao_id, 'eletrisista', public.normalize_busca_texto('eletrisista'), 'erro_ortografico', 8),
      (v_ocupacao_id, 'eletrecista', public.normalize_busca_texto('eletrecista'), 'erro_ortografico', 7),
      (v_ocupacao_id, 'instalador elétrico', public.normalize_busca_texto('instalador elétrico'), 'oficial', 7),
      (v_ocupacao_id, 'técnico eletricista', public.normalize_busca_texto('técnico eletricista'), 'oficial', 6),
      (v_ocupacao_id, 'eletricista residencial', public.normalize_busca_texto('eletricista residencial'), 'popular', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 5) Encanador
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('encanador', 'Encanador', 'Instalar e consertar tubulações de água e esgoto', 'manutenção', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'encanador';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'encanador', public.normalize_busca_texto('encanador'), 'oficial', 10),
      (v_ocupacao_id, 'encanhador', public.normalize_busca_texto('encanhador'), 'erro_ortografico', 9),
      (v_ocupacao_id, 'bombeiro hidráulico', public.normalize_busca_texto('bombeiro hidráulico'), 'oficial', 8),
      (v_ocupacao_id, 'bombeiro', public.normalize_busca_texto('bombeiro'), 'popular', 7),
      (v_ocupacao_id, 'encanador hidráulico', public.normalize_busca_texto('encanador hidráulico'), 'oficial', 6),
      (v_ocupacao_id, 'instalador hidráulico', public.normalize_busca_texto('instalador hidráulico'), 'oficial', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 6) Faxineira / Diarista
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('faxineira-diarista', 'Faxineira / Diarista', 'Fazer limpeza de residências e escritórios', 'limpeza', 'braçal', 'baixa')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'faxineira-diarista';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'faxineira', public.normalize_busca_texto('faxineira'), 'oficial', 10),
      (v_ocupacao_id, 'diarista', public.normalize_busca_texto('diarista'), 'oficial', 10),
      (v_ocupacao_id, 'faxina', public.normalize_busca_texto('faxina'), 'popular', 8),
      (v_ocupacao_id, 'limpeza', public.normalize_busca_texto('limpeza'), 'popular', 7),
      (v_ocupacao_id, 'empregada doméstica', public.normalize_busca_texto('empregada doméstica'), 'oficial', 6),
      (v_ocupacao_id, 'auxiliar de limpeza', public.normalize_busca_texto('auxiliar de limpeza'), 'oficial', 6),
      (v_ocupacao_id, 'faxineiro', public.normalize_busca_texto('faxineiro'), 'oficial', 9)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 7) Jardineiro
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('jardineiro', 'Jardineiro', 'Cuidar de jardins, plantas e áreas verdes', 'jardinagem', 'braçal', 'baixa')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'jardineiro';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'jardineiro', public.normalize_busca_texto('jardineiro'), 'oficial', 10),
      (v_ocupacao_id, 'jardinagem', public.normalize_busca_texto('jardinagem'), 'popular', 8),
      (v_ocupacao_id, 'paisagista', public.normalize_busca_texto('paisagista'), 'oficial', 6),
      (v_ocupacao_id, 'cuidador de jardim', public.normalize_busca_texto('cuidador de jardim'), 'popular', 5)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 8) Montador de móveis
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('montador-moveis', 'Montador de móveis', 'Montar e desmontar móveis planejados e modulares', 'montagem', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'montador-moveis';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'montador de móveis', public.normalize_busca_texto('montador de móveis'), 'oficial', 10),
      (v_ocupacao_id, 'montador', public.normalize_busca_texto('montador'), 'popular', 8),
      (v_ocupacao_id, 'montagem de móveis', public.normalize_busca_texto('montagem de móveis'), 'popular', 7),
      (v_ocupacao_id, 'montador moveis planejados', public.normalize_busca_texto('montador moveis planejados'), 'popular', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 9) Carpinteiro
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('carpinteiro', 'Carpinteiro', 'Trabalhar com madeira: móveis, estruturas, reformas', 'construção', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'carpinteiro';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'carpinteiro', public.normalize_busca_texto('carpinteiro'), 'oficial', 10),
      (v_ocupacao_id, 'carpintaria', public.normalize_busca_texto('carpintaria'), 'popular', 7),
      (v_ocupacao_id, 'carpintero', public.normalize_busca_texto('carpintero'), 'erro_ortografico', 5)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 10) Azulejista
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('azulejista', 'Azulejista', 'Instalar azulejos, pisos e revestimentos', 'construção', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'azulejista';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'azulejista', public.normalize_busca_texto('azulejista'), 'oficial', 10),
      (v_ocupacao_id, 'assogeiro', public.normalize_busca_texto('assogeiro'), 'erro_ortografico', 9),
      (v_ocupacao_id, 'assoalhador', public.normalize_busca_texto('assoalhador'), 'regional', 6),
      (v_ocupacao_id, 'ladrilheiro', public.normalize_busca_texto('ladrilheiro'), 'regional', 7),
      (v_ocupacao_id, 'colocador de piso', public.normalize_busca_texto('colocador de piso'), 'popular', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 11) Gesseiro
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('gesseiro', 'Gesseiro', 'Aplicar gesso em paredes e forros', 'construção', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'gesseiro';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'gesseiro', public.normalize_busca_texto('gesseiro'), 'oficial', 10),
      (v_ocupacao_id, 'gesso', public.normalize_busca_texto('gesso'), 'popular', 7),
      (v_ocupacao_id, 'geseiro', public.normalize_busca_texto('geseiro'), 'erro_ortografico', 6),
      (v_ocupacao_id, 'aplicador de gesso', public.normalize_busca_texto('aplicador de gesso'), 'oficial', 5)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 12) Marceneiro
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('marceneiro', 'Marceneiro', 'Fabricar e consertar móveis de madeira', 'construção', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'marceneiro';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'marceneiro', public.normalize_busca_texto('marceneiro'), 'oficial', 10),
      (v_ocupacao_id, 'marcenaria', public.normalize_busca_texto('marcenaria'), 'popular', 7),
      (v_ocupacao_id, 'marseneiro', public.normalize_busca_texto('marseneiro'), 'erro_ortografico', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 13) Serralheiro
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('serralheiro', 'Serralheiro', 'Trabalhar com metal: portões, grades, estruturas', 'construção', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'serralheiro';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'serralheiro', public.normalize_busca_texto('serralheiro'), 'oficial', 10),
      (v_ocupacao_id, 'serralheria', public.normalize_busca_texto('serralheria'), 'popular', 7),
      (v_ocupacao_id, 'serralhero', public.normalize_busca_texto('serralhero'), 'erro_ortografico', 5),
      (v_ocupacao_id, 'ferreiro', public.normalize_busca_texto('ferreiro'), 'regional', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 14) Soldador
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('soldador', 'Soldador', 'Soldar metais e estruturas metálicas', 'construção', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'soldador';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'soldador', public.normalize_busca_texto('soldador'), 'oficial', 10),
      (v_ocupacao_id, 'solda', public.normalize_busca_texto('solda'), 'popular', 7),
      (v_ocupacao_id, 'soldagem', public.normalize_busca_texto('soldagem'), 'oficial', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 15) Técnico de refrigeração
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('tecnico-refrigeracao', 'Técnico de refrigeração', 'Instalar e consertar ar-condicionado e geladeiras', 'manutenção', 'técnico', 'alta')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'tecnico-refrigeracao';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'técnico de refrigeração', public.normalize_busca_texto('técnico de refrigeração'), 'oficial', 10),
      (v_ocupacao_id, 'refrigeração', public.normalize_busca_texto('refrigeração'), 'popular', 7),
      (v_ocupacao_id, 'ar condicionado', public.normalize_busca_texto('ar condicionado'), 'popular', 8),
      (v_ocupacao_id, 'instalador ar', public.normalize_busca_texto('instalador ar'), 'popular', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 16) Motorista de aplicativo
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('motorista-aplicativo', 'Motorista de aplicativo', 'Transportar passageiros por app (Uber, 99, etc)', 'transporte', 'misto', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'motorista-aplicativo';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'motorista de aplicativo', public.normalize_busca_texto('motorista de aplicativo'), 'oficial', 10),
      (v_ocupacao_id, 'uber', public.normalize_busca_texto('uber'), 'popular', 9),
      (v_ocupacao_id, '99', public.normalize_busca_texto('99'), 'popular', 8),
      (v_ocupacao_id, 'motorista app', public.normalize_busca_texto('motorista app'), 'popular', 7),
      (v_ocupacao_id, 'motorista particular', public.normalize_busca_texto('motorista particular'), 'popular', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 17) Entregador
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('entregador', 'Entregador', 'Entregar comida e encomendas de app ou empresa', 'transporte', 'braçal', 'baixa')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'entregador';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'entregador', public.normalize_busca_texto('entregador'), 'oficial', 10),
      (v_ocupacao_id, 'motoboy', public.normalize_busca_texto('motoboy'), 'popular', 9),
      (v_ocupacao_id, 'motofretista', public.normalize_busca_texto('motofretista'), 'oficial', 7),
      (v_ocupacao_id, 'delivery', public.normalize_busca_texto('delivery'), 'popular', 8),
      (v_ocupacao_id, 'ifood', public.normalize_busca_texto('ifood'), 'popular', 7),
      (v_ocupacao_id, 'rappi', public.normalize_busca_texto('rappi'), 'popular', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 18) Cozinheiro
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('cozinheiro', 'Cozinheiro', 'Preparar refeições em cozinhas residenciais ou comerciais', 'cozinha', 'técnico', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'cozinheiro';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'cozinheiro', public.normalize_busca_texto('cozinheiro'), 'oficial', 10),
      (v_ocupacao_id, 'cozinheira', public.normalize_busca_texto('cozinheira'), 'oficial', 10),
      (v_ocupacao_id, 'cozinha', public.normalize_busca_texto('cozinha'), 'popular', 7),
      (v_ocupacao_id, 'chef', public.normalize_busca_texto('chef'), 'popular', 6),
      (v_ocupacao_id, 'cozinhera', public.normalize_busca_texto('cozinhera'), 'erro_ortografico', 5)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 19) Garçom
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('garcom', 'Garçom', 'Atender clientes em bares e restaurantes', 'atendimento', 'braçal', 'baixa')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'garcom';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'garçom', public.normalize_busca_texto('garçom'), 'oficial', 10),
      (v_ocupacao_id, 'garcom', public.normalize_busca_texto('garcom'), 'erro_ortografico', 9),
      (v_ocupacao_id, 'garçonete', public.normalize_busca_texto('garçonete'), 'oficial', 10),
      (v_ocupacao_id, 'atendente', public.normalize_busca_texto('atendente'), 'popular', 6),
      (v_ocupacao_id, 'copeiro', public.normalize_busca_texto('copeiro'), 'regional', 5)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

  -- 20) Segurança
  INSERT INTO public.ocupacoes (slug, nome_oficial, descricao_simples, categoria_principal, tipo_trabalho, nivel_instrucao)
  VALUES ('seguranca', 'Segurança', 'Proteger pessoas e patrimônios em eventos e locais', 'segurança', 'braçal', 'media')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_ocupacao_id;
  
  -- Se já existe, buscar ID
  IF v_ocupacao_id IS NULL THEN
    SELECT id INTO v_ocupacao_id FROM public.ocupacoes WHERE slug = 'seguranca';
  END IF;
  
  IF v_ocupacao_id IS NOT NULL THEN
    INSERT INTO public.ocupacao_termos_busca (ocupacao_id, termo, termo_norm, tipo_termo, peso_relevancia) VALUES
      (v_ocupacao_id, 'segurança', public.normalize_busca_texto('segurança'), 'oficial', 10),
      (v_ocupacao_id, 'seguranca', public.normalize_busca_texto('seguranca'), 'erro_ortografico', 9),
      (v_ocupacao_id, 'vigilante', public.normalize_busca_texto('vigilante'), 'oficial', 9),
      (v_ocupacao_id, 'porteiro', public.normalize_busca_texto('porteiro'), 'popular', 7),
      (v_ocupacao_id, 'vigia', public.normalize_busca_texto('vigia'), 'popular', 7),
      (v_ocupacao_id, 'segurança de evento', public.normalize_busca_texto('segurança de evento'), 'popular', 6)
    ON CONFLICT (ocupacao_id, termo_norm) DO NOTHING;
  END IF;

END $$;

-- Comment
COMMENT ON TABLE public.ocupacoes IS 'Seed executado: 20 ocupações iniciais cadastradas';
COMMENT ON TABLE public.ocupacao_termos_busca IS 'Seed executado: ~200 termos de busca cadastrados com fuzzy matching';
