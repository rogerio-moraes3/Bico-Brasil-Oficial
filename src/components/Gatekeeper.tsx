import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const { loading, blockGeneralNavigation } = useProfileCompletion();
  const location = useLocation();

  // Usuário logado com o perfil ainda carregando: ainda não sabemos se deve
  // bloquear, mas também não deixamos a página real montar nesse meio-tempo
  // — ex.: logo após o AuthCallback do Google mandar pra /app com uma conta
  // recém-criada, antes do fetch de completude terminar. Um spinner curto
  // em vez do conteúdo de destino (mesmo padrão do ProfileCompletionGuard).
  // Visitante anônimo nunca passa por essa espera — loading aqui é só do
  // fetch de perfil, que só roda quando há usuário.
  if (user && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!loading && blockGeneralNavigation && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" state={{ fromGatekeeper: true }} replace />;
  }

  return <>{children}</>;
};
