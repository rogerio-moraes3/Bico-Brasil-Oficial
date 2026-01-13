import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bell, Check, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function NotificationsPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDeleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remover do estado local imediatamente
      removeNotification(id);

      toast({
        title: "Notificação removida",
        description: "A notificação foi excluída com sucesso."
      });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a notificação.",
        variant: "destructive"
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    setTouchEnd(e.targetTouches[0].clientX);
    const diff = touchStart - e.targetTouches[0].clientX;
    if (diff > 50) {
      setSwipedId(id);
    } else if (diff < -50) {
      setSwipedId(null);
    }
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100 && swipedId) {
      // Swipe completo - confirmar delete
      handleDeleteNotification(swipedId);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_job':
        return '🆕';
      case 'new_candidate':
        return '';
      case 'new_message':
        return '';
      case 'job_update':
        return '✅';
      case 'rating':
        return '⭐';
      default:
        return '';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <Card className="max-h-[80vh] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {unreadNotifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-8"
          >
            <Check className="h-4 w-4 mr-1" />
            Marcar todas como lidas
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Nenhuma notificação ainda</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="relative overflow-hidden"
                  onTouchStart={handleTouchStart}
                  onTouchMove={(e) => handleTouchMove(e, notification.id)}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Botão de delete revelado pelo swipe */}
                  <div
                    className={`absolute right-0 top-0 bottom-0 w-20 bg-destructive flex items-center justify-center transition-transform ${swipedId === notification.id ? 'translate-x-0' : 'translate-x-full'
                      }`}
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </div>

                  {/* Conteúdo da notificação com transform */}
                  <div
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-transform duration-200 ease-out hover:bg-muted/50 ${!notification.read ? 'bg-primary/5' : ''} ${swipedId === notification.id ? '-translate-x-20' : 'translate-x-0'}` }
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <Badge variant="destructive" className="shrink-0">
                              Nova
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                          {notification.link && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
