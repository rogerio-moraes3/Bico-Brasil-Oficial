# UI Refresh XP Style

## Checklist de mudanças
- [x] Tokens XP premium definidos (light/dark) e shadcn tokens mapeados
- [x] Button/Card/Input/Select unificados como fonte de verdade
- [x] Header e BottomNav com glass/blur e consistência visual
- [x] Cards com radius 16–24px, borda suave e sombras discretas
- [x] Loading/Empty/Error states padronizados com componentes reutilizáveis
- [x] White flash eliminado via bootstrap crítico (theme-color + background inicial)
- [x] Screenshot de referência do layout atualizado

## Paleta final (tokens XP)
### Light
- --xp-primary: 212 88% 45% (#0D6CD7)
- --xp-primary-hover: 212 88% 40%
- --xp-primary-pressed: 212 88% 34%
- --xp-primary-foreground: 0 0% 100%
- --xp-primary-glow: 212 88% 45% / 0.28
- --xp-background: 216 33% 97%
- --xp-surface: 0 0% 100%
- --xp-surface-muted: 220 23% 94%
- --xp-border: 220 16% 86%
- --xp-ring: 212 88% 45%
- --xp-foreground: 222 35% 12%
- --xp-foreground-muted: 222 15% 38%

### Dark
- --xp-primary: 212 92% 58% (#318DF6)
- --xp-primary-hover: 212 92% 64%
- --xp-primary-pressed: 212 92% 52%
- --xp-primary-foreground: 222 47% 11%
- --xp-primary-glow: 212 92% 58% / 0.35
- --xp-background: 222 45% 10% (#0E1424)
- --xp-surface: 222 38% 14%
- --xp-surface-muted: 222 30% 18%
- --xp-border: 222 20% 26%
- --xp-ring: 212 92% 58%
- --xp-foreground: 210 40% 96%
- --xp-foreground-muted: 215 20% 70%

## Tokens shadcn mapeados
- --background → --xp-background
- --foreground → --xp-foreground
- --card → --xp-surface
- --card-foreground → --xp-foreground
- --popover → --xp-surface
- --popover-foreground → --xp-foreground
- --primary → --xp-primary
- --primary-foreground → --xp-primary-foreground
- --secondary → --xp-surface-muted
- --secondary-foreground → --xp-foreground
- --muted → --xp-surface-muted
- --muted-foreground → --xp-foreground-muted
- --accent → --xp-primary
- --accent-foreground → --xp-primary-foreground
- --border → --xp-border
- --input → --xp-surface
- --ring → --xp-ring

## Padrões de componentes
### Button
- Fonte única: `src/components/ui/button.tsx`
- Radius 12–16px, shadow suave, estados hover/active

### Card
- Fonte única: `src/components/ui/card.tsx`
- Radius 16–24px, borda 1px, shadow discreta

### Input / Select
- Fonte única: `src/components/ui/input.tsx` e `src/components/ui/select.tsx`
- Altura ≥ 44px, radius 16px, foco com ring visível

### Header / BottomNav
- Header com glass/blur, botões circulares (≥ 44px)
- BottomNav com estado ativo claro e espaçamento consistente

### ListGroup / Chips
- ListGroup: cards grandes com divisores suaves
- Chips: badge/secondary com fundo suave e texto de contraste AA

## Padrões aplicados (descrição rápida)
- Hierarquia tipográfica clara com títulos fortes e subtítulos suaves
- Cards compactos com bordas leves e sombra elegante
- Navegação com foco em hit area e contraste de estados
- Estados de loading/empty com skeleton e EmptyState reutilizável

## Commits por bloco
- B: `feat(ui): unify button/card/input/select (xp style)`
- C: `feat(ui): xp-style header/nav/cards/spacing`
- D: `feat(ui): standardize loading/empty/error states`
- E: `fix(pwa): eliminate white flash with critical theme bootstrap`

## Screenshot
- https://github.com/user-attachments/assets/5e47b118-0c7d-4c58-83de-67c4d5abbc24
