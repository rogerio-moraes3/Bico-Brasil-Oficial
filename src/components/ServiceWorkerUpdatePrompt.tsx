import { useEffect, useState } from "react";
import { onServiceWorkerUpdate, reloadForServiceWorkerUpdate } from "@/services/serviceWorkerRegistration";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const ServiceWorkerUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    onServiceWorkerUpdate(() => setShowPrompt(true));
  }, []);

  if (!showPrompt) return null;

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-50 animate-slide-down w-[90%] max-w-sm"
      style={{ 
        top: 'calc(env(safe-area-inset-top, 0px) + 1rem)'
      }}
    >
      <div className="bg-card/95 backdrop-blur-md border border-border/50 shadow-lg rounded-lg p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">
              Atualização disponível
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button 
              size="sm" 
              onClick={() => reloadForServiceWorkerUpdate()}
              className="h-7 text-xs px-2.5"
            >
              Atualizar
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowPrompt(false)}
              className="h-7 w-7 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
