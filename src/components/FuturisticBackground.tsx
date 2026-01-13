import { useEffect, useState } from 'react';

export const FuturisticBackground = () => {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    // Detectar se está rodando como PWA/App
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;
    setIsApp(isPWA);
  }, []);

  // Não mostrar no app/PWA
  if (isApp) return null;

  return (
    <>
      {/* Camada principal com gradientes azul/verde metálicos */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 futuristic-bg-main"
        aria-hidden="true"
      />
      
      {/* Camada secundária - movimento mais lento */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 futuristic-bg-secondary"
        aria-hidden="true"
      />
    </>
  );
};
