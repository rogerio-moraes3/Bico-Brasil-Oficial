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
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down w-[90%] max-w-md">
      <div className="bg-card/95 backdrop-blur-sm border border-border shadow-lg rounded-xl p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">
              Nova versão disponível
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => reloadForServiceWorkerUpdate()}
              className="h-8 text-xs px-3"
            >
              Atualizar
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowPrompt(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
