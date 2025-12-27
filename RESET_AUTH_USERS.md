# 🔄 Guia de Reset Total do Banco de Dados

## ⚠️ ATENÇÃO - LEIA ANTES DE EXECUTAR

Este guia mostra como fazer um **reset total** dos cadastros, preservando apenas os **2 usuários administradores**.

**IMPORTANTE**: Esta ação é **IRREVERSÍVEL**. Todos os dados de usuários, jobs, serviços, pagamentos, etc. serão **PERMANENTEMENTE DELETADOS**, exceto os 2 admins.

---

## 📋 Pré-Requisitos

Antes de começar, você precisa:

1. ✅ Acesso ao Dashboard do Supabase
2. ✅ Permissões de administrador
3. ✅ Backup dos dados (se necessário)
4. ✅ Confirmação de que deseja realmente deletar tudo

---

## 🔍 PASSO 1: Identificar os Administradores

### 1.1 Acessar SQL Editor

1. Acesse: https://app.supabase.com/project/lohzlvkotuawqaxxqjah/sql
2. Clique em "New query"

### 1.2 Executar Query de Identificação

Cole e execute esta query:

```sql
-- Listar usuários administradores
SELECT 
  u.id,
  u.auth_id,
  u.email,
  u.name,
  ur.role,
  'Admin via user_roles' as admin_source
FROM public.users u
INNER JOIN public.user_roles ur ON ur.user_id = u.auth_id
WHERE ur.role = 'admin'

UNION

SELECT 
  u.id,
  u.auth_id,
  u.email,
  u.name,
  NULL as role,
  'Admin via colaboradores_autorizados' as admin_source
FROM public.users u
INNER JOIN public.colaboradores_autorizados ca ON LOWER(ca.email) = LOWER(u.email);
```

### 1.3 Anotar os Emails dos Admins

**IMPORTANTE**: Anote os **2 emails** que aparecerem. Você precisará deles no Passo 3.

Exemplo:
- `admin1@bicobrasil.com`
- `admin2@bicobrasil.com`

---

## 🗑️ PASSO 2: Deletar Usuários da Tabela `public.users`

### 2.1 Abrir o Script SQL

1. Abra o arquivo: `RESET_DATABASE.sql`
2. Copie **TODO** o conteúdo

### 2.2 Executar no SQL Editor

1. Acesse: https://app.supabase.com/project/lohzlvkotuawqaxxqjah/sql
2. Cole o script completo
3. **CONFIRA** se a query de identificação (PASSO 1) mostra os 2 admins
4. Se sim, execute o script completo

### 2.3 Verificar Resultado

Após executar, você deve ver:

```
usuarios_restantes: 2
```

E a lista deve mostrar apenas os 2 administradores.

---

## 🔐 PASSO 3: Deletar Usuários da Tabela `auth.users`

**IMPORTANTE**: O SQL Editor **NÃO tem permissão** para deletar da tabela `auth.users` por segurança. Você precisa fazer manualmente no painel.

### 3.1 Acessar Authentication

1. Acesse: https://app.supabase.com/project/lohzlvkotuawqaxxqjah/auth/users
2. Você verá a lista de todos os usuários autenticados

### 3.2 Deletar Usuários (EXCETO os 2 Admins)

**ATENÇÃO**: NÃO delete os usuários com os emails anotados no Passo 1.3!

Para cada usuário que **NÃO é admin**:

1. Clique nos 3 pontinhos `⋮` à direita do usuário
2. Selecione "Delete user"
3. Confirme a deleção

**Repita** até sobrar apenas os 2 administradores.

### 3.3 Verificação Final

Após deletar, você deve ver apenas **2 usuários** na lista:
- ✅ Admin 1 (email anotado)
- ✅ Admin 2 (email anotado)

---

## ✅ PASSO 4: Verificar o Painel Admin

### 4.1 Acessar o Dashboard

1. Acesse: http://localhost:5173/admin (ou URL de produção)
2. Faça login com uma das contas de administrador

### 4.2 Verificar Métricas

Você deve ver:

- **Total de Usuários**: 2
- **Prestadores**: 0 (ou 1-2 se os admins forem prestadores)
- **Empregadores**: 0 (ou 1-2 se os admins forem empregadores)
- **Total de Jobs**: 0
- **Total de Serviços**: 0
- **Total de Pagamentos**: 0

### 4.3 Testar Novo Cadastro

1. Abra uma aba anônima (Ctrl+Shift+N)
2. Acesse: http://localhost:5173/auth?mode=signup
3. Faça um cadastro de teste
4. Volte ao painel admin
5. Verifique se o novo usuário aparece na lista

---

## 📊 Tabelas Afetadas

### Deletadas Automaticamente (CASCADE):
- ✅ `user_roles` (exceto admins)
- ✅ `job_postings`
- ✅ `worker_services`
- ✅ `payments`
- ✅ `ratings`
- ✅ `profile_views`
- ✅ `contact_unlocks`
- ✅ `favorites`
- ✅ `messages`
- ✅ `conversations`
- ✅ `appointments`
- ✅ `destaque_orders`
- ✅ `community_posts`
- ✅ `community_comments`
- ✅ `community_likes`
- ✅ `user_badges`

### Deletadas Manualmente pelo Script:
- ✅ `job_contacts`
- ✅ `push_subscriptions`
- ✅ `audit_log`

### Preservadas (Dados do Sistema):
- ✅ `categories`
- ✅ `subcategories`
- ✅ `cities`
- ✅ `colaboradores_autorizados`
- ✅ `badges`
- ✅ `pre_cadastro`

---

## 🔒 Segurança

### O que é preservado:
- ✅ **2 usuários administradores** (email, senha, perfil completo)
- ✅ **Roles de admin** na tabela `user_roles`
- ✅ **Whitelist** de colaboradores autorizados
- ✅ **Categorias** e **cidades** do sistema

### O que é deletado:
- ❌ Todos os outros usuários
- ❌ Todos os jobs/anúncios
- ❌ Todos os serviços oferecidos
- ❌ Todos os pagamentos
- ❌ Todas as avaliações
- ❌ Todas as visualizações de perfil
- ❌ Todos os contatos desbloqueados
- ❌ Todas as mensagens
- ❌ Todos os posts da comunidade

---

## ⚠️ Troubleshooting

### Erro: "permission denied for table auth.users"
**Causa**: Tentou deletar de `auth.users` via SQL  
**Solução**: Use o painel Authentication (Passo 3)

### Erro: "violates foreign key constraint"
**Causa**: Alguma tabela não tem CASCADE configurado  
**Solução**: Execute o script completo que inclui limpeza manual

### Ainda aparecem usuários no admin após reset
**Causa**: Não deletou de `auth.users`  
**Solução**: Complete o Passo 3

### Admins foram deletados por engano
**Causa**: Não conferiu a query de identificação antes  
**Solução**: Restaurar backup ou recriar admins manualmente

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Supabase: Dashboard → Logs → Postgres Logs
2. Confira se os 2 admins ainda existem em `auth.users`
3. Verifique se as roles de admin ainda existem em `user_roles`

---

**Data do Reset**: _____________  
**Executado por**: _____________  
**Usuários preservados**: 2 administradores
