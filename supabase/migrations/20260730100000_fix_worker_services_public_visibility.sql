-- worker_services só tinha uma policy de SELECT (dono da linha OU admin),
-- sem nenhuma liberação para o público — isso bloqueava a primeira etapa da
-- busca (SearchWorkers.tsx encontra os serviços ativos antes de buscar os
-- dados do trabalhador) para qualquer usuário comum, mesmo depois da
-- correção anterior em users_public. Nenhuma coluna sensível nesta tabela
-- (só descrição/preço/categoria do serviço, já mostrados na busca).

CREATE POLICY "worker_services_select_active_public"
ON public.worker_services
FOR SELECT
USING (active = true);
