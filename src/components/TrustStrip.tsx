import { ShieldCheck, Phone, Banknote, Lock } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Profissionais verificados" },
  { icon: Phone, label: "Contato direto" },
  { icon: Banknote, label: "Sem comissão" },
  { icon: Lock, label: "Plataforma segura" },
];

export const TrustStrip = () => {
  return (
    <div
      className="w-full bg-primary/5 border-b border-border/40 py-2.5 px-4"
      aria-label="Diferenciais da plataforma"
    >
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
        {TRUST_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-foreground/80 font-medium">
            <item.icon className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
