import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Briefcase, Search, ArrowRight, Sparkles } from "lucide-react";
import { useUserMode } from "@/contexts/UserModeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedServicesSection } from "@/components/FeaturedServicesSection";
import { CTASection } from "@/components/CTASection";
import { PlatformStatsStrip } from "@/components/PlatformStatsStrip";
import { PlatformAuthoritySection } from "@/components/PlatformAuthoritySection";
import { RecentWorkersSection } from "@/components/RecentWorkersSection";
import { TrustStrip } from "@/components/TrustStrip";
import { ProfileCompletionWidget } from "@/components/ProfileCompletionWidget";
import { HowItWorks } from "@/components/sales/HowItWorks";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { mode, setMode } = useUserMode();
  const { user } = useAuth();

  const handleContractorClick = () => {
    setMode("contractor");
    navigate("/search-workers");
  };

  const handleProfessionalClick = () => {
    setMode("professional");
    navigate("/procurar-bicos");
  };

  const greeting = (() => {
    const rawName = user?.user_metadata?.name?.split(" ")[0] || user?.email?.split("@")[0];
    const name = rawName && rawName.length > 0 ? rawName : null;
    const hour = new Date().getHours();
    const period = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    return name ? `${period}, ${name}` : period;
  })();

  return (
    <>
      <Helmet>
        <title>Bico Brasil</title>
        <meta name="description" content="Bico Brasil — O que você precisa agora?" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background relative bb-surface-muted">
        <Header />
        <PlatformStatsStrip />

        <main id="main-content" className="flex-1">
          {/* Trust strip */}
          <TrustStrip />

          {/* Profile completion widget (logged in users only) */}
          <ProfileCompletionWidget />

          {/* Hero CTA block */}
          <section className="hero-bg bb-surface-soft container mx-auto px-4 pt-16 pb-14 md:pt-20 md:pb-16 flex flex-col items-center text-center gap-3 md:gap-4">
            <div className="inline-flex items-center gap-2 bg-primary/[0.08] rounded-full px-3.5 py-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85">{greeting}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.1]">
              O que você precisa hoje?
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mt-1.5">
              Conecte-se ao trabalhador certo na sua cidade — ou encontre o próximo bico.
            </p>

            <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
              {/* Primary: hire */}
              <button
                onClick={handleContractorClick}
                className="group flex flex-col items-start gap-3 rounded-3xl border border-primary/55 dark:border-primary/35 bg-primary/[0.12] dark:bg-primary/12 p-6 shadow-[0_14px_34px_rgba(15,91,214,0.28)] hover:shadow-[0_18px_38px_rgba(15,91,214,0.30)] hover:border-primary/70 hover:bg-primary/[0.16] hover:scale-[1.02] transition-all duration-200 stagger-fade"
                style={{ ["--stagger-delay" as string]: "0ms" }}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors duration-200">
                  <Search className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-extrabold text-foreground text-[17px] leading-snug">Encontrar profissionais agora</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Busque profissionais verificados perto de você
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors duration-200">
                  Buscar agora <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </div>
              </button>

              {/* Secondary: work */}
              <button
                onClick={handleProfessionalClick}
                className="group flex flex-col items-start gap-3 rounded-3xl border border-[rgba(15,23,42,0.08)] dark:border-border/70 bg-card/90 p-6 shadow-sm hover:shadow-md hover:bg-card dark:shadow-sm hover:scale-[1.02] transition-all duration-200 stagger-fade"
                style={{ ["--stagger-delay" as string]: "80ms" }}
              >
                <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center group-hover:bg-muted transition-colors duration-200">
                  <Briefcase className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground text-[15px] leading-snug">Começar a ganhar dinheiro</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Encontre bicos e ganhe renda extra hoje
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200">
                  Ver vagas <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </div>
              </button>
            </div>

            {/* Quick-nav pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["Pedreiro", "Diarista", "Eletricista", "Jardineiro", "Pintor"].map((cat) => (
                <Button
                  key={cat}
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 px-4 text-xs font-medium border-border/70 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  onClick={() => navigate(`/search-workers?q=${encodeURIComponent(cat)}`)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </section>

          {/* Featured workers */}
          <FeaturedServicesSection />

          {/* Novos profissionais — horizontal strip */}
          <RecentWorkersSection />

          {/* How it works */}
          <HowItWorks />

          {/* Platform authority block */}
          <PlatformAuthoritySection />

          {/* Final CTA */}
          <CTASection />
        </main>

        <Footer />
      </div>
    </>
  );
}
