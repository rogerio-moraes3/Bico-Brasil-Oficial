import { useNavigate } from "react-router-dom";
import { useUserMode } from "@/contexts/UserModeContext";
import { modeHome, type UserMode } from "@/lib/userMode";

// bico.accent = Contratar, bico.work = Trabalhar. Sao as duas cores da marca
// que representam os modos; blue-600/green-600 (genericas do Tailwind) saiam
// daqui justamente por nao fazerem parte da paleta.
const MODES: { value: UserMode; label: string; active: string }[] = [
    { value: "contractor", label: "Contratar", active: "bg-bico-accent text-white shadow-sm" },
    { value: "professional", label: "Trabalhar", active: "bg-bico-work text-white shadow-sm" },
];

export const ModeToggle = () => {
    const { mode, setMode, isTransitioning } = useUserMode();
    const navigate = useNavigate();

    const pick = (next: UserMode) => {
        if (next === mode || isTransitioning) return;
        setMode(next);
        // Trocar de modo leva pra home do modo escolhido. As telas exclusivas
        // de um modo tambem se protegem sozinhas, via useModeGuard.
        navigate(modeHome(next));
    };

    return (
        <div
            className={`flex items-center gap-1 bg-white/10 rounded border border-white/15 p-0.5 transition-all duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"
                }`}
            role="group"
            aria-label="Modo de uso"
        >
            {MODES.map(({ value, label, active }) => (
                <button
                    key={value}
                    onClick={() => pick(value)}
                    disabled={isTransitioning}
                    aria-pressed={mode === value}
                    className={`flex items-center justify-center px-3 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${mode === value
                        ? active
                        : "text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};
