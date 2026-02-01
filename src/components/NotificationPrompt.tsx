import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Bell, X } from 'lucide-react';

type OfflineQueueEvent = {
  detail?: {
    processed?: number;
    remaining?: number;
    error?: string;
  };
};

export function NotificationPrompt() {
  const { user } = useAuth();
  const { permission, requestPermission, isSupported } = useNotifications();
  const { toast } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [processingQueue, setProcessingQueue] = useState(false);
  useEffect(() => {
    if (user && isSupported && permission === 'default') {
      const hasSeenPrompt = localStorage.getItem('notificationPromptSeen');
      const dismissedTime = localStorage.getItem('notificationPromptDismissed');

      // Não mostrar se foi visto/bloqueado permanentemente
      if (hasSeenPrompt) return;

      // Se foi apenas fechado, esperar 24h antes de mostrar novamente
      if (dismissedTime) {
        const timeSinceDismiss = Date.now() - parseInt(dismissedTime);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (timeSinceDismiss < twentyFourHours) return;
      }

      setTimeout(() => setShowPrompt(true), 3000);
    }

    const handleOfflineQueue = (e: Event) => {
      const detail = (e as CustomEvent<OfflineQueueEvent['detail']>).detail || {};
      if (detail.processed > 0) {
        toast({ title: 'Fila sincronizada', description: `Foram sincronizados ${detail.processed} itens` });
      } else if (detail.remaining === 0) {
        toast({ title: 'Fila sincronizada', description: 'Todos os itens foram processados' });
      } else if (detail.error) {
        toast({ title: 'Erro na sincronização', description: detail.error, variant: 'destructive' });
      }

      // update queue count on event
      try {
        const raw = localStorage.getItem('offline_queue_v1') || '[]';
        const arr = JSON.parse(raw);
        setQueueCount(arr.length || 0);
      } catch { setQueueCount(0); }
    };

    window.addEventListener('offlineQueueProcessed', handleOfflineQueue);

    // Initialize queue count on mount
    try {
      const raw = localStorage.getItem('offline_queue_v1') || '[]';
      const arr = JSON.parse(raw);
      setQueueCount(arr.length || 0);
    } catch { setQueueCount(0); }

    return () => window.removeEventListener('offlineQueueProcessed', handleOfflineQueue);
  }, [user, permission, isSupported, toast]);

  const handleEnable = async () => {
    const result = await requestPermission();

    if (result === 'granted') {
      toast({
        title: "Notificações ativadas! ✅",
        description: "Você receberá alertas sobre novos trabalhos"
      });
      localStorage.setItem('notificationPromptSeen', 'true');
      setShowPrompt(false);
    } else if (result === 'denied') {
      toast({
        title: "Notificações bloqueadas",
        description: "Você pode ativar nas configurações do navegador",
        variant: "destructive"
      });
      localStorage.setItem('notificationPromptSeen', 'true');
      localStorage.setItem('notificationBlocked', Date.now().toString());
      setShowPrompt(false);
    } else if (result === 'default') {
      // Usuário apenas fechou o prompt - não marcar como visto permanentemente
      setShowPrompt(false);
      // Permitir que apareça novamente em 24 horas
      localStorage.setItem('notificationPromptDismissed', Date.now().toString());
    } else if (result === 'unsupported') {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações",
        variant: "destructive"
      });
      localStorage.setItem('notificationPromptSeen', 'true');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    // Usuário fechou o prompt - permitir que apareça novamente em 24h
    localStorage.setItem('notificationPromptDismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 max-w-sm animate-fade-in">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Ativar Notificações</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Receba alertas instantâneos sobre novos trabalhos e mensagens
              </p>
              <div className="flex gap-2">
                <Button onClick={handleEnable} size="sm">
                  Ativar
                </Button>
                <Button onClick={handleDismiss} variant="ghost" size="sm">
                  Agora não
                </Button>
              </div>

              {/* Offline queue indicator */}
              {queueCount > 0 && (
                <div className="mt-3 p-3 bg-muted border border-border rounded-md text-sm">
                  Você tem <strong>{queueCount}</strong> item(s) aguardando sincronização.
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!navigator.onLine) {
                          toast({ title: 'Sem internet', description: 'Conecte-se para sincronizar', variant: 'destructive' });
                          return;
                        }
                        setProcessingQueue(true);
                        try {
                          const { processOfflineQueue } = await import('@/lib/offlineHandlers');
                          await processOfflineQueue();
                          const raw = localStorage.getItem('offline_queue_v1') || '[]';
                          const arr = JSON.parse(raw);
                          setQueueCount(arr.length || 0);
                          toast({ title: 'Sincronização iniciada' });
                        } catch (err) {
                          console.error(err);
                          toast({ title: 'Erro ao sincronizar', variant: 'destructive' });
                        } finally {
                          setProcessingQueue(false);
                        }
                      }}
                      disabled={processingQueue}
                    >
                      {processingQueue ? 'Sincronizando...' : 'Sincronizar agora'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      localStorage.removeItem('offline_queue_v1');
                      setQueueCount(0);
                      toast({ title: 'Fila limpa localmente' });
                    }}>
                      Limpar fila local
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
