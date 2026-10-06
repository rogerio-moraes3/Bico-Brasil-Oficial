import { useNavigate } from "react-router-dom";
import { useUserMode } from "@/contexts/UserModeContext";
import { modeHome, type UserMode } from "@/lib/userMode";

// bico.accent = Contratar, bico.work = Trabalhar. Sao as duas cores da marca
// que representam os modos; blue-600/green-600 (genericas do Tailwind) saiam
// daqui justamente por nao fazerem parte da paleta.
//
// A ordem acompanha o portao (/escolher-ambiente): Contratar primeiro,
// Trabalhar depois — os dois lugares onde se escolhe ambiente leem igual.
const MODES: { value: UserMode; label: string; active: string }[] = [
    { value: "contractor", label: "Contratar", active: "bg-bico-accent text-white shadow-sm" },
    { value: "professional", label: "Trabalhar", active: "bg-bico-work text-white shadow-sm" },
];

export const ModeToggle = () => {
    const { mode, setMode, isModeResolved } = useUserMode();
    const navigate = useNavigate();

    const pick = (next: UserMode) => {
        if (next === mode) return;
        setMode(next);
        // Trocar de modo leva pra home do modo escolhido. As telas exclusivas
        // de um modo tambem se protegem sozinhas, via useModeGuard.
        navigate(modeHome(next));
    };

    // Enquanto o modo nao resolveu, nao afirma ambiente nenhum: pintar
    // "Contratar" e trocar para "Trabalhar" meio segundo depois e exatamente o
    // flash de cor errada que o isModeResolved existe para evitar.
    if (!isModeResolved) {
        return (
            <div
                className="h-9 w-[150px] animate-pulse rounded-lg bg-white/[0.06] sm:h-12 sm:w-[210px]"
                aria-hidden="true"
            />
        );
    }

    return (
        <div
            className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 p-1"
            role="group"
            aria-label="Modo de uso"
        >
            {MODES.map(({ value, label, active }) => (
                <button
                    key={value}
                    onClick={() => pick(value)}
                    aria-pressed={mode === value}
                    // Menor no mobile, maior a partir de sm — nunca escondido:
                    // a desorientacao de ambiente e justamente maior no celular.
                    className={`flex items-center justify-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 sm:px-5 sm:py-2.5 sm:text-sm ${mode === value
                        ? active
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};
