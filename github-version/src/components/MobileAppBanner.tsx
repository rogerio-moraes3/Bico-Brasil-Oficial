import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X } from 'lucide-react';
import logo from '@/assets/logo.png';

export const MobileAppBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroidDevice = /android/i.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('mobile-banner-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    
    // Show banner only on mobile, not installed, and not recently dismissed
    if ((isIOSDevice || isAndroidDevice) && !isStandalone && (Date.now() - dismissedTime > threeDaysInMs)) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('mobile-banner-dismissed', Date.now().toString());
  };

  const getInstructions = () => {
    if (isIOS) {
      return (
        <div className="text-sm space-y-2">
          <p className="font-semibold">Para instalar no iPhone/iPad:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Toque no botão de compartilhar <span className="inline-block">⎋</span> (abaixo)</li>
            <li>Role e toque em "Adicionar à Tela de Início"</li>
            <li>Toque em "Adicionar"</li>
          </ol>
        </div>
      );
    }
    
    if (isAndroid) {
      return (
        <div className="text-sm space-y-2">
          <p className="font-semibold">Para instalar no Android:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Toque nos 3 pontos ⋮ no menu do navegador</li>
            <li>Selecione "Adicionar à tela inicial" ou "Instalar app"</li>
            <li>Confirme a instalação</li>
          </ol>
        </div>
      );
    }
    
    return null;
  };

  if (!showBanner) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:max-w-md md:left-1/2 md:-translate-x-1/2 p-4 shadow-xl z-50 bg-card animate-slide-up border-2 border-primary/20">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fechar"
      >
        <X size={20} />
      </button>
      
      <div className="space-y-3 pr-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Bico Brasil" className="h-12 w-12" />
          <div>
            <h3 className="font-bold text-lg">Instale o App!</h3>
            <p className="text-xs text-muted-foreground">Bico Brasil</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          🚀 Acesso rápido direto da sua tela inicial<br/>
          📱 Receba notificações de novos trabalhos<br/>
          ⚡ Funciona offline
        </p>
        
        {getInstructions()}
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Agora não
          </Button>
          <Button 
            onClick={handleDismiss}
            size="sm"
            className="flex-1"
          >
            Entendi!
          </Button>
        </div>
      </div>
    </Card>
  );
};
