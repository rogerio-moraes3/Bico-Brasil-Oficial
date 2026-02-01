import { useEffect, useState } from "react";
import { onServiceWorkerUpdate, reloadForServiceWorkerUpdate } from "@/services/serviceWorkerRegistration";
import { Button } from "@/components/ui/button";

export const ServiceWorkerUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    onServiceWorkerUpdate(() => setShowPrompt(true));
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-card border border-border shadow-lg rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-sm">Atualização disponível</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Toque em atualizar para carregar a nova versão do app.
            </p>
          </div>
          <Button size="sm" onClick={() => reloadForServiceWorkerUpdate()}>
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  );
};
