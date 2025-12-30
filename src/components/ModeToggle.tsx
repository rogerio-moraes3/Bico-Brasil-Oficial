import { useUserMode } from "@/contexts/UserModeContext";
import { Briefcase, Building2 } from "lucide-react";

export const ModeToggle = () => {
    const { mode, toggleMode, isTransitioning } = useUserMode();

    return (
        <div className={`flex items-center gap-1 bg-muted/30 rounded border border-border p-0.5 transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'
            }`}>
            <button
                onClick={() => mode !== 'contractor' && toggleMode()}
                disabled={isTransitioning}
                className={`flex items-center justify-center px-3 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${mode === 'contractor'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
            >
                Contratar
            </button>

            <button
                onClick={() => mode !== 'professional' && toggleMode()}
                disabled={isTransitioning}
                className={`flex items-center justify-center px-3 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${mode === 'professional'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
            >
                Trabalhar
            </button>
        </div>
    );
};
