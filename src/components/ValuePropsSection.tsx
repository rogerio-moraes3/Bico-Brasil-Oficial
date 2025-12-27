import { Shield, Zap, DollarSign } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const valueProps = [
  {
    icon: Shield,
    title: "Segurança e confiança",
    description: "Perfis verificados, avaliações reais e processo de resolução de conflitos para garantir serviços com responsabilidade."
  },
  {
    icon: Zap,
    title: "Rápido e local",
    description: "Encontre profissionais perto de você e combine atendimento rápido com agendamento fácil."
  },
  {
    icon: DollarSign,
    title: "Transparência",
    description: "Preços e condições claros para o cliente e para o prestador — sem surpresas."
  }
];

export const ValuePropsSection = () => {
  return (
    <section className="py-16 bg-card relative z-10" aria-labelledby="value-props-title">
      <div className="container mx-auto px-4">
        <h2 
          id="value-props-title" 
          className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
        >
          Por que usar o Bico Brasil?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {valueProps.map((prop, index) => (
            <Card 
              key={index} 
              className="bg-background border border-border hover:shadow-lg transition-shadow duration-300"
              tabIndex={0}
              aria-labelledby={`value-prop-${index}-title`}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <prop.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>
                <h3 
                  id={`value-prop-${index}-title`}
                  className="text-lg font-semibold text-foreground mb-2"
                >
                  {prop.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {prop.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
