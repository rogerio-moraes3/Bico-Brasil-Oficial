import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Sparkles, 
  Laptop, 
  Truck, 
  Wrench, 
  Paintbrush,
  Zap,
  Droplets,
  TreePine,
  ChefHat,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    icon: Home,
    name: "Casa e Reformas",
    examples: "Pedreiros, Pintores, Eletricistas",
    slug: "construcao-reforma",
    color: "bg-blue-500",
  },
  {
    icon: Sparkles,
    name: "Limpeza",
    examples: "Diaristas, Limpeza Pós-obra",
    slug: "limpeza-organizacao",
    color: "bg-cyan-500",
  },
  {
    icon: Laptop,
    name: "Digital e Aulas",
    examples: "Designers, Professores, Tech",
    slug: "digital",
    color: "bg-purple-500",
  },
  {
    icon: Truck,
    name: "Fretes e Mudanças",
    examples: "Carretos rápidos na região",
    slug: "transporte-apoio",
    color: "bg-orange-500",
  },
  {
    icon: Wrench,
    name: "Manutenção",
    examples: "Celulares, Ar-condicionado",
    slug: "manutencao-domestica",
    color: "bg-red-500",
  },
  {
    icon: Paintbrush,
    name: "Pintura",
    examples: "Paredes, Portões, Muros",
    slug: "pintura",
    color: "bg-amber-500",
  },
  {
    icon: Zap,
    name: "Elétrica",
    examples: "Instalações, Reparos",
    slug: "eletrica",
    color: "bg-yellow-500",
  },
  {
    icon: Droplets,
    name: "Hidráulica",
    examples: "Encanadores, Vazamentos",
    slug: "hidraulica",
    color: "bg-teal-500",
  },
  {
    icon: TreePine,
    name: "Jardinagem",
    examples: "Corte de grama, Poda",
    slug: "jardinagem-externo",
    color: "bg-green-500",
  },
  {
    icon: ChefHat,
    name: "Serviços de Casa",
    examples: "Cozinheiras, Cuidadores",
    slug: "diaristas-servicos-casa",
    color: "bg-pink-500",
  },
];

export const CategoriesGrid = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/search-workers?category=${slug}`);
  };

  return (
    <section className="py-14 md:py-24 bg-background dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Categorias</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Categorias em Destaque
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Encontre o profissional certo para cada tipo de serviço
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category.slug)}
              className="group bg-card border border-border rounded-xl p-4 hover:border-primary/60 hover:shadow-[0_4px_20px_-6px_hsl(var(--xp-primary)/0.18)] transition-all duration-300 text-left card-lift"
            >
              <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {category.examples}
              </p>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/search-workers")}
            className="group"
          >
            Ver todas as categorias
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
