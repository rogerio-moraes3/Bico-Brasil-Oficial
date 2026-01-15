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

        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center gap-6 container-outline">
          <h1 className="text-2xl font-bold text-foreground">Bico Brasil</h1>
          <p className="text-lg text-foreground">O que você precisa agora?</p>

          <div className="w-full max-w-md flex flex-col gap-4 mt-6">
            <Button onClick={() => navigate('/want-to-work')} className="w-full h-12 font-semibold">Quero trabalhar</Button>
            <Button onClick={() => navigate('/want-someone')} className="w-full h-12 font-semibold">Quero alguém pra trabalhar</Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">Acesse rapidamente as opções para buscar ou publicar trabalhos.</p>
        </main>

        <Footer />
      </div>
    </>
  );
}
