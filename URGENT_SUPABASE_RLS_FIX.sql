🚨 **PROMPT CRÍTICO PARA SUPABASE**

Copie e cole EXATAMENTE este SQL no assistente AI do Supabase:

```sql
-- AÇÃO CRÍTICA: Corrigir RLS policies para produção funcionar

-- 1. CITIES: Leitura pública (CRÍTICO)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.cities;
DROP POLICY IF EXISTS "Public read cities" ON public.cities;
CREATE POLICY "Enable read access for all users" ON public.cities FOR SELECT USING (true);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- 2. CATEGORIES: Leitura pública
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. SUBCATEGORIES: Leitura pública
DROP POLICY IF EXISTS "Public read subcategories" ON public.subcategories;
CREATE POLICY "Public read subcategories" ON public.subcategories FOR SELECT USING (true);
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- 4. USERS: Leitura pública + próprio perfil editável
DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_id);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. JOB_POSTINGS: Leitura pública
DROP POLICY IF EXISTS "Public read jobs" ON public.job_postings;
CREATE POLICY "Public read jobs" ON public.job_postings FOR SELECT USING (true);
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- 6. WORKER_SERVICES: Leitura pública
DROP POLICY IF EXISTS "Public read services" ON public.worker_services;
CREATE POLICY "Public read services" ON public.worker_services FOR SELECT USING (true);
ALTER TABLE public.worker_services ENABLE ROW LEVEL SECURITY;

-- VERIFICAÇÃO
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename IN ('cities', 'categories', 'subcategories', 'users', 'job_postings', 'worker_services')
ORDER BY tablename, policyname;

-- CONFIRMAR DADOS
SELECT 'cities' as table, COUNT(*) FROM cities
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'users', COUNT(*) FROM users;
```

---

**APÓS EXECUTAR, ME ENVIE A CONFIRMAÇÃO!**
