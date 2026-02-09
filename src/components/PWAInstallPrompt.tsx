import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      localStorage.removeItem('pwa-dismissed');
    }

    setDeferredPrompt(null);
  };

  useEffect(() => {
    let timeoutId: number | undefined;
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
      return;
    }
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user dismissed before
      const dismissed = localStorage.getItem('pwa-dismissed');
      const dismissedDate = dismissed ? new Date(dismissed) : null;
      const now = new Date();

      // Show if never dismissed or dismissed more than 7 days ago
      if (!dismissedDate || (now.getTime() - dismissedDate.getTime()) > 7 * 24 * 60 * 60 * 1000) {
        // Show after 3 seconds
        timeoutId = window.setTimeout(() => setShowPrompt(true), 3000);
      }
    };
    const handleInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-dismissed');
    };

    // Custom event listener for manual trigger from footer button
    const handleCustomPrompt = () => {
      if (deferredPrompt) {
        handleInstall();
      } else {
        // Fallback: navigate to install page with instructions
        window.location.href = '/install-app';
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('show-pwa-prompt', handleCustomPrompt);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('show-pwa-prompt', handleCustomPrompt);
    };
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-dismissed', new Date().toISOString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Instalar Bico Brasil</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Instale nosso app para acesso rápido e receba notificações de novos trabalhos!
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  Instalar Agora
                </Button>
                <Button onClick={handleDismiss} variant="outline" size="sm">
                  Mais tarde
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
