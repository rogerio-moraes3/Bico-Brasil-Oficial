import { Check, ChevronDown } from "lucide-react";
import { useUserMode } from "@/contexts/UserModeContext";
import { type UserMode } from "@/lib/userMode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const AMBIENTES: { value: UserMode; label: string }[] = [
  { value: "professional", label: "Trabalhar" },
  { value: "contractor", label: "Contratar" },
];

/**
 * Indicador de ambiente no header — o nivel TERCIARIO de troca.
 *
 * Deliberadamente NEUTRO (cinza): se usasse bico-accent/bico-work, voltaria a
 * competir com os CTAs principais da tela, que e exatamente o problema que
 * esta arquitetura veio resolver. A cor do ambiente aparece no conteudo, nao
 * aqui. O ModeToggle colorido segue existindo para uso dentro do Perfil.
 *
 * Sem `hidden sm:block`: precisa aparecer no mobile, onde a desorientacao e
 * maior. No mobile mostra so o nome do ambiente; a partir de sm, o rotulo
 * "Ambiente" tambem.
 */
export const ModeChip = () => {
  const { mode, setMode, isModeResolved } = useUserMode();
  const atual = AMBIENTES.find(a => a.value === mode);

  // Enquanto o modo nao resolveu, ocupa o mesmo espaco sem afirmar um
  // ambiente — evita mostrar "Contratar" e trocar para "Trabalhar" na cara
  // do usuario.
  if (!isModeResolved) {
    return (
      <div
        className="h-8 w-[104px] rounded-full bg-white/[0.06] animate-pulse"
        aria-hidden="true"
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Ambiente atual: ${atual?.label}. Trocar de ambiente`}
          className="inline-flex items-center gap-1.5 h-8 min-h-8 rounded-full border border-white/15 bg-white/[0.06] px-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
            Ambiente
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {atual?.label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-white/45" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[180px]">
        {AMBIENTES.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => value !== mode && setMode(value)}
            className="gap-2 text-sm"
          >
            <Check
              className={`h-4 w-4 ${value === mode ? "opacity-100" : "opacity-0"}`}
              aria-hidden="true"
            />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
