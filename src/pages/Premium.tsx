import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlanCheckoutModal } from '@/components/PlanCheckoutModal';
import { DestaqueButton } from '@/components/DestaqueButton';
import { Check, Star, Zap, TrendingUp, Shield, Award, Users, MessageCircle, Eye, Crown, Trophy, ArrowLeft } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';
import { PlanBadge } from '@/components/PlanBadge';

export default function Premium() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ type: 'basico' | 'vip' | 'anual', amount: number, name: string } | null>(null);

  const planoBasico = [
    { icon: Eye, text: "Perfil visível em todas as buscas" },
    { icon: Users, text: "Aumente suas chances de ser contratado" },
    { icon: MessageCircle, text: "Chat direto com clientes" },
    { icon: Shield, text: "Selo de profissional verificado" },
    { icon: Award, text: "Sistema de avaliações" },
  ];

  const planoVIP = [
    { icon: Star, text: "Tudo do Plano Premium" },
    { icon: TrendingUp, text: "Prioridade nos resultados de busca" },
    { icon: Zap, text: "Notificações em tempo real" },
    { icon: Users, text: "Estatísticas de visualizações" },
    { icon: MessageCircle, text: "Suporte prioritário" },
    { icon: Crown, text: "Badge VIP no perfil" },
  ];

  const destaqueFeatures = [
    { icon: Star, text: "Seu perfil aparece no topo das buscas" },
    { icon: Zap, text: "Banner visual destacado com estrela dourada" },
    { icon: TrendingUp, text: "Aumenta suas contratações em até 300%" },
    { icon: Award, text: "Planos de 1 dia até 30 dias" },
    { icon: Check, text: "Funciona junto com seu plano atual" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 pb-20 md:pb-8 overflow-y-auto max-h-[calc(100vh-150px)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => safeGoBack(navigate)}
          className="mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2 text-foreground dark:text-white" />
          Voltar
        </Button>

        <Breadcrumbs />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Planos Premium
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para turbinar seu perfil e receber mais oportunidades de trabalho
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-7xl mx-auto">
            <Card className="relative border-2 border-[#FF6A00] hover:border-[#FF8A20] hover:shadow-[0_0_30px_rgba(255,106,0,0.3)] transition-all duration-300 flex flex-col hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl font-bold text-foreground">Premium</CardTitle>
                  <div className="absolute top-0 right-0 bg-slate-700 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-bl-lg shadow-lg">
                    POPULAR
                  </div>
                </div>
                <CardDescription className="text-base text-slate-700 dark:text-slate-300">Ideal para começar a receber trabalhos</CardDescription>
                <div className="mt-6 mb-4">
                  <span className="font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent drop-shadow-lg text-[2.5rem] leading-[1]">R$ 19,90</span>
                  <span className="text-slate-400 text-xl font-medium">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col pt-0">
                <ul className="space-y-4 mb-8 flex-grow">
                  {planoBasico.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="rounded-full bg-primary/10 p-1.5 mt-0.5 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-slate-900 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="lg" className="w-full text-base font-semibold border-2 border-[#FF6A00] text-[#FF6A00] dark:border-white dark:text-white shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-[1.02] transition-all duration-300" onClick={() => { if (user) { setSelectedPlan({ type: 'basico', amount: 19.90, name: 'Premium' }); setCheckoutOpen(true); } else { navigate('/auth'); } }}>Assinar</Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-[#FF6A00] hover:border-[#FF8A20] hover:shadow-[0_0_40px_rgba(255,106,0,0.4)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
              <PlanBadge variant="recommended" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">Plano VIP<Crown className="h-5 w-5 text-primary" /></CardTitle>
                </div>
                <CardDescription className="text-base text-slate-700 dark:text-slate-300">Destaque total e máxima visibilidade</CardDescription>
                <div className="mt-6 mb-4">
                  <span className="font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent drop-shadow-lg text-[2.5rem] leading-[1]">R$ 29,90</span>
                  <span className="text-slate-400 text-xl font-medium">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col pt-0">
                <ul className="space-y-4 mb-8 flex-grow">
                  {planoVIP.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="rounded-full bg-primary/10 p-1.5 mt-0.5 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-slate-900 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="lg" className="w-full text-base font-semibold border-2 border-[#FF6A00] text-[#FF6A00] dark:border-white dark:text-white shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-[1.02] transition-all duration-300" onClick={() => { if (user) { setSelectedPlan({ type: 'vip', amount: 29.90, name: 'VIP' }); setCheckoutOpen(true); } else { navigate('/auth'); } }}>Assinar</Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-[#FF6A00] hover:border-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
              <PlanBadge variant="best" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">Plano Anual<Trophy className="h-5 w-5 text-amber-500" /></CardTitle>
                </div>
                <CardDescription className="text-base text-slate-700 dark:text-slate-300">12 meses de Premium com 30% de desconto</CardDescription>
                <div className="mt-6 mb-4">
                  <span className="font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent drop-shadow-lg text-[2.5rem] leading-[1]">R$ 249,90</span>
                  <span className="text-slate-400 text-xl font-medium">/ano</span>
                  <p className="text-sm text-slate-400 mt-2 font-medium">Equivale a R$ 20,82/mês (economize R$ 108,90)</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col pt-0">
                <ul className="space-y-4 mb-8 flex-grow">
                  {planoBasico.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="rounded-full bg-amber-500/10 p-1.5 mt-0.5 group-hover:bg-amber-500/20 transition-colors">
                        <feature.icon className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="text-sm text-slate-900 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{feature.text}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 group border-t border-slate-700 pt-4 mt-4">
                    <div className="rounded-full bg-amber-500/10 p-1.5 mt-0.5 group-hover:bg-amber-500/20 transition-colors">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="text-sm font-semibold text-amber-400">Pague 1 ano e economize 30%!</span>
                  </li>
                </ul>
                <Button variant="outline" size="lg" className="w-full text-base font-semibold border-2 border-[#FF6A00] text-[#FF6A00] dark:border-white dark:text-white shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-[1.02] transition-all duration-300" onClick={() => { if (user) { setSelectedPlan({ type: 'anual', amount: 249.90, name: 'Anual' }); setCheckoutOpen(true); } else { navigate('/auth'); } }}>Assinar</Button>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-7xl mx-auto">
            <Card className="relative border-2 border-[#FF6A00] hover:border-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
              <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-bl-lg shadow-lg">
                ⭐ DESTAQUE
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">Anúncio Destaque<Star className="h-5 w-5 text-amber-500" /></CardTitle>
                </div>
                <CardDescription className="text-base text-slate-700 dark:text-slate-300">Apareça no topo da página inicial e aumente suas contratações</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col pt-0">
                <ul className="space-y-4 mb-8 flex-grow">
                  {destaqueFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="rounded-full bg-amber-500/10 p-1.5 mt-0.5 group-hover:bg-amber-500/20 transition-colors">
                        <feature.icon className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="text-sm text-slate-900 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-center"><DestaqueButton initialDays={1} /></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      {selectedPlan && (<PlanCheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} planType={selectedPlan.type} amount={selectedPlan.amount} planName={selectedPlan.name} />)}
    </div>
  );
}
