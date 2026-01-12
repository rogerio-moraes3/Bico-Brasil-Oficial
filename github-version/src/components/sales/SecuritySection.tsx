import { ShieldCheck, Star, Headphones, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: FileCheck,
    title: "Selo de Verificação",
    description: "Identificamos documentos para garantir que a pessoa é real e confiável.",
  },
  {
    icon: Star,
    title: "Avaliações Reais",
    description: "Sistema de estrelas e comentários que constroem reputação sólida.",
  },
  {
    icon: Headphones,
    title: "Suporte Humanizado",
    description: "Dúvidas? Nossa equipe ajuda você a navegar na plataforma.",
  },
  {
    icon: ShieldCheck,
    title: "Dados Protegidos",
    description: "Suas informações estão seguras conforme a LGPD.",
  },
];

export const SecuritySection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/10 rounded-full px-4 py-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Segurança</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Segurança é nossa prioridade
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trabalhamos para que você tenha tranquilidade ao contratar ou oferecer serviços
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {securityFeatures.map((feature, index) => (
            <div 
              key={index}
              className="bg-background rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
