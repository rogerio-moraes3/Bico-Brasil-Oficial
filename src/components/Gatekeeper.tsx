import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

// Checkpoint global: bloqueia a navegação de contas NOVAS (criadas a partir
// do lançamento do item 11) até o cadastro estar completo — CPF, endereço
// com CEP/número e telefone confirmado por código. Contas legadas nunca são
// bloqueadas aqui (ver useProfileCompletion — blockGeneralNavigation já
// exclui isLegacyAccount); elas só são impedidas em ações de alto valor,
// via ProfileCompletionGuard, depois do fim da carência.
//
// Não tem formulário próprio (o antigo Gatekeeper tinha um modal com só
// CPF/telefone/cidade) — a exigência agora inclui verificação de telefone
// por código, que precisa da tela cheia de CompleteProfile.tsx.
//
// Envolve as rotas (ver App.tsx) e renderiza <Navigate replace> no lugar
// delas quando bloqueado, em vez do padrão antigo de deixar a rota montar e
// só depois chamar navigate() dentro de um useEffect. Isso evita: (1) o
// flash de conteúdo bloqueado — a página nunca chega a montar quando o
// redirecionamento é necessário, os dois acontecem no mesmo ciclo de render;
// (2) vazamento pelo botão Voltar — replace substitui a entrada atual do
// histórico em vez de empilhar uma nova, então voltar não retorna pra tela
// bloqueada.
export const Gatekeeper = ({ children }: { children: ReactNode }) => {
  const { loading, blockGeneralNavigation } = useProfileCompletion();
  const location = useLocation();

  // Enquanto loading, ainda não sabemos se deve bloquear — deixa passar
  // (mesmo comportamento de antes) em vez de travar toda a navegação
  // esperando essa checagem, que a maioria das rotas nem precisa.
  if (!loading && blockGeneralNavigation && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" state={{ fromGatekeeper: true }} replace />;
  }

  return <>{children}</>;
};
