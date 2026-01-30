# Módulo: Busca Inclusiva de Ocupações

## Escopo Autorizado

Este módulo é **exclusivo** para funcionalidade de busca de ocupações com tolerância a erros ortográficos. Este é um sistema **"lado B"** que não substitui nem altera a busca atual.

### O que PODE ser feito neste módulo

✅ Criar tabelas `public.ocupacoes` e `public.ocupacao_termos_busca`  
✅ Criar funções de normalização e busca (RPC)  
✅ Adicionar RLS policies somente-leitura (SELECT público)  
✅ Adicionar termos de busca e ocupações via migrations  
✅ Documentar API e exemplos de uso  
✅ (Futuro) Criar UI dedicada em `/search/ocupacoes` sem tocar busca atual

### O que NÃO PODE ser alterado

🚫 **Auth**: Login, signup, OAuth, ProtectedRoute, `supabase.auth.*`  
🚫 **Pagamentos**: MercadoPago, PIX, Resend, Premium, PlanCheckoutModal  
🚫 **Busca atual**: SearchWorkers, SearchJobs, endpoints existentes  
🚫 **Tabelas existentes**: Sem DROP, sem ALTER em schemas existentes  
🚫 **APIs existentes**: Nenhuma modificação em endpoints atuais

---

## Componentes Intocáveis (Lista Completa)

### Auth (PROIBIDO)
- `src/pages/Auth.tsx`
- `src/pages/CompleteProfile.tsx`
- `src/contexts/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- Qualquer código que use `supabase.auth.*`

### Pagamentos (PROIBIDO)
- `supabase/functions/create-pix-payment/**`
- `supabase/functions/mercadopago-webhook/**`
- `src/components/PlanCheckoutModal.tsx`
- `src/pages/Premium.tsx`
- Integrações MercadoPago, PIX, Resend

### Busca Atual (PROIBIDO)
- `src/pages/SearchWorkers.tsx`
- `src/pages/SearchJobs.tsx`
- `src/pages/ProcurarBicos.tsx`
- Endpoints/RPCs de busca existentes
- Queries de busca em `users`, `job_postings`, `worker_services`

### Tabelas Existentes (PROIBIDO DROP/ALTER)
- `users`, `profiles`, `job_postings`, `worker_services`
- `payments`, `plans`, `cities`, etc.
- Qualquer tabela já em produção

---

## Política: "Não Quebrar"

### Princípios

1. **Aditive-only**: Apenas CREATE, nunca DROP/ALTER em recursos existentes
2. **Idempotente**: Migrations usam `IF NOT EXISTS` quando possível
3. **RLS seguro**: Policies somente-leitura (SELECT) para catálogo público
4. **Isolado**: Backend completo sem dependências de código existente
5. **Testável**: Funciona via RPC sem necessidade de UI

### Rollback Seguro

Se necessário reverter:
```sql
-- Reverter é simples: apenas dropar as novas tabelas
DROP TABLE IF EXISTS public.ocupacao_termos_busca CASCADE;
DROP TABLE IF EXISTS public.ocupacoes CASCADE;
DROP FUNCTION IF EXISTS public.search_ocupacoes;
DROP FUNCTION IF EXISTS public.normalize_busca_texto;
```

Não afeta nenhum código existente pois não há dependências.

---

## Casos de Uso

### Usuário busca "xapa" (erro ortográfico de "chapa")
```sql
SELECT * FROM public.search_ocupacoes('xapa');
-- Retorna: ocupação "Chapa (carga e descarga)" com similarity > 0.8
```

### Usuário busca "encanhador" (erro comum de "encanador")
```sql
SELECT * FROM public.search_ocupacoes('encanhador');
-- Retorna: ocupação "Encanador" com similarity > 0.8
```

### Aplicação futura filtra por categoria
```sql
SELECT * FROM public.ocupacoes 
WHERE categoria_principal = 'construção' AND ativo = true;
```

---

## Roadmap Futuro (Fora do Escopo Atual)

- [ ] UI em `/search/ocupacoes` (sem tocar busca atual)
- [ ] Integração com cadastro de serviços (sugestões automáticas)
- [ ] Endpoint para adicionar novos termos via admin
- [ ] Analytics de buscas sem resultado
- [ ] Expansão para 100+ ocupações

**Importante**: Qualquer integração futura deve respeitar a mesma política de "não quebrar".

---

## Requisitos Técnicos

### PostgreSQL Extensions
- `unaccent` - Remoção de acentos (criada com `IF NOT EXISTS`)
- `pg_trgm` - Similaridade de trigrams (criada com `IF NOT EXISTS`)

Se o ambiente Supabase restringir criação de extensions, documentar como requisito no painel de configuração.

### Performance
- Índices GIN em `termo_norm` para busca rápida (< 100ms)
- RLS policies otimizadas para SELECT público

---

## Estrutura de Arquivos

```
docs/ocupacoes/
├── README.md          # Este arquivo (governança)
└── API.md             # Guia de uso da API

supabase/migrations/
├── YYYYMMDDHHMMSS_create_ocupacoes.sql
├── YYYYMMDDHHMMSS_create_ocupacao_termos.sql
├── YYYYMMDDHHMMSS_normalize_function.sql
├── YYYYMMDDHHMMSS_search_function.sql
└── YYYYMMDDHHMMSS_seed_ocupacoes.sql

(Futuro)
src/pages/SearchOcupacoes.tsx  # UI dedicada, não toca busca atual
```

---

## Contato e Suporte

Para dúvidas ou expansões deste módulo:
1. Revisar `docs/ocupacoes/API.md`
2. Testar via RPC no Supabase SQL Editor
3. Abrir issue descrevendo caso de uso

**LEMBRETE**: Sempre respeitar componentes intocáveis e política "não quebrar".
