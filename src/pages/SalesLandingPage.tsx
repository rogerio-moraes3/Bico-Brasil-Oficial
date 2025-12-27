import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { SalesAnnouncementBar } from "@/components/sales/SalesAnnouncementBar";
import { SalesHeroSection } from "@/components/sales/SalesHeroSection";
import { InstitutionalBlock } from "@/components/sales/InstitutionalBlock";
import { TrustBar } from "@/components/sales/TrustBar";
import { ComparisonTable } from "@/components/sales/ComparisonTable";
import { HowItWorks } from "@/components/sales/HowItWorks";
import { CategoriesGrid } from "@/components/sales/CategoriesGrid";
import { ProviderSection } from "@/components/sales/ProviderSection";
import { SecuritySection } from "@/components/sales/SecuritySection";
import { SalesFAQ } from "@/components/sales/SalesFAQ";
import { SalesFooter } from "@/components/sales/SalesFooter";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

      <div className="min-h-screen bg-background">
        <SalesAnnouncementBar />
        <SalesHeroSection />
        <InstitutionalBlock />
        <TrustBar />
        <ComparisonTable />
        <HowItWorks />
        <CategoriesGrid />
        <ProviderSection />
        <SecuritySection />
        <SalesFAQ />
        <SalesFooter />
      </div>
    </>
  );
};

export default SalesLandingPage;
