import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SalesFooter } from '@/components/sales/SalesFooter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, Rocket, Heart, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-white selection:bg-blue-500/30">
      <Header />

      <main className="flex-grow overflow-hidden">
        {/* Hero Section - About */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 border-b border-white/5 bg-gradient-to-br from-[#0B1C2E] via-[#080C14] to-[#080C14]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/4" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Button
                variant="ghost"
                onClick={() => safeGoBack(navigate)}
                className="mb-12 text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded-xl font-bold flex items-center gap-2 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Voltar
              </Button>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-10">
                <Sparkles className="w-3 h-3" />
                <span>Nossa Essência</span>
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black leading-[0.9] tracking-tighter mb-12">
                Mais que uma <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">plataforma.</span>
              </h1>

              <p className="text-xl md:text-3xl text-blue-100/60 max-w-3xl leading-relaxed font-medium">
                O Bico Brasil nasceu para ser o elo direto entre quem precisa de uma solução agora e quem quer trabalhar perto, sem burocracia e com foco total na comunidade local.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Vision/Mission Grid */}
        <section className="py-24 md:py-40 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: "Nossa Missão",
                  desc: "Facilitar a vida do brasileiro, conectando contratantes a prestadores em segundos, removendo intermediários abusivos.",
                  color: "bg-blue-500/10 text-blue-400"
                },
                {
                  icon: Heart,
                  title: "Nosso Propósito",
                  desc: "Dar dignidade e visibilidade ao trabalhador autônomo, permitindo que ele gerencie sua própria renda e contatos.",
                  color: "bg-pink-500/10 text-pink-400"
                },
                {
                  icon: ShieldCheck,
                  title: "Nossa Garantia",
                  desc: "Segurança e veracidade. Validamos perfis para que você possa contratar e trabalhar com total tranquilidade.",
                  color: "bg-emerald-500/10 text-emerald-400"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="p-10 rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500"
                >
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-blue-100/50 leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Why Section */}
        <section className="py-24 md:py-40 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2" />
           <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tighter leading-tight">
                 Não somos agência. <br />
                 Somos o <span className="text-blue-400">canal direto.</span>
              </h2>
              <p className="text-xl text-blue-100/60 leading-relaxed font-medium mb-12">
                 Ao contrário de outras plataformas, nós não cobramos comissões sobre o seu trabalho. Você negocia, você executa, e você recebe 100% do valor. Oferecemos apenas as ferramentas e a visibilidade para você decolar.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                 <Link 
                    to="/auth?mode=signup"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all hover:scale-105"
                 >
                    Começar Agora
                 </Link>
                 <Link 
                    to="/premium"
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black transition-all"
                 >
                    Ver Planos Premium
                 </Link>
              </div>
           </div>
        </section>

        {/* Legal links summary */}
        <section className="py-20">
           <div className="max-w-xl mx-auto px-6 text-center">
              <p className="text-sm text-blue-100/30 font-bold uppercase tracking-widest leading-loose">
                 Consulte nossos{' '}
                 <Link to="/terms" className="text-blue-400 hover:underline">Termos de Uso</Link> 
                 {' '}e{' '}
                 <Link to="/privacy" className="text-blue-400 hover:underline">Privacidade</Link> 
                 {' '}para entender como protegemos você e seus dados.
              </p>
           </div>
        </section>
      </main>

      <SalesFooter />
    </div>
  );
}

