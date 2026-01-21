-- ==========================================
-- FIX: Adicionar políticas RLS para UPDATE e DELETE em job_postings
-- ==========================================
-- PROBLEMA: Usuários não conseguem deletar/atualizar seus próprios anúncios
-- SOLUÇÃO: Criar políticas que permitem UPDATE e DELETE apenas do próprio conteúdo

-- 1. Política para permitir usuários atualizarem seus próprios job_postings
DROP POLICY IF EXISTS "Users can update own jobs" ON public.job_postings;
CREATE POLICY "Users can update own jobs" 
ON public.job_postings
FOR UPDATE
USING (
  -- Verificar se o user_id do job corresponde ao ID do usuário logado
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = job_postings.user_id
    AND users.auth_id = auth.uid()
  )
);

-- 2. Política para permitir usuários deletarem seus próprios job_postings
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.job_postings;
CREATE POLICY "Users can delete own jobs" 
ON public.job_postings
FOR DELETE
USING (
  -- Verificar se o user_id do job corresponde ao ID do usuário logado
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = job_postings.user_id
    AND users.auth_id = auth.uid()
  )
);

-- 3. Política para permitir usuários criarem job_postings
DROP POLICY IF EXISTS "Users can insert own jobs" ON public.job_postings;
CREATE POLICY "Users can insert own jobs" 
ON public.job_postings
FOR INSERT
WITH CHECK (
  -- Verificar se o user_id corresponde ao usuário logado
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = job_postings.user_id
    AND users.auth_id = auth.uid()
  )
);

-- 4. Mesmas políticas para worker_services
DROP POLICY IF EXISTS "Users can update own services" ON public.worker_services;
CREATE POLICY "Users can update own services" 
ON public.worker_services
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = worker_services.user_id
    AND users.auth_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete own services" ON public.worker_services;
CREATE POLICY "Users can delete own services" 
ON public.worker_services
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = worker_services.user_id
    AND users.auth_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert own services" ON public.worker_services;
CREATE POLICY "Users can insert own services" 
ON public.worker_services
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = worker_services.user_id
    AND users.auth_id = auth.uid()
  )
);

-- Verificação
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('job_postings', 'worker_services')
ORDER BY tablename, cmd;
