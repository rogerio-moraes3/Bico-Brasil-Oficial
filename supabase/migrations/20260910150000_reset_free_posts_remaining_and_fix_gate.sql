-- A trava de "10 publicacoes gratis" pra contratantes nunca funcionou:
-- PostJob.tsx/offlineHandlers.ts/FreePostsBadge.tsx checavam
-- user_role === 'empregador', mas essa coluna tem DEFAULT 'prestador' e
-- nunca foi escrita por nenhum codigo (nem o trigger de signup) — ou seja,
-- toda conta (worker ou contractor) sempre teve user_role='prestador'. A
-- condicao nunca era verdadeira, entao a trava (e o decremento) nunca
-- disparavam. Confirmado ao vivo: as 215 contas do banco estao todas com
-- free_posts_remaining=3 (o default da coluna), nunca decrementado.
--
-- A correcao no app troca a checagem pra type === 'contractor' (o campo
-- que de fato diferencia prestador/contratante). Esta migration so reresenta
-- o contador pra 10 (valor que ja aparece no texto "suas 10 publicacoes
-- gratis" exibido pro usuario) pra todo mundo, estabelecendo uma cota nova
-- e cheia a partir de agora.
--
-- Por que isso nao bloqueia ninguem retroativamente: free_posts_remaining
-- e um contador independente, nunca derivado de COUNT(job_postings) — ele
-- nunca refletiu quantas vagas cada contratante ja publicou. Resetar pra 10
-- + a correcao do gate faz o decremento (que ja existia, so nunca era
-- executado) passar a contar so publicacoes NOVAS a partir de agora, sem
-- nenhuma relacao com o historico.
UPDATE public.users SET free_posts_remaining = 10;

COMMENT ON COLUMN public.users.free_posts_remaining IS
  'Publicacoes gratis restantes pra contratantes (type=contractor). Cota de 10, decrementada a cada job_postings novo. Resetada pra 10 em 2026-09-10 ao corrigir o gate que nunca funcionou (comparava com user_role, sempre "prestador").';
