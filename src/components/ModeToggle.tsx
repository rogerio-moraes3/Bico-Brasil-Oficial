import { useUserMode } from "@/contexts/UserModeContext";
import { Briefcase, Building2 } from "lucide-react";

export const ModeToggle = () => {
    const { mode, toggleMode, isTransitioning } = useUserMode();

    return (
        <div className={`flex items-center gap-2 bg-muted/50 rounded-full p-1 transition-all duration-300 ${isTransitioning ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
            }`}>
            <button
                onClick={toggleMode}
                disabled={isTransitioning}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${mode === 'contractor'
                        ? 'bg-blue-500 text-white shadow-md scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                aria-label="Modo Contratante"
            >
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">Contratar</span>
            </button>

            <button
                onClick={toggleMode}
                disabled={isTransitioning}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${mode === 'professional'
                        ? 'bg-green-500 text-white shadow-md scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                aria-label="Modo Trabalhador"
            >
                <Briefcase className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">Trabalhar</span>
            </button>
        </div>
    );
};
