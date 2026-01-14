import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timeout = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

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
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4 animate-scale-in" />
          <h1 className="text-3xl font-bold mb-4">Pagamento Confirmado!</h1>
          <p className="text-muted-foreground mb-8">
            Seu Plano Pro foi ativado com sucesso. Agora você terá maior visibilidade
            e mais oportunidades de trabalho!
          </p>

          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar para Início
            </Button>
            <Button onClick={() => navigate('/jobs')} variant="outline" className="w-full">
              Ver Trabalhos Disponíveis
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Você será redirecionado automaticamente em alguns segundos...
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}