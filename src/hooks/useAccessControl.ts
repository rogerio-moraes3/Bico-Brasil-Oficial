import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AccessControlData {
  isTester: boolean;
  isPremium: boolean;
  profileViewsCount: number;
  canViewProfiles: boolean;
  canViewContacts: boolean;
  remainingFreeViews: number;
}

export const useAccessControl = () => {
  const { user } = useAuth();
  const [accessData, setAccessData] = useState<AccessControlData>({
    isTester: false,
    isPremium: false,
    profileViewsCount: 0,
    canViewProfiles: true,
    canViewContacts: false,
    remainingFreeViews: 3
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAccessControl();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAccessControl = async () => {
    try {
      // Buscar dados do usuário
      const { data: userData } = await supabase
        .from('users')
        .select('is_tester, plan_active')
        .eq('auth_id', user!.id)
        .single();

      const isTester = userData?.is_tester || false;
      const isPremium = userData?.plan_active || false;

      // Buscar créditos do usuário (user_credits)
      let remainingFreeViews = 3;
      let profileViewsCount = 0;

      if (!isTester && !isPremium) {
        const { data: creditsData } = await supabase
          .from('user_credits')
          .select('remaining_free_views')
          .eq('user_id', user!.id)
          .single();

        remainingFreeViews = creditsData?.remaining_free_views || 0;
        profileViewsCount = 3 - remainingFreeViews;
      }

      setAccessData({
        isTester,
        isPremium,
        profileViewsCount,
        canViewProfiles: isTester || isPremium || remainingFreeViews > 0,
        canViewContacts: isTester || isPremium || remainingFreeViews > 0,
        remainingFreeViews
      });
    } catch (error) {
      console.error('Erro ao carregar controle de acesso:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordProfileView = async (viewedProfileId: string) => {
    if (!user || accessData.isTester || accessData.isPremium) {
      // Testers e Premium não precisam registrar views
      return { success: true };
    }

    try {
      // Decrementar crédito usando RPC
      const { error } = await supabase.rpc('decrement_view_credits', {
        user_auth_id: user.id
      });

      if (error) {
        throw error;
      }

      // Atualizar contagem local
      await loadAccessControl();

      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
      return { success: false, error };
    }
  };

  const hasUnlockedWorker = async (workerId: string): Promise<boolean> => {
    if (!user) return false;
    if (accessData.isTester || accessData.isPremium) return true;

    // Verificar se tem créditos disponíveis
    return accessData.remainingFreeViews > 0;
  };

  const unlockWorkerContact = async (workerId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Decrementar crédito usando RPC
      const { error } = await supabase.rpc('decrement_view_credits', {
        user_auth_id: user.id
      });

      if (error) {
        throw error;
      }

      await loadAccessControl();
      return true;
    } catch (error) {
      console.error('Erro ao desbloquear contato:', error);
      return false;
    }
  };

  return {
    ...accessData,
    loading,
    recordProfileView,
    refresh: loadAccessControl,
    hasUnlockedWorker,
    unlockWorkerContact
  };
};
