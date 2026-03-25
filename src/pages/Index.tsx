import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Briefcase, Search } from "lucide-react";
import { useUserMode } from "@/contexts/UserModeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedServicesSection } from "@/components/FeaturedServicesSection";
import { CTASection } from "@/components/CTASection";
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
    const name = user?.user_metadata?.name?.split(" ")[0] || user?.email?.split("@")[0];
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

      <div className="min-h-screen flex flex-col bg-background relative">
        <Header />

        <main id="main-content" className="flex-1">
          {/* Hero CTA block */}
          <section className="container mx-auto px-4 pt-12 pb-8 flex flex-col items-center text-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{greeting}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">O que você precisa agora?</h1>
            <p className="text-base text-muted-foreground max-w-sm">Escolha como usar o Bico Brasil hoje.</p>

            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleProfessionalClick}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-left shadow-sm hover:border-primary/60 hover:shadow-[0_4px_20px_-4px_hsl(var(--xp-primary)/0.18)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Quero trabalhar</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Encontre bicos na sua cidade</p>
                </div>
              </button>

              <button
                onClick={handleContractorClick}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-left shadow-sm hover:border-primary/60 hover:shadow-[0_4px_20px_-4px_hsl(var(--xp-primary)/0.18)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Preciso contratar</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Busque profissionais verificados</p>
                </div>
              </button>
            </div>
          </section>

          {/* Featured workers */}
          <FeaturedServicesSection />

          {/* CTA for unauthenticated feel — still useful as content block */}
          <CTASection />
        </main>

        <Footer />
      </div>
    </>
  );
}
