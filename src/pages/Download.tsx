import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Smartphone, Chrome } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function DownloadPage() {
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSBrowser = isIOS && !window.matchMedia('(display-mode: standalone)').matches;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo em Destaque */}
          <div className="mb-8">
            <img src={logo} alt="Bico Brasil" className="h-32 w-32 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2 text-foreground">Bico Brasil</h1>
            <p className="text-xl text-muted-foreground">
              Profissionais e Ajudantes na Palma da Mão
            </p>
          </div>

          {/* Botões de Download */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <Card className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Smartphone className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Instalar como App</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Acesso rápido direto da tela inicial
                  </p>
                </div>
                <Button size="lg" className="w-full" asChild>
                  <a href="/install-app">
                    <Download className="mr-2 h-5 w-5" />
                    Instalar Agora
                  </a>
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Chrome className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Usar no Navegador</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sem instalação, acesso imediato
                  </p>
                </div>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <a href="/">
                    Acessar Agora
                  </a>
                </Button>
              </div>
            </Card>
          </div>

          {/* Nota para iOS */}
          {isIOSBrowser && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                📱 Nota para iPhone/iPad
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                No iOS, instale pelo Safari: toque em Compartilhar e escolha “Adicionar à Tela de Início”.
              </p>
            </div>
          )}

          {/* Instruções Rápidas */}
          <div className="text-left bg-muted p-6 rounded-lg">
            <h3 className="font-bold mb-4 text-foreground">📱 Como Instalar:</h3>
            {isAndroid && (
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Abra este site no Chrome</li>
                <li>Toque nos 3 pontos (⋮) no canto superior direito</li>
                <li>Selecione "Adicionar à tela inicial"</li>
                <li>Confirme e pronto! O app estará na sua tela inicial</li>
              </ol>
            )}
            {isIOSBrowser && (
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Abra este site no Safari</li>
                <li>Toque no ícone de compartilhar (□↑)</li>
                <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                <li>Toque em "Adicionar" e pronto!</li>
              </ol>
            )}
            {!isAndroid && !isIOS && (
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Abra este site no Chrome, Edge ou Safari</li>
                <li>Procure o ícone de instalação na barra de endereço</li>
                <li>Clique em "Instalar" e pronto!</li>
              </ol>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
