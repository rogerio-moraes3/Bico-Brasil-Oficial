import { Search, MapPin, MessageCircle, ArrowRight } from "lucide-react";

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
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como Funciona
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simples, rápido e sem complicação. Em 3 passos você resolve.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent">
                  <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 text-muted-foreground" />
                </div>
              )}
              
              <div className="bg-background rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
                {/* Background number */}
                <span className="absolute right-4 top-2 text-7xl font-bold text-muted-foreground/20 group-hover:text-muted-foreground/30 transition-colors select-none">
                  {step.number}
                </span>
                
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg relative z-10`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground text-sm relative z-10">
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
