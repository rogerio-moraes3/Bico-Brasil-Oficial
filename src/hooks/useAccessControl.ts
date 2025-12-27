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
  contactUnlocksCount: number;
  remainingFreeUnlocks: number;
}

export const useAccessControl = () => {
  const { user } = useAuth();
  const [accessData, setAccessData] = useState<AccessControlData>({
    isTester: false,
    isPremium: false,
    profileViewsCount: 0,
    canViewProfiles: true,
    canViewContacts: false,
    remainingFreeViews: 3,
    contactUnlocksCount: 0,
    remainingFreeUnlocks: 3
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
        .select('is_tester, plan_active, subscription_end')
        .eq('auth_id', user!.id)
        .single();

      const isTester = userData?.is_tester || false;
      const isPremium = userData?.plan_active && 
        (!userData.subscription_end || new Date(userData.subscription_end) > new Date());

      // Contar visualizações (se não for tester nem premium)
      let profileViewsCount = 0;
      let contactUnlocksCount = 0;
      
      if (!isTester && !isPremium) {
        const { count: viewsCount } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('viewer_id', user!.id);
        
        profileViewsCount = viewsCount || 0;

        const { count: unlocksCount } = await supabase
          .from('contact_unlocks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user!.id);
        
        contactUnlocksCount = unlocksCount || 0;
      }

      setAccessData({
        isTester,
        isPremium,
        profileViewsCount,
        canViewProfiles: isTester || isPremium || profileViewsCount < 3,
        canViewContacts: isTester || isPremium,
        remainingFreeViews: Math.max(0, 3 - profileViewsCount),
        contactUnlocksCount,
        remainingFreeUnlocks: Math.max(0, 3 - contactUnlocksCount)
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
      const { error } = await supabase
        .from('profile_views')
        .insert({
          viewer_id: user.id,
          viewed_profile_id: viewedProfileId
        });

      if (error && !error.message.includes('duplicate')) {
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

    const { data } = await supabase
      .from('contact_unlocks')
      .select('id')
      .eq('user_id', user.id)
      .eq('worker_id', workerId)
      .maybeSingle();

    return !!data;
  };

  const unlockWorkerContact = async (workerId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('contact_unlocks')
        .insert({
          user_id: user.id,
          worker_id: workerId
        });

      if (error && !error.message.includes('duplicate')) {
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
