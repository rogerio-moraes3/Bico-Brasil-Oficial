# API: Busca Inclusiva de Ocupações

## Visão Geral

Esta API permite buscar ocupações com tolerância a erros ortográficos usando similaridade de trigrams (`pg_trgm`).

**Endpoint principal**: RPC `public.search_ocupacoes()`

---

## Chamada RPC via SQL

### Sintaxe

```sql
SELECT * FROM public.search_ocupacoes(
  q TEXT,                    -- Query de busca
  lim INT DEFAULT 10,        -- Limite de resultados
  min_sim REAL DEFAULT 0.3   -- Similaridade mínima (0-1)
);
```

### Exemplos

#### Busca simples
```sql
-- Buscar "chapa" ou variações
SELECT * FROM public.search_ocupacoes('chapa');
```

#### Tolerância a erros ortográficos
```sql
-- Usuário digitou "xapa" (erro comum)
SELECT * FROM public.search_ocupacoes('xapa');
-- Retorna: Chapa (carga e descarga) com similarity ~0.9

-- Usuário digitou "encanhador"
SELECT * FROM public.search_ocupacoes('encanhador');
-- Retorna: Encanador com similarity ~0.87

-- Usuário digitou "assogeiro" (azulejista)
SELECT * FROM public.search_ocupacoes('assogeiro');
-- Retorna: Azulejista com similarity ~0.7
```

#### Ajustar limite e similaridade mínima
```sql
-- Buscar "pintor" com até 5 resultados e similarity >= 0.5
SELECT * FROM public.search_ocupacoes('pintor', 5, 0.5);
```

#### Filtrar por categoria (após busca)
```sql
-- Buscar na categoria "construção"
SELECT s.* 
FROM public.search_ocupacoes('pedreiro') s
WHERE s.categoria_principal = 'construção';
```

---

## Chamada via supabase-js (Exemplo)

**Nota**: Este é apenas um exemplo. A integração no app ainda não foi feita.

### JavaScript / TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Buscar ocupações
const { data, error } = await supabase
  .rpc('search_ocupacoes', {
    q: 'xapa',
    lim: 10,
    min_sim: 0.3
  });

if (error) {
  console.error('Erro na busca:', error);
} else {
  console.log('Resultados:', data);
  // data é um array de objetos com:
  // { ocupacao_id, slug, nome_oficial, descricao_simples,
  //   categoria_principal, tipo_trabalho, nivel_instrucao,
  //   termo_match, similarity_score }
}
```

---

## Retorno da API

### Estrutura do Resultado

| Campo                 | Tipo   | Descrição                                       |
|-----------------------|--------|-------------------------------------------------|
| `ocupacao_id`         | UUID   | ID da ocupação                                  |
| `slug`                | TEXT   | Identificador legível (ex: `chapa-carga-descarga`) |
| `nome_oficial`        | TEXT   | Nome oficial da ocupação                        |
| `descricao_simples`   | TEXT   | Descrição em linguagem acessível                |
| `categoria_principal` | TEXT   | Categoria (construção, limpeza, frete, etc.)    |
| `tipo_trabalho`       | TEXT   | Tipo: `braçal`, `técnico`, ou `misto`           |
| `nivel_instrucao`     | TEXT   | Nível: `baixa`, `media`, ou `alta`              |
| `termo_match`         | TEXT   | Termo que fez o match                           |
| `similarity_score`    | REAL   | Score de similaridade (0-1)                     |

### Exemplo de Resultado

```json
[
  {
    "ocupacao_id": "a1b2c3d4-...",
    "slug": "chapa-carga-descarga",
    "nome_oficial": "Chapa (carga e descarga)",
    "descricao_simples": "Carregar e descarregar materiais, mercadorias e mudanças",
    "categoria_principal": "frete",
    "tipo_trabalho": "braçal",
    "nivel_instrucao": "baixa",
    "termo_match": "xapa",
    "similarity_score": 0.9
  }
]
```

---

## Parâmetros e Ajustes

### `q` (Query)

- **Tipo**: `TEXT`
- **Obrigatório**: Sim
- **Descrição**: Termo de busca digitado pelo usuário
- **Normalização automática**: Sim (lowercase, sem acentos, sem pontuação)

### `lim` (Limit)

- **Tipo**: `INTEGER`
- **Default**: `10`
- **Descrição**: Número máximo de resultados retornados

### `min_sim` (Similaridade Mínima)

- **Tipo**: `REAL` (0-1)
- **Default**: `0.3`
- **Descrição**: Threshold mínimo de similaridade para match
- **Recomendações**:
  - `0.3` - Tolerante (permite muitos erros)
  - `0.5` - Balanceado
  - `0.7` - Restritivo (apenas erros leves)

---

## Como Adicionar Novas Ocupações/Termos

### Adicionar Ocupação (via SQL)

```sql
INSERT INTO public.ocupacoes (
  slug, 
  nome_oficial, 
  descricao_simples, 
  categoria_principal, 
  tipo_trabalho, 
  nivel_instrucao
)
VALUES (
  'pedreiro',
  'Pedreiro',
  'Construir muros, paredes e estruturas de alvenaria',
  'construção',
  'técnico',
  'media'
)
RETURNING id;
```

### Adicionar Termos de Busca

```sql
-- Supondo que a ocupação "pedreiro" tenha ID = 'abc-123'
INSERT INTO public.ocupacao_termos_busca (
  ocupacao_id, 
  termo, 
  termo_norm, 
  tipo_termo, 
  peso_relevancia
) VALUES
  ('abc-123', 'pedreiro', public.normalize_busca_texto('pedreiro'), 'oficial', 10),
  ('abc-123', 'pedrero', public.normalize_busca_texto('pedrero'), 'erro_ortografico', 8),
  ('abc-123', 'pedreirista', public.normalize_busca_texto('pedreirista'), 'erro_ortografico', 7),
  ('abc-123', 'pedreiro mestre', public.normalize_busca_texto('pedreiro mestre'), 'popular', 6);
```

**Importante**: Sempre use `public.normalize_busca_texto()` para preencher `termo_norm`.

---

## Categorias Disponíveis

As categorias atuais no seed inicial são:

- `construção` - Obras, reformas, alvenaria
- `limpeza` - Faxina, limpeza residencial/comercial
- `frete` - Transporte, carga e descarga
- `manutenção` - Elétrica, hidráulica, refrigeração
- `jardinagem` - Cuidado de jardins e áreas verdes
- `montagem` - Montagem de móveis
- `cozinha` - Preparação de alimentos
- `atendimento` - Garçom, atendente
- `transporte` - Motorista, entregador
- `segurança` - Vigilância, portaria

Você pode adicionar novas categorias conforme necessário.

---

## Performance

### Índices GIN

A busca utiliza índices GIN em `termo_norm` para performance otimizada:

```sql
CREATE INDEX idx_termos_norm_trgm
ON public.ocupacao_termos_busca
USING GIN (termo_norm gin_trgm_ops);
```

**Expectativa**: < 100ms para buscas com até 1000 ocupações.

---

## RLS (Row Level Security)

### Policies Ativas

- **Tabela `ocupacoes`**: SELECT público onde `ativo = true`
- **Tabela `ocupacao_termos_busca`**: SELECT público onde `ativo = true`

**Implicação**: Usuários não autenticados podem ler o catálogo. Apenas `service_role` ou admin podem inserir/atualizar.

---

## Roadmap Futuro

- [ ] Endpoint admin para adicionar ocupações via UI
- [ ] Analytics de buscas sem resultado
- [ ] Sugestões automáticas (autocomplete)
- [ ] Expansão para 100+ ocupações
- [ ] Integração com cadastro de serviços (sugerir categoria ao prestador)

---

## Troubleshooting

### "Extension not found"

Se você receber erro relacionado a `unaccent` ou `pg_trgm`:

1. Verifique se as extensions foram criadas:
   ```sql
   SELECT * FROM pg_extension WHERE extname IN ('unaccent', 'pg_trgm');
   ```

2. Se não existirem, execute (requer permissão de superuser):
   ```sql
   CREATE EXTENSION IF NOT EXISTS unaccent;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

No Supabase, estas extensions já vêm habilitadas por padrão.

### "Nenhum resultado encontrado"

- Reduza `min_sim` para `0.2` ou `0.1`
- Verifique se a ocupação existe no catálogo:
  ```sql
  SELECT * FROM public.ocupacoes;
  ```

### "Similaridade muito baixa"

- Adicione mais termos alternativos para a ocupação
- Inclua erros ortográficos comuns como termos do tipo `erro_ortografico`

---

## Contato

Para dúvidas ou sugestões sobre este módulo, consulte `docs/ocupacoes/README.md` (governança) ou abra uma issue no repositório.
