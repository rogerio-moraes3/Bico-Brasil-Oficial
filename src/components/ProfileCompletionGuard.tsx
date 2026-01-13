import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

export const ProfileCompletionGuard = ({ children }: ProfileCompletionGuardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (user) {
      checkProfileCompletion();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkProfileCompletion = async () => {
    try {

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user!.id)
        .maybeSingle();

      if (error) {
        console.error('[ProfileGuard] Erro ao buscar perfil:', error);
        setLoading(false);
        return;
      }

      if (!profile) {
        // Perfil será criado pelo AuthContext, permitir acesso
        setIsComplete(true);
        setLoading(false);
        return;
      }

      // Perfil encontrado (sensitive parts omitted from logs)

      // Verificar campos essenciais
      const missingFields = [];
      if (!profile.phone || profile.phone.trim() === '') missingFields.push('Telefone/WhatsApp');
      if (!profile.neighborhood || profile.neighborhood.trim() === '') missingFields.push('Bairro');
      if (!profile.city_id) missingFields.push('Cidade');
      if (profile.type === 'worker' && !profile.category) missingFields.push('Categoria de trabalho');

      if (missingFields.length > 0) {
        navigate('/complete-profile', { 
          state: { missingFields, fromGuard: true } 
        });
      } else {
        setIsComplete(true);
      }
    } catch (error) {
      console.error('[ProfileGuard] Erro ao verificar perfil:', error);
      setIsComplete(true); // Em caso de erro, permitir acesso
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isComplete && user) {
    return null;
  }

  return <>{children}</>;
};
