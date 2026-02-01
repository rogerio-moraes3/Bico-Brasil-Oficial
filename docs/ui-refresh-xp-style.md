# UI Refresh XP Style

## Checklist de mudanças (Atualização 2026-02-01)

### Etapa 1 - Cleanup Visual ✅
- [x] Tokens XP premium definidos (light/dark) e shadcn tokens mapeados
- [x] Button/Card/Input/Select unificados como fonte de verdade
- [x] Header: removido botão "Instalar App" fixo (desktop e mobile)
- [x] Header: botão "Instalar App" movido para dentro do menu hamburger
- [x] Menu mobile: redesenhado com ListGroup style profissional
  - Avatar + nome + email truncado no header
  - Items com ícone + label + chevron
  - Separadores discretos
  - Sem bordas incoerentes
- [x] Header Desktop: removida opção redundante "Publicar Trabalho" do dropdown
- [x] Footer: removida seção "Atendimento" completa
- [x] Footer: redes sociais em 2 colunas no mobile (grid-cols-2)
- [x] Footer: adicionado email de contato (contato.bicobrasil@gmail.com) na seção Ajuda
- [x] Footer: removido build number da UI pública
- [x] Notificação "Atualização disponível": redesenhada
  - Menor e discreta
  - Posicionada no topo (top-20)
  - Botão X para fechar
  - Animação slide-down
- [x] Splash Screen: ajustada tipografia e espaçamento
  - Logo médio (w-48 h-48, md:w-64 h-64)
  - Título proporcional (text-3xl md:text-4xl)
  - Slogan menor (text-lg md:text-xl)
  - Gap consistente (gap-6)
- [x] Cards com radius 16–24px, borda suave e sombras discretas
- [x] Loading/Empty/Error states padronizados com componentes reutilizáveis
- [x] White flash eliminado via bootstrap crítico (theme-color + background inicial)

### Etapa 2 - Lapidação Profissional + Bugs UX ✅
- [x] Scroll travado: corrigido em modais e páginas
  - Dialog: adicionado `max-h-[90vh] overflow-y-auto`
  - Sheet: adicionado `overflow-y-auto` no sheetVariants
  - Premium page: removido `max-h-[calc(100vh-150px)]` que travava scroll
- [x] Splash/boot: melhorado timing e consistência
  - Reduzido de 2s para 1.8s
  - Background determinístico (#0E1424)
- [x] CSS: adicionada animação slideDown para notificações
- [x] Menu mobile: profissionalizado com ícones e chevrons
- [x] Footer: estrutura limpa e enxuta

### Próximos passos (se necessário)
- [ ] Validar paleta de cores: garantir apenas 2 azuis + neutros em todo app
- [ ] Refinar tipografia: verificar hierarquia em todas as páginas
- [ ] Remover cores extras: verificar uso de verde/dourado/laranja desnecessários

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
- 3 tamanhos: primary/secondary/icon
- Hit area mínima: 44px

### Card
- Fonte única: `src/components/ui/card.tsx`
- Radius 16–24px, borda 1px, shadow discreta
- Sem cards esticados

### Input / Select
- Fonte única: `src/components/ui/input.tsx` e `src/components/ui/select.tsx`
- Altura ≥ 44px, radius 16px, foco com ring visível

### Header / BottomNav
- Header com glass/blur, botões circulares (≥ 44px)
- BottomNav com estado ativo claro e espaçamento consistente
- Sem botões fixos redundantes no header

### Menu Mobile (Sheet)
- Header com avatar + nome + email truncado
- ListGroup style: ícone + label + chevron
- Separadores discretos (Separator component)
- Sem bordas incoerentes
- Overflow-y-auto para scroll natural

### Dialog / Modals
- Max-height: 90vh com overflow-y-auto
- Scroll natural em conteúdo longo
- Botão X no topo direito

### Footer
- 3 colunas (Ajuda, Redes Sociais, Legal)
- Redes sociais em 2 colunas no mobile (grid-cols-2)
- Sem seção "Atendimento"
- Email de contato na seção Ajuda
- Sem build number na UI pública

### Notificações
- ServiceWorkerUpdatePrompt: pequena, discreta, no topo
- Animação slideDown
- Botão X para fechar
- Não atrapalha navegação

### ListGroup / Chips
- ListGroup: cards grandes com divisores suaves
- Chips: badge/secondary com fundo suave e texto de contraste AA

## Padrões aplicados (descrição rápida)
- Hierarquia tipográfica clara com títulos fortes e subtítulos suaves
- Cards compactos com bordas leves e sombra elegante
- Navegação com foco em hit area e contraste de estados
- Estados de loading/empty com skeleton e EmptyState reutilizável
- Scroll natural em todas as páginas e modais
- Menu mobile profissional estilo ListGroup
- Footer enxuto e limpo

## Mudanças técnicas
### CSS (index.css)
- Adicionada animação `slideDown` para notificações top
- Mantida estrutura XP tokens (light/dark)

### Componentes atualizados
- `Header.tsx`: removido PWAInstallButton do topo, adicionado ao menu mobile
- `Footer.tsx`: removida seção Atendimento, adicionado email na Ajuda, removido build number, redes em 2 colunas mobile
- `ServiceWorkerUpdatePrompt.tsx`: redesenhado menor e no topo com botão X
- `SplashScreen.tsx`: ajustada tipografia e espaçamento
- `ui/dialog.tsx`: adicionado `max-h-[90vh] overflow-y-auto` no DialogContent
- `ui/sheet.tsx`: adicionado `overflow-y-auto` no sheetVariants
- `pages/Premium.tsx`: removido `max-h-[calc(100vh-150px)]` para liberar scroll

## Commits por bloco
- Etapa 1: `refactor(ui): etapa 1 – cleanup visual e redução de redundâncias`
- Etapa 2: `refactor(ui): etapa 2 – lapidação UX + scroll + splash determinístico`

## Notas importantes
- ✅ ZERO alterações de lógica, fluxos, rotas, handlers, APIs, banco, Auth ou Pagamentos
- ✅ Apenas mudanças visuais: CSS, layout, tipografia, componentes visuais
- ✅ Build passando sem erros
- ✅ Scroll funcionando em todas as páginas e modais
- ✅ Menu mobile profissional e acessível
- ✅ Footer limpo e organizado
- ✅ Notificações discretas e não intrusivas

## Screenshot
- (Adicionar screenshots após deploy se necessário)
