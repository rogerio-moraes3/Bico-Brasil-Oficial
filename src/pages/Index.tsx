import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Megaphone, Hammer } from "lucide-react";
import { useUserMode } from "@/contexts/UserModeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQ } from "@/components/FAQ";
import { FuturisticBackground } from "@/components/FuturisticBackground";
import { ValuePropsSection } from "@/components/ValuePropsSection";
import { FeaturedServicesSection } from "@/components/FeaturedServicesSection";
import { CTASection } from "@/components/CTASection";
import { SearchBar } from "@/components/SearchBar";
import { ModeToggle } from "@/components/ModeToggle";
import { ModeStats } from "@/components/ModeStats";

export default function Index() {
  const navigate = useNavigate();
  const { mode, setMode } = useUserMode();

  const handleContractorClick = () => {
    setMode("contractor");
    navigate("/search-workers");
  };

  const handleProfessionalClick = () => {
    setMode("professional");
    navigate("/procurar-bicos");
  };

  return (
    <>
      <Helmet>
        <title>Bico Brasil - Trabalhos de bicos e serviços rápidos na sua cidade</title>
        <meta name="description" content="Encontre serviços rápidos, bicos e trabalhadores disponíveis na sua cidade. Contrate ou ofereça seus serviços com segurança e rapidez." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 relative">
        <FuturisticBackground />
        <Header />

        {/* Search Bar - Elemento Principal */}
        <SearchBar />

        {/* Mode Toggle */}
        <div className="bg-white dark:bg-slate-950 py-4 px-4 relative z-10 flex justify-center">
          <ModeToggle />
        </div>

        {/* Estatísticas por Modo */}
        <ModeStats />

        {/* Title Section - Dinâmico baseado no modo */}
        <div className="bg-white dark:bg-slate-950 py-4 px-4 relative z-10">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white text-center">
            {mode === 'contractor' ? 'Encontre profissionais qualificados' : 'Encontre trabalhos perto de você'}
          </h1>
          <p className="text-center text-slate-700 dark:text-slate-300 mt-1 text-sm">
            {mode === 'contractor'
              ? 'Contrate serviços rápidos e confiáveis'
              : 'Ganhe dinheiro fazendo bicos na sua região'}
          </p>
        </div>

        {/* Split Screen Container */}
        <div className="flex-1 flex flex-col md:flex-row relative z-10">
          {/* Left Side - Contractor (Anunciar) */}
          <div
            onClick={handleContractorClick}
            className="relative flex-1 bg-gradient-to-br from-[#0838C7] to-[#062D9E] flex flex-col items-center justify-center text-white p-8 cursor-pointer hover:from-[#062D9E] hover:to-[#0838C7] transition-all duration-300 active:scale-95 min-h-[45vh] md:min-h-[70vh] overflow-hidden"
          >
            {/* Efeitos visuais - aparecem SOMENTE no browser, não no PWA */}
            <div className="metallic-grid" />
            <div className="shine-overlay" />
            <div className="inner-glow" />
            <div className="edge-fade" />
            <div className="noise-texture" />

            <div className="relative z-10 flex flex-col items-center gap-3 transform hover:scale-105 transition-transform duration-300">
              <Megaphone size={48} className="drop-shadow-lg" />
              <h2 className="text-2xl md:text-2xl font-bold text-center drop-shadow-md">Anunciar um bico</h2>
              <p className="text-sm md:text-base text-center max-w-md opacity-95">
                Para sua casa ou seu negócio
              </p>
            </div>
          </div>

          {/* Linha divisória central - apenas browser */}
          <div className="hidden md:block center-divider left-1/2" />

          {/* Right Side - Professional (Fazer Bico) */}
          <div
            onClick={handleProfessionalClick}
            className="relative flex-1 bg-gradient-to-br from-green-600 to-green-700 flex flex-col items-center justify-center text-white p-8 cursor-pointer hover:from-green-700 hover:to-green-600 transition-all duration-300 active:scale-95 min-h-[45vh] md:min-h-[70vh] overflow-hidden"
          >
            {/* Efeitos visuais - aparecem SOMENTE no browser, não no PWA */}
            <div className="metallic-grid" />
            <div className="shine-overlay" style={{ animationDelay: '2s' }} />
            <div className="inner-glow" />
            <div className="edge-fade" />
            <div className="noise-texture" />

            <div className="relative z-10 flex flex-col items-center gap-3 transform hover:scale-105 transition-transform duration-300">
              <Hammer size={48} className="drop-shadow-lg" />
              <h2 className="text-2xl md:text-2xl font-bold text-center drop-shadow-md">Fazer um bico</h2>
              <p className="text-sm md:text-base text-center max-w-md opacity-95">
                Renda extra com seus serviços
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo dinâmico baseado no modo */}
        {mode === 'contractor' ? (
          <>
            {/* Modo Contratante: Profissionais em Destaque */}
            <FeaturedServicesSection />
            <ValuePropsSection />
          </>
        ) : (
          <>
            {/* Modo Trabalhador: Jobs Disponíveis */}
            <section className="py-16 bg-background relative z-10">
              <div className="container mx-auto px-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                  Bicos Disponíveis em Presidente Prudente
                </h2>
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">Veja os trabalhos disponíveis na sua região</p>
                  <button
                    onClick={() => navigate('/procurar-bicos')}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all active:scale-95"
                  >
                    Ver Todos os Bicos
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* CTA Section */}
        <CTASection />

        {/* FAQ Section */}
        <section className="py-16 px-4 relative z-10 bg-background" id="main-content">
          <div className="container mx-auto">
            <FAQ />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
