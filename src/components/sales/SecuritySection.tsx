import { ShieldCheck, Star, Headphones, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: FileCheck,
    title: "Selo de Verificação",
    description: "Identificamos documentos para garantir que a pessoa é real e confiável.",
    iconColor: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Star,
    title: "Avaliações Reais",
    description: "Sistema de estrelas e comentários que constroem reputação sólida.",
    iconColor: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Headphones,
    title: "Suporte Humanizado",
    description: "Dúvidas? Nossa equipe ajuda você a navegar na plataforma.",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Dados Protegidos",
    description: "Suas informações estão seguras conforme a LGPD.",
    iconColor: "text-green-600",
    bgColor: "bg-green-500/10",
  },
];

export const SecuritySection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/10 rounded-full px-4 py-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-green-600" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">Segurança</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Segurança é nossa prioridade
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Trabalhamos para que você tenha tranquilidade ao contratar ou oferecer serviços
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-[0_4px_24px_-6px_hsl(var(--xp-primary)/0.12)] hover:border-primary/25 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
