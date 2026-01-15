import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-16 pb-20 md:pb-16">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => safeGoBack(navigate)}
          className="mb-4 text-[var(--nav-link)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-[var(--nav-link)]" />
          Voltar
        </Button>
        <div className="max-w-md mx-auto text-center animate-fade-in">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4 animate-scale-in" />
          <h1 className="text-3xl font-bold mb-4">Pagamento Não Realizado</h1>
          <p className="text-muted-foreground mb-8">
            Houve um problema ao processar seu pagamento. Nenhuma cobrança foi efetuada.
            Por favor, tente novamente.
          </p>

          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              Tentar Novamente
            </Button>
            <Button onClick={() => navigate('/jobs')} variant="outline" className="w-full">
              Voltar para Trabalhos
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}