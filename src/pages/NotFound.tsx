import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <p className="mb-6 text-2xl font-semibold">Página não encontrada</p>
          <p className="mb-8 text-muted-foreground">A página que você está procurando não existe ou foi movida.</p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => safeGoBack(navigate)}
              className="text-[var(--nav-link)]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Ir para Início
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
