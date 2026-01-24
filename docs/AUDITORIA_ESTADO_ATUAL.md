# Auditoria do Estado Atual (2026-01-24)

## 1. Arquitetura de Dados
- **Fonte principal de schema**: `MASTER_SCHEMA_DEFINITIVO.sql` descreve as tabelas principais (`cities`, `categories`, `subcategories`, `users`, `worker_services`, `registrations`, etc.) e habilita RLS nas tabelas públicas. Baseado em Supabase/Postgres.
- **Migrations**: há migrações em `supabase/migrations`, indicando evolução incremental do banco (ex.: constraints de ratings).
- **Pontos críticos**:
  - O schema central parece duplicado entre o SQL mestre e migrações. É necessário garantir que o SQL mestre não se torne divergente do estado real em produção.
  - RLS está habilitado; porém não há evidências aqui das policies completas (apenas `ENABLE ROW LEVEL SECURITY`). A auditoria de políticas precisa ser detalhada com base nas definições completas.

## 2. Autenticação
- **Cliente Supabase**: `src/integrations/supabase/client.ts` inicializa `createClient` com `persistSession`, `autoRefreshToken` e `detectSessionInUrl`.
- **Contexto de auth**: `src/contexts/AuthContext.tsx` centraliza `user`, `session`, `signUp`, `signIn`, `signOut`, expondo via provider.
- **Controle de acesso**:
  - `src/pages/Admin.tsx` e `src/pages/AdminServices.tsx` consultam `user_roles` para checar `role = 'admin'`.
  - `src/pages/PreLaunchLanding.tsx` verifica emails autorizados em `colaboradores_autorizados`.
- **Pontos críticos**:
  - Há múltiplos caminhos de autorização (roles e tabela de colaboradores). Necessário garantir consistência de políticas e evitar bypass.
  - Checagens client-side devem ser complementadas por RLS e policies server-side.

## 3. Frontend
- **Páginas principais**: `src/pages/Home.tsx`, `About.tsx`, `WantSomeone.tsx`, `Jobs.tsx`, `PreLaunchLanding.tsx`, `Admin.tsx`.
- **Componentes base**: `Header`, `Footer`, `Breadcrumbs`, `FloatingActionButton` e componentes UI (cards, buttons, etc.).
- **Pontos críticos**:
  - O app usa React + React Router. Não há evidências aqui de um mapeamento central de rotas (precisa verificar `App.tsx`).
  - A experiência depende fortemente do estado de auth; garantir UX consistente em estados de carregamento.

## 4. Erros / WebSocket
- **Service Worker**: `public/sw.js` implementa cache estático/dinâmico e tratamento de erros em `install/activate/fetch`.
- **Registro do SW**: `index.html` e `src/main.tsx` registram o SW; há lógica de atualização periódica.
- **WebSocket**: não foram encontrados arquivos explícitos de WebSocket; aparentemente o Supabase Realtime pode ser usado implicitamente (sem configuração própria).
- **Pontos críticos**:
  - O SW registra em dois pontos (index e main). É preciso validar se há redundância e risco de comportamentos inconsistentes.
  - Garantir logs e fallback em falhas do SW e de caches dinâmicos.

## 5. Performance
- **Cache**: SW faz cache de assets estáticos e gerenciamento de versões.
- **Render**: `src/main.tsx` força cor de fundo para evitar white flash.
- **Pontos críticos**:
  - Não há sinais de code splitting explícito ou análise de bundle.
  - A política de cache do SW usa `new Date().getTime()` na versão, o que invalida cache a cada build e pode reduzir o benefício do cache.

---

## Recomendações iniciais
1. Consolidar fonte de verdade do schema (migrations vs SQL mestre).
2. Revisar e documentar todas as policies de RLS, garantindo que checagens client-side não sejam a única barreira.
3. Centralizar registro de Service Worker para evitar duplicidade.
4. Avaliar estratégia de versionamento de cache para equilibrar atualização e performance.
5. Mapear rotas em `App.tsx` e documentar fluxos críticos no frontend.