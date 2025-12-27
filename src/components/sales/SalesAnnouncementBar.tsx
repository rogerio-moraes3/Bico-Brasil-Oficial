import { Smartphone } from "lucide-react";
import { useState } from "react";

export const SalesAnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2 px-4 text-center relative">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm md:text-base font-medium">
        <Smartphone className="w-4 h-4 animate-bounce" />
        <span>Novidade: O App que não ocupa memória!</span>
        <span className="hidden sm:inline">Instale agora direto pelo navegador.</span>
        <button 
          onClick={() => {
            const event = new Event('show-pwa-prompt');
            window.dispatchEvent(event);
          }}
          className="underline font-semibold hover:no-underline ml-1"
        >
          Saiba Mais
        </button>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-1"
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  );
};
