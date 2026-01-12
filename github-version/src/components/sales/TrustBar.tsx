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
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground mb-8 font-medium">
          A escolha inteligente de quem precisa resolver rápido:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
          {trustItems.map((item, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-lg text-foreground">{item.label}</span>
              <span className="text-sm text-muted-foreground">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
