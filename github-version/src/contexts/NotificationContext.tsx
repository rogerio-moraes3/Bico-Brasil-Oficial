import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'new_job' | 'new_candidate' | 'new_message' | 'job_update' | 'rating' | 'system';
  read: boolean;
  link?: string;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userCityId, setUserCityId] = useState<string | null>(null);

  // Carregar cidade do usuário
  useEffect(() => {
    if (!user) return;

    const loadUserCity = async () => {
      const { data } = await supabase
        .from('users')
        .select('city_id')
        .eq('auth_id', user.id)
        .single();

      if (data?.city_id) {
        setUserCityId(data.city_id);
      }
    };

    loadUserCity();
  }, [user]);

  // Carregar notificações do banco
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as Notification[]);
      }
    };

    loadNotifications();
  }, [user]);

  // Subscrever a notificações em tempo real
  useEffect(() => {
    if (!user || !userCityId) return;

    // 1. Novos bicos na cidade do usuário
    const jobsChannel = supabase
      .channel('new-jobs-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'job_postings',
        filter: `city_id=eq.${userCityId}`
      }, (payload: any) => {
        const newJob = payload.new;
        addNotification({
          title: '🆕 Novo bico disponível!',
          message: `${newJob.title} em ${newJob.neighborhood}`,
          type: 'new_job',
          link: `/jobs/${newJob.id}`
        });

        // Toast notification
        toast('🆕 Novo bico disponível!', {
          description: newJob.title
        });
      })
      .subscribe();

    // 2. Novos candidatos nos bicos do usuário
    const contactsChannel = supabase
      .channel('new-contacts-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'job_contacts'
      }, async (payload: any) => {
        // Verificar se é um job do usuário atual
        const { data: job } = await supabase
          .from('job_postings')
          .select('id, title, user_id')
          .eq('id', payload.new.job_id)
          .single();

        if (job && job.user_id === user.id) {
          addNotification({
            title: 'Novo interessado!',
            message: `Alguém se interessou pelo seu bico: ${job.title}`,
            type: 'new_candidate',
            link: `/jobs/${job.id}`
          });

          toast('Novo interessado!', {
            description: job.title
          });
        }
      })
      .subscribe();

    // 3. Novas mensagens
    const messagesChannel = supabase
      .channel('new-messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload: any) => {
        // Verificar se a mensagem não foi enviada pelo próprio usuário
        if (payload.new.sender_id === user.id) return;

        // Verificar se o usuário está na conversa
        const { data: conversation } = await supabase
          .from('conversations')
          .select('contractor_id, worker_id')
          .eq('id', payload.new.conversation_id)
          .single();

        if (conversation && (conversation.contractor_id === user.id || conversation.worker_id === user.id)) {
          addNotification({
            title: 'Nova mensagem',
            message: payload.new.content.substring(0, 50) + '...',
            type: 'new_message',
            link: '/messages'
          });

          toast('Nova mensagem', {
            description: 'Você recebeu uma nova mensagem'
          });
        }
      })
      .subscribe();

    // 4. Atualizações de status de jobs
    const jobUpdatesChannel = supabase
      .channel('job-updates-realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs'
      }, async (payload: any) => {
        const oldStatus = payload.old.status;
        const newStatus = payload.new.status;

        if (oldStatus === newStatus) return;

        // Verificar se o usuário está envolvido no job
        if (payload.new.contractor_id === user.id || payload.new.worker_id === user.id) {
          const statusLabels: Record<string, string> = {
            'published': 'Publicado',
            'in_progress': 'Em andamento',
            'done': 'Concluído',
            'cancelled': 'Cancelado'
          };

          addNotification({
            title: '✅ Status atualizado',
            message: `Job "${payload.new.title}" foi ${statusLabels[newStatus] || newStatus}`,
            type: 'job_update',
            link: `/jobs/${payload.new.id}`
          });

          toast('✅ Status atualizado', {
            description: payload.new.title
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(contactsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(jobUpdatesChannel);
    };
  }, [user, userCityId]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    if (!user) return;

    const newNotification = {
      ...notification,
      user_id: user.id,
      read: false,
      created_at: new Date().toISOString()
    };

    // Salvar no banco
    const { data } = await supabase
      .from('notifications')
      .insert([newNotification])
      .select()
      .single();

    if (data) {
      setNotifications(prev => [data as Notification, ...prev]);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
