# Governança e Estado de Congelamento de Funcionalidades

## Estado de Congelamento (Feature Freeze)
O projeto Bico Brasil Oficial está oficialmente em **estado de congelamento de funcionalidades**. Nenhuma funcionalidade nova (features) deve ser incluída até o lançamento, assegurando máxima estabilidade.

## O que pode ser alterado
- Correções de bugs críticos (por exemplo: falhas no login, erros que impeçam anúncio ou procura de serviços, exceptions do Supabase Auth)
- Pequenos ajustes de UX/usabilidade **exclusivamente para facilitar o uso pelo trabalhador** (feedback claro, botões, pequenas mensagens)
- Otimizações importantes de performance (tempo de carregamento, requisições, cache)

## O que NÃO pode ser alterado
- O fluxo principal (Login → Escolha de Oferecer/Procurar → Postagem/Busca de serviço)
- Estrutura do banco de dados, especialmente os campos multi-tenant (`tenant_id`)
- Políticas e modelo de autenticação simplificado via Supabase

## Objetivo Final
Garantir **estabilidade total** e comportamentos previsíveis para o lançamento restrito em Presidente Prudente. Apenas correção e aprimoramento do que já existe.

## Prioridade de Correção
Todo e qualquer **erro reportado no console do navegador** tem prioridade **absoluta** sobre correções estéticas, visuais ou de texto.

---

Dúvidas, exceções e emergências devem ser tratadas via Pull Request documentado, citando explicitamente o motivo e impacto no lançamento.