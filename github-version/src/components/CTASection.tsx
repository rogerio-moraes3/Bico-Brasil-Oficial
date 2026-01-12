import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section 
      className="py-14 bg-gradient-to-r from-[#0838C7] to-[#0D9E52] relative z-10"
      aria-labelledby="cta-title"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 
              id="cta-title" 
              className="text-2xl md:text-3xl font-bold text-white mb-2"
            >
              Pronto para encontrar seu próximo bico?
            </h2>
            <p className="text-white/90 text-sm md:text-base">
              Cadastre-se e comece a contratar ou oferecer serviços hoje mesmo.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              asChild 
              size="lg"
              className="bg-white text-[#0838C7] hover:bg-white/90 font-semibold shadow-lg"
            >
              <Link to="/search-workers" className="flex items-center gap-2">
                Encontrar Profissionais
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#0D9E52] font-semibold"
            >
              <Link to="/offer-services">
                Oferecer Serviços
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
