import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
import logo from '@/assets/logo.png';

const categories = [
  { name: "Pedreiro", icon: "🏗️" },
  { name: "Faxina", icon: "🧹" },
  { name: "Ajudante de Mudança", icon: "📦" },
  { name: "Jardineiro", icon: "🌱" },
  { name: "Encanador", icon: "🔧" }
];

export default function Landing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation
    if (!email || !phone) {
      toast({
        title: "Preencha os campos",
        description: "E-mail e WhatsApp são obrigatórios",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Here you would save to database
    toast({
      title: "Obrigado!",
      description: "Em breve entraremos em contato"
    });

    setTimeout(() => {
      navigate('/auth?mode=signup');
    }, 1500);

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Bico Brasil - Precisou de ajuda agora? Resolva na hora</title>
        <meta name="description" content="Encontre pedreiros, ajudantes, faxineiras e profissionais da sua cidade em segundos. Bico Brasil - Presidente Prudente-SP" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 pb-20 overflow-y-auto">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <img src={logo} alt="Bico Brasil" className="h-32 w-32 mx-auto mb-8" />

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Precisou de ajuda agora?
          </h1>
          <p className="text-3xl font-semibold text-primary mb-6">
            Bico Brasil resolve na hora.
          </p>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            👉 Conectamos pessoas que precisam de ajuda urgente com profissionais qualificados ou com ajudantes capacitados para serviços gerais que não exigem cursos ou diplomas. Rápido, fácil e seguro.
          </p>

          <Button
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => navigate('/auth?mode=signup')}
          >
            Cadastrar agora gratuitamente
          </Button>
        </section>

        {/* Como Funciona */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 text-center">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="font-semibold text-xl mb-2">1. Peça um serviço</h3>
                <p className="text-muted-foreground">
                  Publique o que você precisa em segundos
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-5xl mb-4">👷</div>
                <h3 className="font-semibold text-xl mb-2">2. Escolha o profissional</h3>
                <p className="text-muted-foreground">
                  Veja avaliações e escolha quem preferir
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-semibold text-xl mb-2">3. Resolva agora</h3>
                <p className="text-muted-foreground">
                  Converse direto no WhatsApp e resolva
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Categorias Populares */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Categorias Populares</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {categories.map((cat) => (
                <Card
                  key={cat.name}
                  className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/jobs')}
                >
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <p className="font-medium">{cat.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Formulário de Captação */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 max-w-xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Cadastre-se agora e comece a trabalhar
            </h2>
            <p className="mb-8">
              Deixe seus dados e entraremos em contato
            </p>

            <form onSubmit={handleCapture} className="space-y-4">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-gray-900"
                required
              />
              <Input
                type="tel"
                placeholder="Seu WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white text-gray-900"
                required
              />
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Quero me cadastrar'}
              </Button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-6 md:py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center gap-4 md:gap-6 mb-3 md:mb-4 text-sm md:text-base">
              <button type="button" onClick={() => navigate('/terms')} className="hover:text-primary">
                Termos de Uso
              </button>
              <button type="button" onClick={() => navigate('/privacy')} className="hover:text-primary">
                Privacidade
              </button>
              <a href="mailto:contato@bicobrasil.com" className="hover:text-primary">
                Contato
              </a>
            </div>
            <p className="text-xs md:text-sm text-gray-400">
              © 2025 Bico Brasil - Presidente Prudente-SP
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
