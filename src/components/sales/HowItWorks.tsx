import { Search, MapPin, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Busque ou Anuncie",
    description: "Diga o que você precisa ou o que sabe fazer. De pedreiro a designer, temos espaço para todos.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MapPin,
    number: "02",
    title: "Filtre por Proximidade",
    description: "Nossa tecnologia mostra quem está perto de você agora. Economize no transporte e no tempo.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: MessageCircle,
    number: "03",
    title: "Negocie Livremente",
    description: "Gostou do perfil? Chame no WhatsApp com um clique. O acordo é entre vocês, sem burocracia.",
    color: "from-green-500 to-emerald-500",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Como Funciona</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Simples como deve ser
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Em 3 passos você resolve — sem burocracia, sem intermediários.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector dot trail */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-[3.25rem] left-[calc(60%+1rem)] right-[-1rem] h-px bg-gradient-to-r from-border/80 to-transparent" aria-hidden="true" />
              )}

              <div className="bg-card border border-border rounded-2xl p-7 shadow-sm hover:shadow-[0_4px_24px_-6px_hsl(var(--xp-primary)/0.14)] hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
                {/* Background number */}
                <span className="absolute right-4 top-2 text-7xl font-bold text-muted-foreground/10 group-hover:text-primary/10 transition-colors select-none" aria-hidden="true">
                  {step.number}
                </span>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-md relative z-10`}>
                  <step.icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>

                <h3 className="text-base font-bold text-foreground mb-2 relative z-10">
                  {step.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
