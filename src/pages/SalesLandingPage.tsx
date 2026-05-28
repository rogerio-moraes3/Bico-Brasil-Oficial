import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { SalesAnnouncementBar } from "@/components/sales/SalesAnnouncementBar";
import { SalesHeroSection } from "@/components/sales/SalesHeroSection";
import { HowItWorks } from "@/components/sales/HowItWorks";
import { CategoriesGrid } from "@/components/sales/CategoriesGrid";
import { ProviderSection } from "@/components/sales/ProviderSection";
import { SecuritySection } from "@/components/sales/SecuritySection";
import { SalesFAQ } from "@/components/sales/SalesFAQ";
import { SalesFooter } from "@/components/sales/SalesFooter";
import { Header } from "@/components/Header";

const SalesLandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar usuários logados automaticamente para o app
  useEffect(() => {
    if (!loading && user) {
      navigate("/app", { replace: true });
    }
  }, [user, loading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-2 border-white/10 border-t-blue-500"></div>
          <span className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Carregando…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bico Brasil - Serviços Rápidos e Renda Extra na Sua Cidade</title>
        <meta
          name="description"
          content="Encontre profissionais confiáveis em segundos ou ofereça seus serviços sem comissões abusivas. Plataforma leve, segura e feita para o Brasil que trabalha."
        />
        <meta
          name="keywords"
          content="bico, serviços, profissionais, renda extra, trabalho, freelancer, diarista, pedreiro, eletricista, pintor"
        />
        <meta property="og:title" content="Bico Brasil - Conecte-se a Quem Resolve" />
        <meta
          property="og:description"
          content="Serviços rápidos e renda extra na sua cidade. Sem intermediários, sem comissões abusivas."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://bicobrasil.com.br" />

        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Bico Brasil",
            "description": "Plataforma que conecta quem precisa de serviços a profissionais qualificados",
            "url": "https://bicobrasil.com.br",
            "logo": "https://bicobrasil.com.br/logo.png",
            "areaServed": {
              "@type": "Country",
              "name": "Brazil"
            },
            "sameAs": [
              "https://instagram.com/bicobrasil",
              "https://facebook.com/bicobrasil"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-[#080C14] overflow-x-hidden selection:bg-blue-500/30 selection:text-white">
        <Header />
        <SalesAnnouncementBar />
        <main>
          <SalesHeroSection />
          <CategoriesGrid />
          <ProviderSection />
          <HowItWorks />
          <SecuritySection />
          <SalesFAQ />
        </main>
        <SalesFooter />
      </div>
    </>
  );
};

export default SalesLandingPage;


