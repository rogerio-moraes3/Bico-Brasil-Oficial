# Prompt para Supabase AI

```
Preciso criar políticas RLS (Row Level Security) para as tabelas `job_postings` e `worker_services`.

PROBLEMA:
- Atualmente só existe política de SELECT (leitura pública)
- Usuários não conseguem UPDATE ou DELETE em seus próprios registros
- O campo `user_id` em ambas as tabelas referencia `users.id`
- A tabela `users` tem campo `auth_id` que corresponde a `auth.uid()`

CRIAR POLÍTICAS:

Para `job_postings`:
1. Política UPDATE: permitir usuários atualizarem APENAS seus próprios jobs
2. Política DELETE: permitir usuários deletarem APENAS seus próprios jobs  
3. Política INSERT: permitir usuários criarem jobs

Para `worker_services`:
1. Política UPDATE: permitir usuários atualizarem APENAS seus próprios serviços
2. Política DELETE: permitir usuários deletarem APENAS seus próprios serviços
3. Política INSERT: permitir usuários criarem serviços

VALIDAÇÃO:
A política deve verificar se:
```sql
EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = [tabela].user_id 
  AND users.auth_id = auth.uid()
)
```

Gere as políticas RLS completas.
```

---

## 📋 Instruções de Uso

1. Abra o Supabase Dashboard
2. Vá em "SQL Editor" 
3. Clique em "New Query"
4. **Cole o prompt acima** na caixa de prompt da IA do Supabase
5. Clique em "Generate SQL"
6. Revise o SQL gerado
7. Execute (Run)

---

## 🔄 Alternativa: Executar SQL Direto

Se preferir não usar a IA, copie e execute este SQL:

```sql
-- Políticas para job_postings
DROP POLICY IF EXISTS "Users can update own jobs" ON public.job_postings;
CREATE POLICY "Users can update own jobs" 
ON public.job_postings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = job_postings.user_id
  AND users.auth_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete own jobs" ON public.job_postings;
CREATE POLICY "Users can delete own jobs" 
ON public.job_postings FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = job_postings.user_id
  AND users.auth_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert own jobs" ON public.job_postings;
CREATE POLICY "Users can insert own jobs" 
ON public.job_postings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = job_postings.user_id
  AND users.auth_id = auth.uid()
));

-- Políticas para worker_services
DROP POLICY IF EXISTS "Users can update own services" ON public.worker_services;
CREATE POLICY "Users can update own services" 
ON public.worker_services FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = worker_services.user_id
  AND users.auth_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete own services" ON public.worker_services;
CREATE POLICY "Users can delete own services" 
ON public.worker_services FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = worker_services.user_id
  AND users.auth_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert own services" ON public.worker_services;
CREATE POLICY "Users can insert own services" 
ON public.worker_services FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = worker_services.user_id
  AND users.auth_id = auth.uid()
));
```
