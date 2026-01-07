import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, ArrowRight } from "lucide-react";

export const SalesHeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#d4fddf] dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 text-slate-900 dark:text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">+5.000 serviços realizados</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Conecte-se a Quem Resolve:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Serviços Rápidos
            </span>{" "}
            e{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Renda Extra
            </span>{" "}
            na Sua Cidade.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            Encontre profissionais confiáveis em segundos ou ofereça seus serviços sem pagar comissões abusivas.
            A plataforma leve, segura e feita para o Brasil que trabalha.
          </p>


          {/* CTAs Secundários */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
            <Button
              size="default"
              variant="ghost"
              onClick={() => navigate("/app")}
              className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 font-medium border border-slate-300 dark:border-transparent"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar Profissional
            </Button>

            <span className="hidden sm:block text-slate-500">|</span>

            <Button
              size="default"
              variant="ghost"
              onClick={() => navigate("/app")}
              className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 font-medium border border-slate-300 dark:border-transparent"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Oferecer Serviços
            </Button>
          </div>

          {/* Secondary CTA */}
          <p className="mt-6 text-slate-500 dark:text-slate-400">
            Já tem conta?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-blue-400 hover:text-blue-300 underline font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-background" />
        </svg>
      </div>
    </section>
  );
};
