import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { BeforeInstallPromptEvent, getDeferredPwaPrompt } from '@/lib/pwaPrompt';

export const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(getDeferredPwaPrompt());
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const updateDisplayMode = () => {
      setShowButton(!mediaQuery.matches);
      if (mediaQuery.matches) {
        setDeferredPrompt(null);
      }
    };
    updateDisplayMode();

    // Listen to custom event from App.tsx
    const handlePwaPromptAvailable = () => {
      const prompt = getDeferredPwaPrompt();
      if (prompt && !window.matchMedia('(display-mode: standalone)').matches) {
        setDeferredPrompt(prompt);
        setShowButton(true);
      }
    };

    const handleAppInstalled = () => {
      setShowButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('pwa-prompt-available', handlePwaPromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', updateDisplayMode);

    // Check if prompt is already available
    const existingPrompt = getDeferredPwaPrompt();
    if (existingPrompt && !mediaQuery.matches) {
      setDeferredPrompt(existingPrompt);
      setShowButton(true);
    }

    return () => {
      window.removeEventListener('pwa-prompt-available', handlePwaPromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', updateDisplayMode);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowButton(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <Button 
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download size={16} />
      Instalar App
    </Button>
  );
};
