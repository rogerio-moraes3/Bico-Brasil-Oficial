import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';
import { BeforeInstallPromptEvent, getDeferredPwaPrompt, setDeferredPwaPrompt, clearDeferredPwaPrompt } from '@/lib/pwaPrompt';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(getDeferredPwaPrompt());
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
    clearDeferredPwaPrompt();
  };

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
      return;
    }

    let timeoutId: number | undefined;

    // Handle custom PWA event from App.tsx (central capture)
    const handlePwaPromptAvailable = () => {
      const prompt = getDeferredPwaPrompt();
      if (prompt) {
        console.log('✅ [PWA Prompt] Event received, preparing to show');
        setDeferredPrompt(prompt);

        // Check if user dismissed before
        const dismissed = localStorage.getItem('pwa-dismissed');
        const dismissedDate = dismissed ? new Date(dismissed) : null;
        const now = new Date();

        // Show if never dismissed or dismissed more than 7 days ago
        if (!dismissedDate || (now.getTime() - dismissedDate.getTime()) > 7 * 24 * 60 * 60 * 1000) {
          timeoutId = window.setTimeout(() => {
            console.log('✅ [PWA Prompt] Showing install prompt');
            setShowPrompt(true);
          }, 3000);
        }
      }
    };

    const handleAppInstalled = () => {
      console.log('✅ [PWA Prompt] App installed event received');
      setShowPrompt(false);
      setDeferredPrompt(null);
      clearDeferredPwaPrompt();
      localStorage.removeItem('pwa-dismissed');
    };

    // Custom event listener for manual trigger from footer button
    const handleCustomPrompt = () => {
      const prompt = getDeferredPwaPrompt();
      if (prompt) {
        handleInstall();
      } else {
        window.location.href = '/install-app';
      }
    };

    // Listen to custom events dispatched from App.tsx
    window.addEventListener('pwa-prompt-available', handlePwaPromptAvailable);
    window.addEventListener('pwa-installed', handleAppInstalled);
    window.addEventListener('show-pwa-prompt', handleCustomPrompt);

    // Also trigger if prompt is already available (app loaded after PWA event)
    const existingPrompt = getDeferredPwaPrompt();
    if (existingPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
      handlePwaPromptAvailable();
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener('pwa-prompt-available', handlePwaPromptAvailable);
      window.removeEventListener('pwa-installed', handleAppInstalled);
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
