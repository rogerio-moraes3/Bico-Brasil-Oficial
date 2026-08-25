import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
export const Gatekeeper = () => {
  const { loading, blockGeneralNavigation } = useProfileCompletion();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (blockGeneralNavigation && location.pathname !== '/complete-profile') {
      navigate('/complete-profile', { state: { fromGatekeeper: true } });
    }
  }, [loading, blockGeneralNavigation, location.pathname, navigate]);

  return null;
};
