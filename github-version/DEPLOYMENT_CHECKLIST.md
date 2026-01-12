# Deployment Checklist - Bico Brasil

## Pré-Deploy: Verificações Locais

### 1. Verificar Branch Git
```bash
# Verificar branch atual
git branch

# Deve estar em 'main' (branch que Vercel monitora)
# Se não estiver, trocar para main:
git checkout main
```

### 2. Verificar Configuração do Remote
```bash
git remote -v

# Deve mostrar o repositório correto
# origin  https://github.com/SEU_USUARIO/SEU_REPO.git (fetch)
# origin  https://github.com/SEU_USUARIO/SEU_REPO.git (push)
```

### 3. Build Local (Verificar Erros)
```bash
# Instalar dependências (se necessário)
npm install

# Build de produção
npm run build

# Se houver erros, corrija antes de fazer deploy
```

### 4. Verificar TypeScript
```bash
# Verificar erros de tipo
npx tsc --noEmit

# Deve retornar sem erros
```

---

## Deploy: Push para Produção

### 5. Commit e Push
```bash
# Adicionar arquivos modificados
git add .

# Commit com mensagem descritiva
git commit -m "fix: corrigir RLS policies e refatorar UI para alta densidade"

# Push para main (Vercel vai detectar automaticamente)
git push origin main
```

---

## Pós-Deploy: Verificações em Produção

### 6. Verificar Logs da Vercel

1. Acessar: https://vercel.com/dashboard
2. Selecionar projeto "Bico Brasil"
3. Clicar na última deployment
4. Verificar:
   - ✅ Status: "Ready" (verde)
   - ✅ Build Logs: sem erros
   - ✅ Tempo de build: ~2-3 minutos

**Se houver erro:**
- Clicar em "View Function Logs"
- Procurar por mensagens de erro em vermelho
- Copiar erro e corrigir no código local

### 7. Verificar Variáveis de Ambiente na Vercel

1. Ir em: Settings → Environment Variables
2. Verificar se existem:
   - `VITE_SUPABASE_URL` = `https://pyelmqmhraczgptagvve.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (sua chave anon)

**Se não existirem:**
- Adicionar manualmente
- Fazer redeploy: Deployments → ... → Redeploy

### 8. Testar Site em Produção

#### 8.1 Teste de Banco de Dados (Cidades)
1. Abrir site em **modo anônimo/incógnito**
2. Ir para página de cadastro ou "Procurar Bicos"
3. Verificar se o dropdown de cidades carrega
4. ✅ **SUCESSO**: Cidades aparecem
5. ❌ **FALHA**: Executar `FIX_RLS_POLICIES.sql` no Supabase

#### 8.2 Teste de UI (Alta Densidade)
1. Abrir site em produção
2. Verificar:
   - ✅ Fontes menores e mais profissionais
   - ✅ Cards mais compactos
   - ✅ Headings menores
   - ✅ Sem emojis visíveis
3. Comparar com versão anterior (screenshot)

#### 8.3 Teste de Funcionalidades Críticas
- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Listagem de bicos funciona
- [ ] Admin dashboard carrega (se admin)
- [ ] Navegação entre páginas sem flash

---

## Troubleshooting: Problemas Comuns

### Problema 1: Site não atualiza após push
**Causa**: Vercel não detectou mudanças ou build falhou

**Solução**:
1. Ir em Vercel Dashboard → Deployments
2. Verificar se há novo deployment "Building" ou "Ready"
3. Se não houver, fazer redeploy manual:
   - Deployments → ... → Redeploy
4. Aguardar 2-3 minutos

### Problema 2: Cidades não aparecem
**Causa**: RLS policies não foram aplicadas

**Solução**:
1. Abrir Supabase Dashboard
2. Ir em SQL Editor
3. Colar e executar `FIX_RLS_POLICIES.sql`
4. Verificar resultado das queries de verificação
5. Testar novamente em produção

### Problema 3: Erro 500 ou página em branco
**Causa**: Erro de build ou variáveis de ambiente faltando

**Solução**:
1. Verificar logs da Vercel (Function Logs)
2. Verificar variáveis de ambiente
3. Verificar se build local funciona (`npm run build`)
4. Corrigir erros e fazer novo push

### Problema 4: UI não mudou
**Causa**: Cache do navegador ou CDN

**Solução**:
1. Limpar cache do navegador (Ctrl + Shift + Delete)
2. Abrir em modo anônimo
3. Forçar reload (Ctrl + F5)
4. Verificar timestamp do deployment na Vercel

---

## Checklist Final

Antes de considerar deploy concluído:

- [ ] Build local sem erros
- [ ] Push para `main` realizado
- [ ] Deployment na Vercel com status "Ready"
- [ ] Logs da Vercel sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Cidades carregam sem autenticação
- [ ] UI com alta densidade (fontes menores, cards compactos)
- [ ] Funcionalidades críticas testadas
- [ ] Sem erros no console do navegador (F12)

---

## Comandos Rápidos

```bash
# Verificar status
git status

# Build e testar local
npm run build && npm run preview

# Deploy completo
git add . && git commit -m "fix: correções de produção" && git push origin main

# Verificar logs em tempo real (se tiver Vercel CLI)
vercel logs
```

---

## Contatos de Emergência

- **Supabase Dashboard**: https://app.supabase.com/project/pyelmqmhraczgptagvve
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Repositório Git**: (adicionar URL do seu repo)

---

**Última atualização**: 2025-12-30
