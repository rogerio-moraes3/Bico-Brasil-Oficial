-- Cria tabela services para categorização de serviços
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  subcategory text,
  service_title text NOT NULL,
  service_description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy: serviços são visualizáveis por todos
CREATE POLICY "Services are viewable by everyone"
ON public.services
FOR SELECT
USING (true);

-- Insere todas as categorias e serviços
INSERT INTO public.services (category, subcategory, service_title, service_description) VALUES
-- Construção e Reforma
('Construção e Reforma', 'Alvenaria', 'Pedreiro por dia', 'Serviços de alvenaria e reboco.'),
('Construção e Reforma', 'Obra', 'Ajudante de obra', 'Apoio geral em obras e reformas.'),
('Construção e Reforma', 'Pintura', 'Pintor residencial', 'Pintura interna e externa.'),
('Construção e Reforma', 'Hidráulica', 'Encanador (reparos simples)', 'Troca de torneira, desentupimento.'),
('Construção e Reforma', 'Elétrica', 'Eletricista residencial', 'Troca de tomadas, chuveiro.'),
('Construção e Reforma', 'Gesso', 'Gesseiro / Drywall', 'Forros, molduras e divisórias.'),
('Construção e Reforma', 'Revestimento', 'Azulejista / Rejuntador', 'Aplicação e manutenção de revestimentos.'),
('Construção e Reforma', 'Marcenaria', 'Carpinteiro', 'Conserto de portas, rodapés e móveis.'),
('Construção e Reforma', 'Metalúrgica', 'Serraleiro / Soldador', 'Conserto e solda de portões e grades.'),
('Construção e Reforma', 'Telhado', 'Telhadista', 'Troca de telhas e vedação.'),

-- Montagem e Manutenção Doméstica
('Montagem e Manutenção Doméstica','Montagem','Montagem e desmontagem de móveis','Guarda-roupas, estantes, cozinhas.'),
('Montagem e Manutenção Doméstica','Instalação','Instalação de suporte de TV','Fixação em parede e ajustes.'),
('Montagem e Manutenção Doméstica','Instalação','Instalação de cortinas e prateleiras','Colocação e fixação.'),
('Montagem e Manutenção Doméstica','Consertos','Pequenos consertos domésticos','Marido de aluguel.'),
('Montagem e Manutenção Doméstica','Segurança','Troca de fechaduras e maçanetas','Instalação e manutenção.'),
('Montagem e Manutenção Doméstica','Higiene','Limpeza de caixa d''água','Higienização preventiva.'),
('Montagem e Manutenção Doméstica','Hidráulica','Troca de chuveiro ou torneira','Substituição e ajustes.'),
('Montagem e Manutenção Doméstica','Elétrica','Troca de lâmpadas e tomadas','Manutenção elétrica leve.'),

-- Jardinagem e Área Externa
('Jardinagem e Área Externa','Manutenção','Corte de grama','Jardins e quintais.'),
('Jardinagem e Área Externa','Poda','Poda de árvores e arbustos','Remoção e modelagem.'),
('Jardinagem e Área Externa','Limpeza','Limpeza de quintal','Varrição e retirada de folhas.'),
('Jardinagem e Área Externa','Capina','Capina de terreno','Roçagem e limpeza.'),
('Jardinagem e Área Externa','Jardinagem','Jardinagem básica','Plantio, adubo e poda.'),
('Jardinagem e Área Externa','Lavagem','Lavagem de calçada','Limpeza de pisos e muros.'),
('Jardinagem e Área Externa','Pintura','Pintura de muro e portão','Retoques e manutenção.'),
('Jardinagem e Área Externa','Cercamento','Instalação de cerca ou tela','Cercamento leve.'),
('Jardinagem e Área Externa','Piscina','Limpeza de piscina','Remoção de sujeira e manutenção.'),
('Jardinagem e Área Externa','Manutenção','Manutenção de jardim','Poda, irrigação e adubagem.'),

-- Limpeza e Organização
('Limpeza e Organização','Residencial','Faxina residencial','Limpeza completa de casas e apartamentos.'),
('Limpeza e Organização','Pós-obra','Limpeza pós-obra','Remoção de resíduos e poeira.'),
('Limpeza e Organização','Vidros','Lavagem de vidros','Janelas e portas de vidro.'),
('Limpeza e Organização','Garagem','Limpeza de garagem','Varrição e lavagem.'),
('Limpeza e Organização','Estofados','Lavagem de tapetes e sofás','Higienização.'),
('Limpeza e Organização','Fachada','Lavagem de fachada','Limpeza externa.'),
('Limpeza e Organização','Toldos','Limpeza de toldos e telhados','Remoção de sujeira e mofo.'),
('Limpeza e Organização','Gordura','Limpeza de caixa de gordura','Manutenção periódica.'),
('Limpeza e Organização','Organização','Organização de quintal ou depósito','Descarte e organização.'),
('Limpeza e Organização','Calhas','Limpeza de calhas','Manutenção preventiva.'),

-- Carga, Transporte e Apoio
('Carga, Transporte e Apoio','Carga','Carregar e descarregar caminhão','Mudança ou entrega.'),
('Carga, Transporte e Apoio','Mudança','Ajudante de mudança','Transporte de móveis e caixas.'),
('Carga, Transporte e Apoio','Descarte','Ajudante de descarte','Levar entulho e móveis.'),
('Carga, Transporte e Apoio','Entrega','Moto-frete','Entregas rápidas e locais.'),
('Carga, Transporte e Apoio','Feiras','Montagem e desmontagem de barracas','Feiras e eventos.'),
('Carga, Transporte e Apoio','Transporte','Transporte de materiais leves','Apoio logístico.'),
('Carga, Transporte e Apoio','Entrega','Entrega local','Bicicleta ou moto.'),
('Carga, Transporte e Apoio','Motorista','Motorista por diária','Transporte sob demanda.'),
('Carga, Transporte e Apoio','Eventos','Apoio em eventos','Montagem, limpeza, som.'),
('Carga, Transporte e Apoio','Promo','Distribuição de panfletos','Ações promocionais.'),

-- Comércio
('Comércio','Atendimento','Atendente temporário','Apoio em lojas e feiras.'),
('Comércio','Reposição','Repositor de mercadorias','Reposição e organização de prateleiras.'),
('Comércio','Entrega','Entregador local','Entregas urbanas com moto ou bike.'),
('Comércio','Estoque','Auxiliar de estoque','Conferência e separação de produtos.'),
('Comércio','PDV','Caixa / operador de PDV','Atendimento e fechamento de caixa.'),
('Comércio','Promoção','Promotor de vendas','Abordagem de clientes e panfletagem.'),
('Comércio','Loja','Montador de displays','Montagem de expositores e vitrines.'),
('Comércio','Limpeza','Limpeza de loja','Limpeza de vitrines, pisos e estoque.'),

-- Bares e Restaurantes
('Bares e Restaurantes','Serviço','Garçom / garçonete','Atendimento em eventos e bares.'),
('Bares e Restaurantes','Cozinha','Auxiliar de cozinha','Apoio no preparo e limpeza.'),
('Bares e Restaurantes','Cozinha','Churrasqueiro / cozinheiro','Preparo de carnes e refeições.'),
('Bares e Restaurantes','Bar','Barman / barista','Preparo de bebidas e cafés.'),
('Bares e Restaurantes','Buffet','Serviços de buffet','Montagem e apoio em eventos.'),
('Bares e Restaurantes','Higiene','Limpeza e higienização','Limpeza de salão e cozinha.'),
('Bares e Restaurantes','Entrega','Entregador de delivery','Entregas locais.'),
('Bares e Restaurantes','Eventos','Montagem de eventos','Apoio logístico em festas.'),

-- Serviços Pessoais
('Serviços Pessoais e Diversos','Limpeza','Diarista','Limpeza rápida por diária.'),
('Serviços Pessoais e Diversos','Passadoria','Passadeira','Roupas e cortinas.'),
('Serviços Pessoais e Diversos','Cozinha','Cozinheira por dia','Preparo de refeições e marmitas.'),
('Serviços Pessoais e Diversos','Pets','Cuidador de pets','Passeio e alimentação.'),
('Serviços Pessoais e Diversos','Cuidado','Cuidador de idosos / crianças','Acompanhamento leve.'),
('Serviços Pessoais e Diversos','Costura','Costureira','Ajustes e pequenos consertos.'),
('Serviços Pessoais e Diversos','Beleza','Beleza em domicílio','Cabelo, maquiagem, manicure.'),

-- Técnicos e Especializados
('Serviços Técnicos e Especializados','Portões','Reparo de portões automáticos','Manutenção básica.'),
('Serviços Técnicos e Especializados','ArCond','Manutenção de ar-condicionado','Limpeza e filtro.'),
('Serviços Técnicos e Especializados','Bicicletas','Conserto de bicicletas','Ajustes simples.'),
('Serviços Técnicos e Especializados','TV','Instalação de antena / suporte de TV','Fixação e alinhamento.'),
('Serviços Técnicos e Especializados','Reparos','Reparos elétricos e hidráulicos','Manutenção leve.'),

-- Eventos
('Eventos e Apoio Temporário','Tendas','Montagem e desmontagem de tendas','Feiras e shows.'),
('Eventos e Apoio Temporário','Logística','Manuseio e embalagem','Apoio logístico.'),
('Eventos e Apoio Temporário','Manobrista','Manobrista','Estacionamentos e eventos.'),
('Eventos e Apoio Temporário','Recepção','Recepcionista temporário','Eventos e convenções.');

-- Criar tabela de contatos
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
ON public.contacts
FOR INSERT
WITH CHECK (true);