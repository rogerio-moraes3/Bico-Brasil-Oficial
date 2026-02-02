# UI/UX Refresh - Bico Brasil PWA

## Objetivo
Lapidação completa da interface: eliminar inconsistências, redundâncias, excesso de cores, desalinhamentos. Interface sóbria, consistente, "adulto", com padrão visual único.

## ⚠️ REGRAS ABSOLUTAS

### O que NÃO foi alterado:
✅ Lógica, fluxos, rotas, APIs, Supabase, Auth, Pagamentos, Edge Functions

### O que FOI alterado:
✅ CSS/Tailwind, layout, tipografia, espaçamento, componentes visuais

---

## Etapa 1: Cleanup Visual (COMPLETO ✅)

### Paleta Consolidada
- Apenas 2 azuis + neutros
- Removido verde/laranja/amarelo

**Arquivos:**
- `tailwind.config.ts`, `ShareButtons.tsx`, `WhatsAppContactButton.tsx`
- `UnlockWithCredits.tsx`, `FreePostsBadge.tsx`, `CTASection.tsx`
- `UpgradeModal.tsx`, `PlanCheckoutModal.tsx`, `ModeStats.tsx`
- `FeaturedServicesSection.tsx`, `FavoritesTab.tsx`, `Header.tsx`

### Redundâncias Removidas
- "Instalar App" movido para menu (desktop dropdown + mobile sheet)
- Removido "Baixar App" da navegação desktop

---

## Etapa 2: Lapidação UX (COMPLETO ✅)

### SplashScreen Otimizada
- Tempo: 1.8s → 1.5s
- Logo e texto menores
- Transição suave

### ServiceWorkerUpdatePrompt
- Tamanho reduzido
- Respeita safe-area
- Mais discreto

### Scroll em Modais
✅ Verificado - já funciona corretamente

---

## Padrões Finais

### Paleta (XP-inspired)
```css
--xp-primary: 212 88% 45%;
--xp-background: 216 33% 97%;
```

### Botões (3 tamanhos)
- default: h-11 (44px min)
- sm: h-10 (44px min)
- lg: h-12 (48px min)
- icon: 11x11 (44px min)

### Tipografia
- H1: 2.2rem → 1.5rem (mobile)
- H2: 1.8rem → 1.25rem (mobile)
- H3: 1.4rem → 1.125rem (mobile)

---

## Build
✅ `npm run build` passa (~14s)
✅ Bundle: ~1MB (gzipped: ~295KB)

---

Última atualização: 2026-02-01
