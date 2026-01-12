import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Bell, X } from 'lucide-react';

export function NotificationPrompt() {
  const { user } = useAuth();
  const { permission, requestPermission, isSupported } = useNotifications();
  const { toast } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);

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
  }, [user, permission, isSupported]);

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
