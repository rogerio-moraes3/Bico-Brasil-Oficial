# Supabase CLI no Windows (PowerShell) — Diagnóstico, Instalação e Deploy

## 1) Diagnóstico rápido (CLI instalada ou só PATH?)

```powershell
where.exe supabase
supabase --version
```

Se os comandos acima falharem, teste com npx:

```powershell
npx supabase --version
```

Se **npx funciona** e `supabase` não, é problema de **PATH**.

## 2) Instalar o Supabase CLI no Windows

### Opção A (preferida): npm global

```powershell
npm i -g supabase
```

**Se der erro de permissão (EACCES):**

1) Abra o **PowerShell como Administrador** e rode novamente:

```powershell
npm i -g supabase
```

2) Ou configure prefix do npm (sem admin):

```powershell
npm config set prefix "$env:USERPROFILE\\npm-global"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\\npm-global", "User")
```

Depois feche e reabra o terminal.

### Opção B (winget se existir) ou oficial equivalente

```powershell
winget search supabase
```

Se existir pacote, instale:

```powershell
winget install Supabase.CLI
```

Se **não** existir no winget, use o método oficial via **Scoop**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
scoop install supabase
```

## 3) Confirmar que funcionou

1) **Feche e reabra o terminal do VS Code**
2) Rode:

```powershell
supabase --version
```

Com npx (equivalente):

```powershell
npx supabase --version
```

## 4) Autenticar

```powershell
supabase login
```

Com npx:

```powershell
npx supabase login
```

**Como confirmar login OK:**

```powershell
supabase projects list
```

Com npx:

```powershell
npx supabase projects list
```

## 5) Deploy SOMENTE das 2 Edge Functions (project-ref fixo)

```powershell
supabase functions deploy create-destaque-payment --project-ref pyelmqmhraczgptagvve
supabase functions deploy mercadopago-webhook --project-ref pyelmqmhraczgptagvve
```

Com npx:

```powershell
npx supabase functions deploy create-destaque-payment --project-ref pyelmqmhraczgptagvve
npx supabase functions deploy mercadopago-webhook --project-ref pyelmqmhraczgptagvve
```

## 6) Pós-deploy: SQLs de verificação (cole no SQL Editor)

### 6.1) Últimos destaque_orders (payment_id, mercadopago_payment_id, status, paid_at)

```sql
select
  payment_id,
  mercadopago_payment_id,
  status,
  paid_at
from public.destaque_orders
order by created_at desc
limit 20;
```

### 6.2) Últimos ads_highlight (starts_at, ends_at, price)

```sql
select
  starts_at,
  ends_at,
  price
from public.ads_highlight
order by starts_at desc
limit 20;
```

### 6.3) Join destaque_orders x ads_highlight por user_id

```sql
select
  d.user_id,
  d.status,
  d.paid_at,
  a.starts_at,
  a.ends_at,
  a.price
from public.destaque_orders d
left join public.ads_highlight a
  on a.user_id = d.user_id
order by d.created_at desc
limit 20;
```
