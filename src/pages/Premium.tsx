import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SalesFooter } from '@/components/sales/SalesFooter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlanCheckoutModal } from '@/components/PlanCheckoutModal';
import { DestaqueButton } from '@/components/DestaqueButton';
import { Check, Star, Zap, TrendingUp, Shield, Award, Users, MessageCircle, Eye, Crown, Trophy, ArrowLeft, Sparkles, Rocket } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Premium() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ type: 'basico' | 'vip' | 'anual', amount: number, name: string } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-white selection:bg-blue-500/30">
      <Header />

      <main className="flex-grow overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[160px] rounded-full -translate-y-1/2" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
             >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-10">
                  <Sparkles className="w-3 h-3" />
                  <span>Cresça seu negócio</span>
                </div>

                <h1 className="text-6xl md:text-[100px] font-black leading-[0.85] tracking-tighter mb-12">
                   Planos <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500">Premium.</span>
                </h1>

                <p className="text-xl md:text-3xl text-blue-100/60 max-w-3xl mx-auto leading-relaxed font-medium mb-20">
                   Escolha o plano ideal para turbinar seu perfil e ser o primeiro a ser chamado na sua cidade.
                </p>
             </motion.div>
          </div>
        </section>

        {/* Pricing Grid */}
        <section className="pb-32 md:pb-48 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              
              {/* Premium Basico */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative flex flex-col p-10 rounded-[48px] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-black mb-2">Premium</h3>
                  <p className="text-blue-100/40 font-bold text-sm uppercase tracking-widest">Essencial para começar</p>
                </div>
                
                <div className="mb-12">
                   <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white">R$ 19,90</span>
                      <span className="text-blue-100/40 font-bold text-lg">/mês</span>
                   </div>
                </div>

                <ul className="space-y-6 mb-12 flex-grow">
                   {planoBasico.map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-blue-100/70 font-medium">
                         <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-blue-400" />
                         </div>
                         {item.text}
                      </li>
                   ))}
                </ul>

                <button 
                  onClick={() => { if (user) { setSelectedPlan({ type: 'basico', amount: 19.90, name: 'Premium' }); setCheckoutOpen(true); } else { navigate('/auth'); } }}
                  className="w-full py-6 bg-white/5 hover:bg-white/10 text-white font-black text-xl rounded-[24px] border border-white/10 transition-all active:scale-95"
                >
                   Assinar Agora
                </button>
              </motion.div>

              {/* Plano VIP - The Most Featured */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group relative flex flex-col p-10 rounded-[48px] bg-gradient-to-b from-blue-600/20 to-blue-600/5 border-2 border-blue-500/30 backdrop-blur-2xl shadow-[0_32px_80px_-20px_rgba(30,94,255,0.3)] transition-all duration-500 transform lg:-translate-y-6"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_10px_30px_rgba(30,94,255,0.4)]">
                   Recomendado
                </div>

                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-black text-white">Plano VIP</h3>
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-blue-200/60 font-bold text-sm uppercase tracking-widest">Visibilidade Máxima</p>
                </div>
                
                <div className="mb-12">
                   <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white">R$ 29,90</span>
                      <span className="text-blue-100/40 font-bold text-lg">/mês</span>
                   </div>
                </div>

                <ul className="space-y-6 mb-12 flex-grow">
                   {planoVIP.map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-white font-bold">
                         <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" />
                         </div>
                         {item.text}
                      </li>
                   ))}
                </ul>

                <button 
                  onClick={() => { if (user) { setSelectedPlan({ type: 'vip', amount: 29.90, name: 'VIP' }); setCheckoutOpen(true); } else { navigate('/auth'); } }}
                  className="w-full py-6 bg-white text-black hover:bg-zinc-500 font-black text-2xl rounded-[24px] shadow-[0_20px_40px_rgba(255,255,255,0.15)] transition-all hover:scale-110 active:scale-95"
                >
                   Ser VIP Agora
                </button>
              </motion.div>

              {/* Plano Anual */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative flex flex-col p-10 rounded-[48px] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-black mb-2">Anual</h3>
                  <p className="text-blue-100/40 font-bold text-sm uppercase tracking-widest">Economize 30%</p>
                </div>
                
                <div className="mb-12">
                   <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white">R$ 249,90</span>
                      <span className="text-blue-100/40 font-bold text-lg">/ano</span>
                   </div>
                   <p className="text-xs text-blue-400 font-black mt-2 uppercase tracking-widest">R$ 20,82 /mês</p>
                </div>

                <ul className="space-y-6 mb-12 flex-grow">
                   {planoBasico.map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-blue-100/70 font-medium">
                         <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-blue-400" />
                         </div>
                         {item.text}
                      </li>
                   ))}
                   <li className="flex items-center gap-4 text-blue-400 font-black pt-4 border-t border-white/5">
                      <Zap className="w-5 h-5" />
                      Economia de R$ 108,90
                   </li>
                </ul>

                <button 
                  onClick={() => { if (user) { setSelectedPlan({ type: 'anual', amount: 249.90, name: 'Anual' }); setCheckoutOpen(true); } else { navigate('/auth'); } }}
                  className="w-full py-6 bg-white/5 hover:bg-white/10 text-white font-black text-xl rounded-[24px] border border-white/10 transition-all active:scale-95"
                >
                   Assinar Anual
                </button>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Destaque Section - High Impact */}
        <section className="py-24 md:py-40 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent border-t border-white/5">
           <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                 <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase rounded-full bg-yellow-500/10 border border-yellow-400/20 text-yellow-400 mb-8">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Boost Instantâneo</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
                       Ocupe o <br />
                       <span className="text-yellow-400">Topo.</span>
                    </h2>
                    <p className="text-xl text-blue-100/60 leading-relaxed font-medium mb-10 max-w-md">
                       O Anúncio Destaque coloca você em evidência máxima na página inicial e no topo das buscas, aumentando suas chances em até 3x.
                    </p>
                    <ul className="space-y-6 mb-12">
                       {destaqueFeatures.map((item, i) => (
                          <li key={i} className="flex items-center gap-4 text-white font-bold">
                             <div className="w-6 h-6 rounded-lg bg-yellow-400/20 flex items-center justify-center shrink-0">
                                <item.icon className="w-3.5 h-3.5 text-yellow-400" />
                             </div>
                             {item.text}
                          </li>
                       ))}
                    </ul>
                    <DestaqueButton initialDays={1} />
                 </div>

                 <div className="relative">
                    <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] rounded-full" />
                    <motion.div 
                       animate={{ y: [0, -20, 0] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       className="relative bg-[#1A1F2C] p-8 rounded-[40px] border border-white/10 shadow-2xl"
                    >
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-full bg-zinc-800" />
                          <div className="flex-1 space-y-2">
                             <div className="w-24 h-4 bg-zinc-800 rounded" />
                             <div className="w-16 h-3 bg-zinc-800/50 rounded" />
                          </div>
                          <div className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-full">DESTAQUE</div>
                       </div>
                       <div className="space-y-4">
                          <div className="w-full h-4 bg-zinc-800 rounded" />
                          <div className="w-3/4 h-4 bg-zinc-800 rounded" />
                          <div className="w-1/2 h-4 bg-zinc-800/50 rounded" />
                       </div>
                    </motion.div>
                 </div>
              </div>
           </div>
        </section>

      </main>
      
      <SalesFooter />

      {selectedPlan && (
        <PlanCheckoutModal 
          open={checkoutOpen} 
          onOpenChange={setCheckoutOpen} 
          planType={selectedPlan.type} 
          amount={selectedPlan.amount} 
          planName={selectedPlan.name} 
        />
      )}
    </div>
  );
}

