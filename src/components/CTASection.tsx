import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Briefcase } from "lucide-react";

export const CTASection = () => {
  return (
    <section
      className="py-16 bg-gradient-to-r from-primary to-blue-600 dark:from-[#0838C7] dark:to-[#0D9E52] relative z-10"
      aria-labelledby="cta-title"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2
              id="cta-title"
              className="text-2xl md:text-3xl font-bold text-white mb-2"
            >
              Pronto para encontrar seu próximo bico?
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-md">
              Cadastre-se e comece a contratar ou oferecer serviços hoje mesmo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="font-semibold shadow-md"
            >
              <Link to="/search-workers" className="flex items-center gap-2">
                <Search className="h-4 w-4" aria-hidden="true" />
                Encontrar Profissionais
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/70 text-white hover:bg-white/10 font-semibold"
            >
              <Link to="/offer-services" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                Oferecer Serviços
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
