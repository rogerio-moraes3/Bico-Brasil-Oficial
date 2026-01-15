import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';


export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-16 pb-20 md:pb-16">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => safeGoBack(navigate)}
            className="mb-4 text-[var(--nav-link)]"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-[var(--nav-link)]" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-8">Sobre o Bico Brasil</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6">
              O Bico Brasil é uma plataforma que conecta contratantes e prestadores de
              serviços para trabalhos manuais em todo o Brasil. Atualmente estamos
              liberando o acesso às regiões aos poucos.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">O que fazemos</h2>
            <p className="mb-6">
              Não somos empregador nem agência — somos um canal de conexão. Oferecemos
              planos de visibilidade, ferramentas de validação de perfil (vídeo, e-mail,
              telefone) e suporte para impulsionar seu trabalho.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Como funciona</h2>
            <p className="mb-6">
              Ao contratar, o usuário negocia data, horas e pagamento diretamente com o
              profissional. Para administração e métricas, temos painel restrito a
              administradores.
            </p>

            <div className="bg-muted p-6 rounded-lg mt-8">
              <p className="text-sm text-muted-foreground">
                Consulte{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>{' '}
                para detalhes legais e responsabilidades.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
