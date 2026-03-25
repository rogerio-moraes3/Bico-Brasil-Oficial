import { Rocket, ShieldCheck, Smartphone, Star, Users } from "lucide-react";

const trustItems = [
  {
    icon: Rocket,
    label: "+5.000",
    description: "Serviços Realizados",
  },
  {
    icon: ShieldCheck,
    label: "Verificados",
    description: "Profissionais com Documento",
  },
  {
    icon: Smartphone,
    label: "PWA Leve",
    description: "Tecnologia Moderna",
  },
  {
    icon: Star,
    label: "4.8/5",
    description: "Avaliação Média",
  },
  {
    icon: Users,
    label: "+2.000",
    description: "Profissionais Ativos",
  },
];

export const TrustBar = () => {
  return (
    <section className="py-14 bg-background border-y border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-10">
          A escolha inteligente de quem precisa resolver rápido
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-0 md:divide-x md:divide-border/50">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center px-4 py-2"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight">{item.label}</span>
              <span className="text-xs text-muted-foreground mt-1 leading-snug">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
