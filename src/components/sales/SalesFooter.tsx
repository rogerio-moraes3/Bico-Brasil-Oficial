import { Link, useNavigate } from "react-router-dom";
import { Instagram, Facebook, Mail, ArrowRight, Sparkles, ShieldCheck, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";

export const SalesFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#080C14] text-zinc-400 relative overflow-hidden">
      {/* Final CTA Section - Ultra Premium */}
      <section className="relative py-32 md:py-48 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,94,255,0.1),transparent_70%)] pointer-events-none" />
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-2 mb-10 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">O futuro do trabalho local</span>
          </motion.div>

          <h2 className="text-6xl md:text-8xl lg:text-[120px] font-black mb-12 tracking-tighter text-white leading-[0.85] select-none">
            Resolva sua <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 animate-pulse">vida agora.</span>
          </h2>
          
          <p className="text-xl md:text-3xl text-blue-100/60 mb-16 max-w-3xl mx-auto font-medium leading-relaxed">
            Seja para contratar um profissional em minutos ou para conquistar novos clientes, o Bico Brasil é o seu lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="group relative flex items-center gap-3 bg-[#FF5C35] hover:bg-[#FF451A] text-white px-12 py-6 rounded-[24px] font-black text-2xl shadow-[0_20px_60px_rgba(255,92,53,0.3)] transition-all duration-300 hover:scale-[1.05] active:scale-95 w-full sm:w-auto justify-center"
            >
              Criar Conta Grátis
              <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/app")}
              className="px-12 py-6 text-2xl font-black text-white border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-[24px] transition-all hover:scale-[1.05] active:scale-95 w-full sm:w-auto"
            >
              Explorar Serviços
            </button>
          </div>

          {/* Trust Pills */}
          <div className="mt-24 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Seguro
             </div>
             <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                <Zap className="w-5 h-5 text-blue-400" />
                Rápido
             </div>
             <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                <Globe className="w-5 h-5 text-blue-400" />
                Nacional
             </div>
          </div>
        </div>
      </section>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
          <div className="md:col-span-2 max-w-md">
            <span className="text-3xl font-black text-white mb-8 block tracking-tighter">BICO BRASIL</span>
            <p className="text-lg leading-relaxed mb-10 text-blue-100/50 font-medium">
              A plataforma definitiva para quem trabalha e para quem resolve. Tecnologia feita para brasileiros de verdade.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-400 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:col-span-2 gap-12">
            <div>
              <h4 className="text-white font-black mb-8 uppercase text-xs tracking-[0.2em]">Plataforma</h4>
              <ul className="space-y-6 text-base font-bold">
                <li><Link to="/app" className="hover:text-blue-400 transition-colors">Buscar Bicos</Link></li>
                <li><Link to="/offer-services" className="hover:text-blue-400 transition-colors">Anunciar Meus Serviços</Link></li>
                <li><Link to="/premium" className="hover:text-blue-400 transition-colors">Planos para Profissionais</Link></li>
                <li><Link to="/auth" className="hover:text-blue-400 transition-colors">Área do Usuário</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-8 uppercase text-xs tracking-[0.2em]">Institucional</h4>
              <ul className="space-y-6 text-base font-bold">
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">Nossa Missão</Link></li>
                <li><Link to="/faq" className="hover:text-blue-400 transition-colors">Central de Ajuda</Link></li>
                <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-16 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
          <p>© {new Date().getFullYear()} Bico Brasil. Todos os direitos reservados.</p>
          <p className="mt-6 md:mt-0 opacity-40">High Performance PWA System v4.0</p>
        </div>
      </div>
    </footer>
  );
};


