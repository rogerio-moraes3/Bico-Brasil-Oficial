import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, TrendingUp, Globe, Wallet, ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  { icon: Globe, text: "Seu perfil aparece nas buscas locais" },
  { icon: TrendingUp, text: "Página exclusiva que serve como seu portfólio" },
  { icon: Wallet, text: "Fique com 100% do valor do seu serviço" },
];

export const ProviderSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 bg-[#080C14] text-white relative overflow-hidden border-t border-white/5">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-400/20 rounded-full px-4 py-2 mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase">PARA PRESTADORES</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight text-white">
              Transforme seu talento <br />
              em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">renda imediata.</span>
            </h2>

            <p className="text-zinc-400 mb-10 text-lg md:text-xl leading-relaxed max-w-lg font-medium">
              Pare de pagar taxas abusivas por cada serviço. No Bico Brasil, você é dono do seu trabalho e fica com 100% do que ganha.
            </p>

            <div className="space-y-4 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-zinc-300 text-base md:text-lg font-medium group-hover:text-white transition-colors">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/offer-services")}
              className="group flex items-center gap-2 bg-white text-black hover:bg-zinc-90 px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-[1.04] active:scale-95"
            >
              Começar a Ganhar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Right Stats Grid */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4 md:gap-6">

              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                layout={false}
                className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 hover:bg-white/[0.04] flex flex-col justify-center items-center text-center group cursor-pointer will-change-transform"
              >
                <div className="text-5xl lg:text-7xl font-black text-white mb-2 tracking-tighter">0%</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Taxa de Comissão</div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                layout={false}
                className="bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20 rounded-[32px] p-8 hover:border-blue-500/40 flex flex-col justify-center items-center text-center group cursor-pointer will-change-transform"
                initial={{ y: 48 }}
                whileInView={{ y: 48 }}
                viewport={{ once: true }}
              >
                <Zap className="w-8 h-8 text-blue-400 mb-4" />
                <div className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">Direto</div>
                <div className="text-[10px] font-bold text-blue-400/70 uppercase tracking-[0.2em]">No seu WhatsApp</div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                layout={false}
                className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[32px] p-8 hover:border-emerald-500/40 flex flex-col justify-center items-center text-center group cursor-pointer will-change-transform"
              >
                <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
                <div className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">Verificado</div>
                <div className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-[0.2em]">Selo de Confiança</div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                layout={false}
                className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 hover:bg-white/[0.04] flex flex-col justify-center items-center text-center group cursor-pointer will-change-transform"
                initial={{ y: 48 }}
                whileInView={{ y: 48 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl lg:text-7xl font-black text-white mb-2 tracking-tighter">SEO</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Busca do Google</div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

