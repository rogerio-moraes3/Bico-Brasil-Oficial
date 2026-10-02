# Incidentes — Bico Brasil

Registro de incidentes reais de produção. Cada entrada documenta o que aconteceu,
o timeline exato (reconstruído via `auth.audit_log_entries`, a única fonte que
sobrevive à exclusão das linhas em si), a causa raiz, a correção, e o que ficou
sem solução.

---

## 2026-09-14/15 — Exclusão automática de 194 contas reais de cadastro incompleto

**Severidade:** Crítica (perda de dados real e irreversível, sem possibilidade
de recuperação via backup).

**Resumo:** um job agendado (`delete-incomplete-signup-accounts`) apagou
permanentemente 194 contas reais de pessoas que haviam se cadastrado mas não
tinham completado CPF e/ou verificação de telefone, 3 dias depois de um aviso
por e-mail. A feature existia, mas o critério de "incompleto" era pré-lançamento
(só CPF + telefone), e o rollout do aviso contra todo o backlog de contas
antigas de uma vez fez ~90% das exclusões acontecerem em duas janelas de
segundos, sem qualquer sinal de alerta até um usuário perceber.

### Timeline exato (UTC)

| Quando | O quê |
|---|---|
| 2026-09-10 11:50 (-03:00) | Commit `c0989bb`: feature "aviso + exclusão completa de contas com cadastro incompleto" entra no código — coluna `incomplete_signup_notice_sent_at`, function `notify-incomplete-signup`, function `delete-incomplete-account`, cron `delete-incomplete-signup-accounts` agendado para rodar diariamente às 04:00 UTC. |
| 2026-09-10 14:48–20:29 UTC | 11 exclusões — **não fazem parte do incidente**: são todas contas de teste do próprio desenvolvedor (`23rogeriomoraes+*@gmail.com`, testando features como o bug de free posts e o carrossel do hero), apagadas manualmente no mesmo dia. |
| 2026-09-10/11 (horário exato não registrado) | Rollout manual: `notify-incomplete-signup` foi chamado à mão contra o backlog inteiro de contas pré-existentes que já estavam com CPF/telefone pendente — todas recebendo o e-mail de aviso "sua conta será excluída em 3 dias" dentro da mesma janela curta. |
| 2026-09-11 04:24:54–56 UTC | **2 contas reais** apagadas — primeira execução do cron a encontrar alguém já a 3+ dias do aviso (`***@gmail.com` — ver CSV enviado). |
| 2026-09-14 04:00:10–18 UTC (8 segundos) | **166 contas reais** apagadas de uma vez — o grosso do backlog notificado em 09-10/11 cruzando a marca de 3 dias. |
| 2026-09-15 04:00:08–09 UTC (1 segundo) | **26 contas reais** apagadas — cauda do mesmo backlog. |
| 2026-09-16 (durante a sessão que investigou o relato do usuário) | Cron pausado manualmente (`SELECT cron.unschedule('delete-incomplete-signup-accounts')`) assim que o padrão foi identificado. Nenhuma exclusão ocorreu em 09-16 — o backlog já estava exaurido (nada mais tinha sido notificado desde 09-11) e o pause veio antes de qualquer nova leva. |
| 2026-09-28 09:47 (-03:00) | Commit `e3dadef`: mecanismo de exclusão substituído de vez por um **gate de funcionalidade** (sem prazo, sem exclusão automática — ver `supabase/migrations/20260916120000_feature_gate_incomplete_profiles.sql`). `notify-incomplete-signup` virou lembrete recorrente sem menção a exclusão; novo cron (`remind-incomplete-signup-accounts`) só envia esse lembrete, nunca apaga. |

**Total de contas reais destruídas pelo mecanismo automático: 194** (2 + 166 + 26).
Não 192 (estimativa inicial) — a diferença são as 2 contas de 09-11, que na
primeira investigação (16/09) não tinham sido isoladas do lote de 09-10.

### Causa raiz

Duas falhas concorrentes, nenhuma maliciosa:
1. **Critério de completude pré-lançamento** — exigia só CPF e telefone
   confirmado, ignorando que verificação de telefone por SMS tem fricção real
   (número errado, SMS atrasado) especialmente numa base pré-lançamento.
2. **Rollout em massa contra um relógio de 3 dias** — notificar todo o backlog
   histórico de uma vez, com um prazo fixo de exclusão, garantiu que a maioria
   das exclusões caísse nas mesmas duas janelas de poucos segundos — o oposto
   de um mecanismo que erra devagar e dá chance de perceber antes de causar
   dano em escala.

### Recuperação — investigada e descartada

- **PITR (point-in-time recovery):** confirmado via `supabase backups list`
  — `pitr_enabled: false` neste projeto. Não é uma opção.
- **Backups físicos diários:** confirmado via a mesma chamada — retenção
  rolante de ~8 dias; o backup mais antigo disponível é de 2026-09-21, **depois**
  do incidente (09-14/15). Não há backup que cubra a janela necessária.
- **Reconstrução manual:** `auth.audit_log_entries` preserva `user_id` e
  `email` de cada exclusão (usado para montar a lista abaixo), mas não CPF,
  endereço, telefone, nome ou qualquer outro dado de `public.users` — essas
  linhas foram apagadas de verdade, sem cópia em lugar nenhum acessível.

**Conclusão: recuperação técnica dos dados originais não é possível.** A única
ação viável é contato — usando os e-mails preservados no audit log — convidando
essas pessoas a se cadastrarem de novo (o e-mail foi liberado para reuso pela
própria exclusão).

### Lista das 194 contas afetadas

Entregue como CSV (`email`, `data_cadastro_original`, `data_exclusão`) — não
incluída neste arquivo por conter dados pessoais. Ver anexo enviado junto com
este documento.

### Decisão pendente (do usuário)

Notificar as 194 pessoas convidando a se cadastrarem de novo, ou deixar como
está. Nenhuma ação de contato foi tomada — só a investigação e a lista foram
preparadas.

### Correção definitiva

Ver commits `e3dadef` (substitui exclusão por gate de funcionalidade, sem
prazo) e `3375bbd`/`88436b2`/`8129d6b` (correções de segurança e do bug de
verificação de telefone relacionadas, mesma sessão).

---

## Cron jobs ativos — referência operacional

Auditados em 2026-09-28 depois do incidente acima (o cron problemático era
justamente um destes três, antes de ser trocado por um mecanismo sem
exclusão). Todos rodam via `pg_cron`; consultar/alterar direto no Postgres
(SQL Editor do Supabase ou `supabase db query --linked`).

**Ver todos:** `SELECT jobid, jobname, schedule, active, command FROM cron.job;`

**Pausar qualquer um imediatamente** (não apaga o job, só para de rodar —
reversível com `cron.schedule` de novo usando o mesmo nome):
```sql
SELECT cron.unschedule('<jobname>');
```

| Job | Frequência | O que faz | Seleção | Audit log |
|---|---|---|---|---|
| `expire-premium-plans` | diário, 03:00 UTC | Desativa `plan_active` de assinaturas Premium vencidas | `plan_active=true AND subscription_end IS NOT NULL AND subscription_end < now()` — testada isoladamente, precisa | Sim (`plan_expired_by_cron`, desde 28/09) |
| `expire-old-pix-payments` | a cada 5 min | Marca PIX pendente há mais de 15min como `failed` | `status='pending' AND created_at < now() - interval '15 minutes'` — testada isoladamente, precisa | Sim (`pix_payment_expired_by_cron`, desde 28/09) |
| `remind-incomplete-signup-accounts` | diário, 13:00 UTC | Envia lembrete (nunca exclui) pra quem tem cadastro incompleto, no máximo 1x a cada 7 dias por conta | `NOT is_profile_complete(u) AND (nunca avisado OU avisado há 7+ dias)` | Indireto — grava `incomplete_signup_notice_sent_at`, não insere linha em `audit_log` (não é ação destrutiva, só um e-mail) |

Nenhum dos três apaga linha nenhuma. Se um novo cron destrutivo for criado no
futuro, seguir o padrão usado aqui: `WITH x AS (UPDATE ... RETURNING ...)
INSERT INTO audit_log SELECT ... FROM x` — atômico, loga exatamente o que foi
alterado, nunca loga algo que não aconteceu de verdade.

---

## Limpeza de edge functions órfãs — 2026-10-02

Três edge functions estavam `ACTIVE` em produção (`pyelmqmhraczgptagvve`) sem
nunca terem existido no git e sem nenhuma chamada no projeto:

| Função | Última versão | Criada em |
|---|---|---|
| `search-workers` | 16 | 2026-01-20 |
| `nearby-workers` | 15 | 2026-01-20 |
| `get-worker` | 15 | 2026-01-20 |

**Verificação antes de apagar:** grep em todo o repositório (exceto
`node_modules`/`dist`) por `functions.invoke('<nome>')` e `functions/v1/<nome>`
— zero ocorrências. As ocorrências de `search-workers` no código são todas da
rota do frontend `/search-workers` (`src/App.tsx`, `BottomNav`, `SalesHeroSection`
etc.), que não tem relação com a edge function de mesmo nome. Nenhuma das três
tinha pasta em `supabase/functions/`.

**Ação:** apagadas com `supabase functions delete <nome> --project-ref
pyelmqmhraczgptagvve`, sob autorização explícita do dono do projeto. Exclusão
irreversível — não havia código-fonte versionado para restaurar. Depois da
limpeza o projeto tem 18 edge functions, batendo exatamente com as 18 pastas
em `supabase/functions/`.

A quarta função órfã identificada na mesma auditoria (`sync_user_profile`) já
tinha sido removida em sessão anterior.
