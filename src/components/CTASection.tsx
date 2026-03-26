import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Briefcase } from "lucide-react";

export const CTASection = () => {
  return (
    <section
      className="py-16 bg-gradient-to-br from-primary via-primary to-blue-600 dark:from-[#0838C7] dark:to-[#0D9E52] relative z-10 overflow-hidden"
      aria-labelledby="cta-title"
    >
      {/* Decorative blob */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[340px] h-[340px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[240px] h-[240px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60 mb-4">
            Bico Brasil
          </p>
          <h2
            id="cta-title"
            className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight leading-[1.12]"
          >
            Pronto para encontrar seu próximo bico?
          </h2>
          <p className="text-white/75 text-base mb-8 max-w-md mx-auto leading-relaxed">
            Cadastre-se e comece a contratar ou oferecer serviços hoje mesmo. Sem comissões, sem burocracia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 w-full sm:w-auto sm:min-w-[220px] font-bold shadow-lg rounded-xl group"
            >
              <Link to="/search-workers" className="flex items-center gap-2">
                <Search className="h-4 w-4" aria-hidden="true" />
                Encontrar Profissionais Agora
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full sm:w-auto px-8 border-white/50 text-white hover:bg-white/10 hover:border-white/70 font-semibold rounded-xl transition-all duration-200"
            >
              <Link to="/offer-services" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                Começar a Ganhar Dinheiro
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

