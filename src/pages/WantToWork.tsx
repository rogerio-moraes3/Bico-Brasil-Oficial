import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Search, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WantToWork() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold text-foreground">Quero trabalhar</h1>
        <p className="text-muted-foreground">Como você quer trabalhar?</p>

        <div className="w-full max-w-md flex flex-col gap-3 mt-6">
          <Button onClick={() => navigate('/procurar-bicos')} className="w-full h-12 flex items-center justify-center gap-2 font-semibold">
            <Search className="w-4 h-4" />
            Buscar bicos
          </Button>
          <Button onClick={() => navigate('/offer-services')} className="w-full h-12 flex items-center justify-center gap-2 font-semibold">
            <Briefcase className="w-4 h-4" />
            Oferecer meus serviços
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
} 
