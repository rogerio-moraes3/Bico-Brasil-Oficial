import { ArrowRight, Sparkles, X } from "lucide-react";
import { useState } from "react";

export const SalesAnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-slate-900 dark:bg-zinc-950 px-6 py-2.5 sm:px-3.5 justify-center border-b border-slate-800 dark:border-white/10">
      {/* Background glow */}
      <div className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl" aria-hidden="true">
        <div className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#4f46e5] to-[#0ea5e9] opacity-20" style={{ clipPath: 'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)' }} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm leading-6 text-slate-200 dark:text-zinc-300 flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-blue-500/20 dark:bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-300 dark:text-blue-400 border border-blue-500/30 dark:border-blue-500/20">
            <Sparkles className="w-3 h-3" /> NOVIDADE
          </span>
          <span className="font-medium">O App que não ocupa memória! Instale direto pelo navegador.</span>
        </p>
        <button
          onClick={() => {
            const event = new Event('show-pwa-prompt');
            window.dispatchEvent(event);
          }}
          className="flex-none rounded-full bg-white/10 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all group flex items-center gap-1.5"
        >
          Instalar agora <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="flex flex-1 justify-end absolute right-4">
        <button type="button" onClick={() => setIsVisible(false)} className="-m-3 p-3 focus-visible:outline-offset-[-4px]">
          <span className="sr-only">Dismiss</span>
          <X className="h-5 w-5 text-slate-400 dark:text-zinc-400 hover:text-white transition-colors" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
