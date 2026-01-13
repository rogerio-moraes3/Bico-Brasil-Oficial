import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';
import { Loader2, Settings } from 'lucide-react';
import logo from '@/assets/logo.png';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function PreLaunchLanding() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cidade: '',
    tipo_interesse: ''
  });

  useEffect(() => {
    loadSubscriberCount();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setIsAdmin(false);
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      const { data: colaboradorData } = await supabase
        .from("colaboradores_autorizados")
        .select("email")
        .ilike("email", user.email)
        .maybeSingle();

      setIsAdmin(!!colaboradorData);
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
      setIsAdmin(false);
      setIsLoggedIn(false);
    }
  };

  const loadSubscriberCount = async () => {
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });
    setSubscriberCount(count || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.cidade || !formData.tipo_interesse) {
      toast({
        title: "Preencha todos os campos",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('registrations')
        .insert([{ ...formData, source: 'landing' }]);

      if (error) {
        toast({
          title: "Erro ao cadastrar",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Notificar admins via edge function (passa formData diretamente)
      try {
        await supabase.functions.invoke('notify-new-lead', {
          body: { lead: { ...formData, created_at: new Date().toISOString() } }
        });
      } catch (err) {
        console.error('Erro ao notificar admins:', err);
      }

      toast({
        title: "Cadastro realizado!",
        description: "Você receberá um e-mail quando lançarmos 🎉"
      });
      setFormData({ nome: '', email: '', cidade: '', tipo_interesse: '' });
      loadSubscriberCount(); // Atualizar contador
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Bico Brasil - Em Breve</title>
        <meta name="description" content="O Bico Brasil está chegando. Conectando quem precisa trabalhar com quem precisa de ajuda." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Bico Brasil" className="h-12 w-12" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Bico Brasil</h1>
                <p className="text-xs text-muted-foreground">Trabalhou, Tá Pago.</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            O Bico Brasil está chegando — e vai mudar a forma como você trabalha.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Uma plataforma simples, rápida e segura para conectar quem precisa trabalhar com quem precisa de ajuda. 
            Tudo isso sem burocracia, sem enrolação e com total liberdade.
          </p>
        </section>

        {/* Split Section: Trabalhar | Contratar */}
        <section className="grid md:grid-cols-2 gap-0 border-y border-border">
          {/* Lado Verde - Para quem quer trabalhar */}
          <div className="bg-[hsl(142,88%,40%)] text-white p-8 md:p-12">
            <h3 className="text-3xl font-bold mb-6">
              Se você precisa ganhar dinheiro HOJE, nós criamos isso para você.
            </h3>
            <p className="text-lg mb-6 opacity-95">
              Nada de esperar vagas, mandar currículo ou depender de sorte.
              <br />No Bico Brasil você encontra:
            </p>
            <ul className="space-y-3 mb-8 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Serviços reais, publicados por pessoas reais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Chance de ganhar no mesmo dia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Trabalho simples, direto, sem burocracia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Atividades rápidas, braçais ou especializadas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Liberdade total para escolher seus bicos</span>
              </li>
            </ul>
            <p className="text-base italic bg-white/10 p-4 rounded-lg">
              "Se você está precisando garantir o leite das crianças, pagar uma conta urgente ou fazer um dinheiro extra, 
              o Bico Brasil será o seu novo ponto de partida."
            </p>
          </div>

          {/* Lado Azul - Para quem precisa contratar */}
          <div className="bg-[hsl(220,98%,51%)] text-white p-8 md:p-12">
            <h3 className="text-3xl font-bold mb-6">
              Se você precisa de alguém para resolver um problema HOJE, nós resolvemos isso para você.
            </h3>
            <p className="text-lg mb-6 opacity-95">
              Publique um serviço em menos de 1 minuto e encontre pessoas dispostas a ajudar em:
            </p>
            <ul className="space-y-3 mb-8 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Pequenas reformas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Jardinagem</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Limpeza rápida</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Mudança e carregamento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Pintura</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Manutenção</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Tarefas simples e urgentes</span>
              </li>
            </ul>
            <p className="text-base italic bg-white/10 p-4 rounded-lg">
              "Chega de pedir ajuda em grupos de Facebook ou WhatsApp. 
              Aqui você encontra alguém pronto para resolver seu problema ainda hoje."
            </p>
          </div>
        </section>

        {/* Expectativa Section */}
        <section className="container mx-auto px-4 py-16 text-center max-w-3xl">
          <h3 className="text-3xl font-bold text-foreground mb-6">
            Estamos construindo algo GRANDE.
          </h3>
          <p className="text-lg text-muted-foreground mb-4">
            Uma plataforma feita para a vida real — para quem precisa trabalhar, 
            para quem precisa contratar, e para quem não tem tempo a perder.
          </p>
          <p className="text-base text-muted-foreground mb-8">
            Estamos terminando os últimos testes e ajustes.
            <br />
            <strong>E você pode ser um dos primeiros a entrar.</strong>
          </p>
        </section>

        {/* CTA Principal */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="text-center space-y-6 mb-8">
              <h3 className="text-3xl font-bold text-foreground">
                Quer ser avisado quando lançarmos?
              </h3>
              <p className="text-muted-foreground">
                Cadastre seu e-mail abaixo e receba acesso antecipado.
              </p>
              {subscriberCount > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-2xl">🎉</span>
                  <span className="text-sm font-medium">
                    <strong className="text-primary">{subscriberCount}</strong> {subscriberCount === 1 ? 'pessoa já está' : 'pessoas já estão'} na lista VIP
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                type="text"
                placeholder="Sua cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                required
              />
              <Select
                value={formData.tipo_interesse}
                onValueChange={(value) => setFormData({ ...formData, tipo_interesse: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="O que você procura?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fazer_bico">Quero fazer bicos</SelectItem>
                  <SelectItem value="anunciar_servico">Quero contratar profissionais</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="submit"
                size="lg"
                className="w-full text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Quero entrar na lista VIP'
                )}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground mt-4">
              Os primeiros inscritos poderão testar recursos, receber novidades antes de todo mundo 
              e ganhar vantagens no lançamento oficial.
            </p>
          </div>
        </section>

        {/* Seção Mistério */}
        <section className="container mx-auto px-4 py-16 text-center max-w-2xl">
          <p className="text-lg text-muted-foreground mb-4">
            O que estamos preparando ainda está em sigilo.
          </p>
          <p className="text-xl font-semibold text-foreground">
            Mas uma coisa eu posso dizer:
            <br />
            <span className="text-primary">vai facilitar a vida de muita gente.</span>
          </p>
        </section>

        {/* Seção Área Admin */}
        <section className="bg-primary/5 border-y border-primary/20 py-8">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              🔐 Área Admin
            </h3>
            {isAdmin ? (
              <Link to="/admin">
                <Button variant="outline" size="lg" className="gap-2 border-orange-600 text-orange-600 dark:border-white dark:text-white">
                  <Settings className="h-4 w-4" />
                  Acessar Painel
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="lg" className="border-orange-600 text-orange-600 dark:border-white dark:text-white">
                  Fazer Login
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Footer "Em Breve" */}
        <footer className="border-t border-border bg-muted py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-2xl font-bold text-foreground mb-2">Estamos quase lá.</p>
            <p className="text-lg text-muted-foreground mb-4">Fique pronto. O Bico Brasil está chegando.</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Lançamento em breve</p>
              <p>Você será avisado por e-mail</p>
              <p>Obrigado por participar dos primeiros passos do Bico Brasil</p>
            </div>
            
            {/* Link discreto para acesso admin - SEMPRE VISÍVEL */}
            <div className="mt-8">
              <Link 
                to={isAdmin ? "/admin" : "/auth"} 
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
              >
                🔐 Área Admin
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
