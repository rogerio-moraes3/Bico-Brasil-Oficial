import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeft } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-16 pb-20 md:pb-16">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => safeGoBack(navigate)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="max-w-md mx-auto text-center animate-fade-in">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-scale-in" />
          <h1 className="text-3xl font-bold mb-4">Pagamento Pendente</h1>
          <p className="text-muted-foreground mb-8">
            Seu pagamento está sendo processado. Você receberá uma confirmação assim que for aprovado.
            Isso pode levar alguns minutos.
          </p>
          
          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar para Início
            </Button>
            <Button onClick={() => navigate('/jobs')} variant="outline" className="w-full">
              Ver Trabalhos
            </Button>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Se você pagou via Pix, a confirmação geralmente ocorre em segundos.
              Para cartão de crédito/débito, pode levar alguns minutos.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}