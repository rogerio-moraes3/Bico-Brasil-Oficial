import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileCompletion, PROFILE_FIELD_LABELS } from '@/hooks/useProfileCompletion';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

// Protege ações de alto valor (publicar vaga/serviço, editar, ver meus
// bicos, perfil, etc). Contas novas incompletas são bloqueadas direto pelo
// Gatekeeper global antes de chegar aqui; este guard existe pra pegar
// contas LEGADAS depois que a carência de 30 dias acaba — durante a
// carência elas passam livre (blockHighValueActions já considera isso).
export const ProfileCompletionGuard = ({ children }: ProfileCompletionGuardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, blockHighValueActions, missingFields } = useProfileCompletion();

  useEffect(() => {
    if (!user || loading) return;
    if (blockHighValueActions) {
      navigate('/complete-profile', {
        state: {
          missingFields: missingFields.map((key) => PROFILE_FIELD_LABELS[key] ?? key),
          fromGuard: true,
        },
      });
    }
  }, [user, loading, blockHighValueActions, missingFields, navigate]);

  if (!user) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (blockHighValueActions) return null;

  return <>{children}</>;
};
