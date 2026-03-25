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
import { Button } from "@/components/ui/button";

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
        <title>Bico Brasil</title>
        <meta name="description" content="Bico Brasil — O que você precisa agora?" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background relative">
        <Header />

        <main id="main-content" className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-center">Bico Brasil</h1>
          <p className="text-lg text-muted-foreground text-center max-w-sm">O que você precisa agora?</p>

          <div className="w-full max-w-sm flex flex-col gap-3 mt-6">
            <Button onClick={() => navigate('/want-to-work')} size="lg" className="w-full h-12 font-semibold rounded-xl">Quero trabalhar</Button>
            <Button onClick={() => navigate('/want-someone')} size="lg" variant="outline" className="w-full h-12 font-semibold rounded-xl">Quero alguém pra trabalhar</Button>
          </div>

          <p className="text-sm text-muted-foreground mt-2">Acesse rapidamente as opções para buscar ou publicar trabalhos.</p>
        </main>

        <Footer />
      </div>
    </>
  );
}
