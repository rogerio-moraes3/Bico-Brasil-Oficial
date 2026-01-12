# Checklist de Testes em Produção - Bico Brasil

**URL**: https://bicobrasil.com.br  
**Data**: 2025-12-30  
**Objetivo**: Verificar se o schema master está funcionando corretamente em produção

---

## ✅ Teste 1: Cities Dropdown (CRÍTICO)

**Como testar**:
1. Abra https://bicobrasil.com.br em **modo anônimo** (Ctrl + Shift + N)
2. Clique em "Cadastro" ou vá para `/cadastro`
3. Procure o campo "Cidade"
4. Clique no dropdown de cidades

**Resultado Esperado**:
- ✅ Dropdown abre
- ✅ Mostra 24 cidades (São Paulo, Rio de Janeiro, Presidente Prudente, etc.)
- ✅ Sem erros no console (F12)

**Se FALHAR**:
- Abra F12 → Console
- Procure por erros relacionados a "cities" ou "RLS"
- Me envie o erro exato

---

## ✅ Teste 2: Admin Dashboard

**Como testar**:
1. Faça login com: `23rogeriomoraes@gmail.com`
2. Vá para `/admin`
3. Verifique a tabela de usuários

**Resultado Esperado**:
- ✅ Tabela carrega
- ✅ Mostra 2 usuários
- ✅ Colunas visíveis: Nome, Email, CPF, Cidade, Tipo
- ✅ Linhas são clicáveis

**Se FALHAR**:
- Verifique se aparece "Erro ao buscar usuários"
- Abra F12 → Console e me envie o erro

---

## ✅ Teste 3: Google Login

**Como testar**:
1. Abra em modo anônimo
2. Clique em "Login com Google"
3. Complete o fluxo OAuth

**Resultado Esperado**:
- ✅ Abre popup do Google
- ✅ Após login, redireciona para o app
- ✅ Usuário é criado na tabela `users`
- ✅ Se email for admin, recebe role de admin

**Se FALHAR**:
- Verifique se aparece erro de OAuth
- Me envie a mensagem de erro

---

## ✅ Teste 4: Listagem de Bicos

**Como testar**:
1. Vá para `/procurar-bicos`
2. Verifique se a página carrega

**Resultado Esperado**:
- ✅ Página carrega sem erros
- ✅ Filtros de cidade e categoria aparecem
- ✅ Mensagem "Nenhum bico encontrado" (normal, banco está vazio)

**Se FALHAR**:
- Me envie o erro do console

---

## ✅ Teste 5: Navegação SEM Flash

**Como testar**:
1. Estando em qualquer página
2. Clique no botão "Início" no header
3. Observe a transição

**Resultado Esperado**:
- ✅ Transição instantânea (SPA)
- ✅ **NÃO** aparece splash screen laranja
- ✅ **NÃO** há tela branca

**Se FALHAR**:
- Aparece splash screen → problema de navegação
- Me avise para eu corrigir

---

## ✅ Teste 6: Cadastro Completo

**Como testar**:
1. Modo anônimo
2. Vá para `/cadastro`
3. Preencha todos os campos:
   - Nome
   - Email
   - Senha
   - **CPF** (obrigatório)
   - Cidade (dropdown)
   - Telefone
4. Clique em "Cadastrar"

**Resultado Esperado**:
- ✅ Cadastro completa com sucesso
- ✅ CPF é validado (tente CPF inválido para testar)
- ✅ Usuário é criado no banco
- ✅ Redireciona para completar perfil

**Se FALHAR**:
- Me envie o erro específico

---

## 📊 Resumo dos Testes

Marque com ✅ ou ❌:

- [ ] Teste 1: Cities Dropdown
- [ ] Teste 2: Admin Dashboard
- [ ] Teste 3: Google Login
- [ ] Teste 4: Listagem de Bicos
- [ ] Teste 5: Navegação SEM Flash
- [ ] Teste 6: Cadastro Completo

---

## 🐛 Problemas Encontrados

Liste aqui qualquer problema:

1. 
2. 
3. 

---

## 📝 Notas

- Se **TODOS os testes passarem**: Schema está 100% funcional! ✅
- Se **Cities Dropdown falhar**: Problema de RLS policies
- Se **Admin Dashboard falhar**: Problema no RPC `get_admin_users()`
- Se **Navegação com flash**: Problema no código (window.location)

**Me envie os resultados quando terminar os testes!** 🎯
