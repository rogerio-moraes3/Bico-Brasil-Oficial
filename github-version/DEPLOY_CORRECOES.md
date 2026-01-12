# 🚀 Guia Rápido de Deploy - Correções Supabase

## ⚡ Deploy em 3 Passos

### Passo 1: Aplicar Migração no Supabase

**Opção A - Via Dashboard (Recomendado para iniciantes)**:
1. Acesse: https://app.supabase.com/project/[seu-projeto]/sql
2. Abra o arquivo: `supabase/migrations/20251226162506_fix_user_registration.sql`
3. Copie TODO o conteúdo
4. Cole no editor SQL do Supabase
5. Clique em "Run"

**Opção B - Via CLI (Recomendado para produção)**:
```bash
# No terminal, dentro da pasta do projeto
npx supabase db push
```

---

### Passo 2: Verificar Deploy

No Dashboard do Supabase, verifique:

1. **Table Editor** → `users`:
   - ✅ Coluna `city_id` existe
   - ✅ Tipo: `uuid` com foreign key para `cities`

2. **Database** → **Policies** → `users`:
   - ✅ `Users can insert their own profile during signup` (INSERT)
   - ✅ `Users can view own full profile` (SELECT)
   - ✅ `Authenticated can view basic worker info for search` (SELECT)
   - ✅ `Anon can view active worker profiles` (SELECT)

3. **Database** → **Functions**:
   - ✅ `handle_new_user()` existe e foi atualizada

---

### Passo 3: Testar Cadastro

1. **Abra o site em modo anônimo** (Ctrl+Shift+N no Chrome)
2. Acesse: `http://localhost:5173/auth?mode=signup` (ou URL de produção)
3. Preencha o formulário:
   - Nome completo
   - CPF válido
   - Email
   - Senha
   - WhatsApp
   - Cidade (selecione da lista)
   - Bairro
   - Tipo de usuário
4. Clique em "Cadastrar"

**Resultado Esperado**:
- ✅ Mensagem: "Cadastro realizado! Bem-vindo ao Bico Brasil"
- ✅ Redirecionamento para `/app`
- ✅ No Supabase → Table Editor → `users`: novo registro aparece

---

## 🔍 Checklist de Validação

Após o cadastro, verifique no Supabase:

- [ ] Registro criado em `users` com `auth_id` preenchido
- [ ] Campo `city_id` contém UUID válido (não NULL)
- [ ] Campo `email` preenchido corretamente
- [ ] Campo `name` preenchido corretamente
- [ ] Campo `type` = 'contractor' ou 'worker'
- [ ] Registro criado em `user_roles` com `role` = 'user'

---

## ⚠️ Troubleshooting

### Erro: "column city_id does not exist"
**Causa**: Migração não foi aplicada  
**Solução**: Execute o Passo 1 novamente

### Erro: "new row violates row-level security policy"
**Causa**: Políticas RLS antigas ainda ativas  
**Solução**: No SQL Editor, execute:
```sql
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
```
Depois reaplique a migração.

### Cadastro não salva mas não dá erro
**Causa**: Trigger não está executando  
**Solução**: Verifique se o trigger existe:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

---

## 📞 Suporte

Se encontrar problemas:
1. Abra o Console do navegador (F12)
2. Vá em "Console" e procure por erros em vermelho
3. Copie a mensagem de erro completa
4. Verifique os logs do Supabase em: Dashboard → Logs → Postgres Logs
