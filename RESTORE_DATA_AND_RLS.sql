-- ==========================================
-- RESTAURAÇÃO DE DADOS E RLS: BICO BRASIL
-- ==========================================

-- 1. POPULAR CIDADES (Garantir que não esteja vazia)
-- Adicionando algumas cidades principais para garantir funcionamento imediato
INSERT INTO public.cities (name, state)
VALUES 
('Presidente Prudente', 'SP'),
('Álvares Machado', 'SP'),
('Pirapozinho', 'SP'),
('Regente Feijó', 'SP'),
('São José dos Campos', 'SP'),
('Caçapava', 'SP'),
('Jacareí', 'SP'),
('Taubaté', 'SP'),
('Paraibuna', 'SP'),
('São Paulo', 'SP'),
('Rio de Janeiro', 'RJ'),
('Belo Horizonte', 'MG'),
('Curitiba', 'PR')
ON CONFLICT DO NOTHING;

-- 2. CONFIGURAR RLS PARA LEITURA PÚBLICA (ESSENCIAL)
-- Sem isso, o app em produção não consegue listar cidades/categorias sem login

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read cities" ON public.cities;
CREATE POLICY "Allow public read cities" ON public.cities FOR SELECT USING (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read subcategories" ON public.subcategories;
CREATE POLICY "Allow public read subcategories" ON public.subcategories FOR SELECT USING (true);

-- 3. GARANTIR UNIQUE CONSTRAINT NO CPF
-- Primeiro remover possíveis duplicatas (opcional, mas seguro)
-- DELETE FROM public.users a USING public.users b WHERE a.id < b.id AND a.cpf = b.cpf AND a.cpf IS NOT NULL;

-- Tentar adicionar a constraint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_cpf_key') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_cpf_key UNIQUE (cpf);
    END IF;
END $$;
