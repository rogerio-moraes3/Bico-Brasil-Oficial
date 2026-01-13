import { Button } from "@/components/ui/button";
import { Search, Briefcase } from "lucide-react";
// ... outros imports

// ... código anterior

// Substituir o trecho das linhas 50-69 por:

<div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
  <Button
    variant="outline"
    size="lg"
    onClick={() => navigate("/app")}
    className="border-orange-600 text-orange-600 dark:border-white dark:text-white flex items-center gap-2"
  >
    <Search className="w-5 h-5 text-orange-600 dark:text-white" />
    Buscar Profissional
  </Button>
  <span className="hidden sm:block text-orange-600 dark:text-white">|</span>
  <Button
    variant="outline"
    size="lg"
    ref={offerButtonRef}
    onClick={() => navigate("/app")}
    className="border-orange-600 text-orange-600 dark:border-white dark:text-white flex items-center gap-2"
  >
    <Briefcase className="w-5 h-5 text-orange-600 dark:text-white" />
    Oferecer Serviços
  </Button>
</div>

// ... restante do código
