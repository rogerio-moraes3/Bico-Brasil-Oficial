import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Bell, Zap, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDeferredPwaPrompt, setDeferredPwaPrompt, type BeforeInstallPromptEvent } from '@/lib/pwaInstallPrompt';

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setDeferredPwaPrompt(e);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setDeferredPwaPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const promptEvent = deferredPrompt ?? getDeferredPwaPrompt();
    if (!promptEvent) {
      toast({
        title: "App já instalado ou navegador não suportado",
        description: "Use Chrome, Edge ou Safari para instalar o app.",
        variant: "destructive"
      });
      return;
    }

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      toast({
        title: "App instalado com sucesso!",
        description: "Agora você pode acessar o Bico Brasil direto da sua tela inicial."
      });
    }
    
    setDeferredPrompt(null);
    setDeferredPwaPrompt(null);
  };

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Acesso Rápido",
      description: "Abra o app direto da tela inicial, sem precisar abrir o navegador."
    },
    {
      icon: <Bell className="h-8 w-8 text-primary" />,
      title: "Notificações Push",
      description: "Receba alertas instantâneos de novos trabalhos e mensagens."
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: "Funciona Offline",
      description: "Acesse suas informações mesmo sem internet."
    }
  ];

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSBrowser = isIOS && !window.matchMedia('(display-mode: standalone)').matches;
  const isAndroid = /android/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
              <Download className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Instale o App Bico Brasil</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tenha acesso rápido aos melhores profissionais da sua região. 
              Instale nosso PWA e aproveite todos os benefícios!
            </p>
          </div>

          {isInstalled ? (
            <Card className="mb-8 border-green-500 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">App já instalado!</h3>
                    <p className="text-sm">Você pode acessar o Bico Brasil pela tela inicial do seu dispositivo.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <Button 
                  onClick={handleInstall} 
                  size="lg" 
                  className="w-full text-lg h-14"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Instalar App Agora
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Compatível com Chrome, Edge e Safari
                </p>
              </CardContent>
            </Card>
          )}

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

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Como Instalar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isIOSBrowser ? (
                <>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Abra o menu de compartilhar</h4>
                      <p className="text-sm text-muted-foreground">
                        Toque no ícone de compartilhar (quadrado com seta) na barra inferior do Safari.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Adicionar à Tela de Início</h4>
                      <p className="text-sm text-muted-foreground">
                        Role para baixo e toque em “Adicionar à Tela de Início”.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Confirme</h4>
                      <p className="text-sm text-muted-foreground">
                        Toque em "Adicionar" no canto superior direito.
                      </p>
                    </div>
                  </div>
                </>
              ) : isAndroid ? (
                <>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Clique no botão "Instalar App"</h4>
                      <p className="text-sm text-muted-foreground">
                        Ou toque nos 3 pontos (⋮) no menu do navegador.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Adicionar à tela inicial</h4>
                      <p className="text-sm text-muted-foreground">
                        Selecione "Adicionar à tela inicial" ou "Instalar app".
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Confirme a instalação</h4>
                      <p className="text-sm text-muted-foreground">
                        Toque em "Instalar" ou "Adicionar".
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Clique no botão "Instalar App"</h4>
                      <p className="text-sm text-muted-foreground">
                        O navegador solicitará permissão para instalar.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Confirme</h4>
                      <p className="text-sm text-muted-foreground">
                        Aceite a instalação na janela que aparecer.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Pronto!</h4>
                      <p className="text-sm text-muted-foreground">
                        O ícone aparecerá na sua tela inicial.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
