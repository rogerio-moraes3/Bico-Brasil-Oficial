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
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(0,255,157,0.08), transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(0,123,255,0.08), transparent 60%)
          `,
          animation: 'moveFuture 12s ease-in-out infinite alternate',
          opacity: 0.35,
          filter: 'blur(35px) saturate(140%)',
        }}
      />
      
      {/* Camada secundária - movimento mais lento */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(circle at 60% 30%, rgba(8,26,52,0.12), transparent 50%),
            radial-gradient(circle at 20% 70%, rgba(0,255,157,0.06), transparent 50%)
          `,
          animation: 'metalMove 18s linear infinite alternate',
          opacity: 0.25,
          filter: 'blur(40px)',
        }}
      />
    </>
  );
};
