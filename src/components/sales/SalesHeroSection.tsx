import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, ArrowRight, Sparkles } from "lucide-react";

export const SalesHeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-b from-background via-background to-primary/5 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 text-foreground dark:text-white overflow-x-hidden">
      {/* Decorative blobs — light mode only */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-40 w-[480px] h-[480px] rounded-full bg-primary/8 blur-3xl dark:hidden" />
        <div className="absolute top-10 right-0 w-[360px] h-[360px] rounded-full bg-primary/6 blur-3xl dark:hidden" />
        {/* Dark mode blobs */}
        <div className="hidden dark:block absolute -top-32 -left-40 w-[480px] h-[480px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="hidden dark:block absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-14 md:py-28 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-white/10 backdrop-blur-sm border border-primary/20 dark:border-white/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-primary dark:text-green-400" />
            <span className="text-sm font-medium text-primary dark:text-white">+5.000 serviços realizados</span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-[2rem] sm:text-5xl lg:text-6xl font-bold mb-5 leading-[1.1] tracking-tight text-foreground dark:text-white max-w-3xl mx-auto">
            Conecte-se a Quem Resolve:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 dark:from-orange-400 dark:to-amber-300">
              Serviços Rápidos
            </span>{" "}
            e{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 dark:from-blue-400 dark:to-cyan-300">
              Renda Extra
            </span>{" "}
            na Sua Cidade.
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-muted-foreground dark:text-slate-300 mb-9 max-w-xl mx-auto leading-relaxed">
            Encontre profissionais confiáveis em segundos ou ofereça seus serviços sem pagar comissões abusivas.
            Plataforma leve, segura e feita para o Brasil que trabalha.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              size="lg"
              className="h-14 w-full sm:w-auto sm:min-w-[240px] px-8 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 group"
            >
              Cadastrar Grátis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={() => navigate("/app")}
                variant="outline"
                size="lg"
                className="h-12 w-full sm:w-auto px-5 font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar Profissional
              </Button>

              <Button
                onClick={() => navigate("/app")}
                variant="outline"
                size="lg"
                className="h-12 w-full sm:w-auto px-5 font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Oferecer Serviços
              </Button>
            </div>
          </div>

          {/* Auth links — single line */}
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            Já tem conta?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="font-semibold text-primary dark:text-blue-400 hover:underline"
            >
              Fazer login
            </button>
            {" "}·{" "}
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="font-semibold text-primary dark:text-green-400 hover:underline"
            >
              Criar conta grátis
            </button>
          </p>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="relative -z-0 mt-4">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="currentColor" className="text-background" />
        </svg>
      </div>
    </section>
  );
};
