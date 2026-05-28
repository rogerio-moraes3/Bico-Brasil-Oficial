import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, Instagram, Facebook, Mail, ArrowRight, Sparkles, ShieldCheck, Zap, Globe, Youtube, Linkedin, Music2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export const Footer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const buildId = useMemo(() => import.meta.env.VITE_APP_BUILD_ID || 'local', []);

  useEffect(() => {
    if (buildId) {
      console.info(`Bico Brasil build: ${buildId}`);
    }
  }, [buildId]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setIsAdmin(false);
          return;
        }

        const { data: colaboradorData } = await supabase
          .from("colaboradores_autorizados")
          .select("email")
          .ilike("email", user.email)
          .maybeSingle();

        setIsAdmin(!!colaboradorData);
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080C14] text-zinc-400 relative overflow-hidden border-t border-white/5">
      {/* Final CTA Section - Only for logged out users or as a general brand message */}
      {!user && (
        <section className="relative py-24 md:py-32 overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,94,255,0.08),transparent_70%)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-2 mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">Junte-se à revolução do bico</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter text-white leading-tight">
              Pronto para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">começar?</span>
            </h2>
            
            <p className="text-lg md:text-xl text-blue-100/60 mb-10 max-w-2xl mx-auto font-medium">
              Crie sua conta gratuitamente e comece a receber oportunidades de trabalho ou encontre quem resolva seus problemas hoje mesmo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="group relative flex items-center gap-2 bg-[#FF5C35] hover:bg-[#FF451A] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_20px_40px_rgba(255,92,53,0.2)] transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
              >
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="md:col-span-2 max-w-sm">
            <Link to="/" onClick={scrollToTop} className="text-2xl font-black text-white mb-6 block tracking-tighter uppercase">BICO BRASIL</Link>
            <p className="text-base leading-relaxed mb-8 text-blue-100/40 font-medium">
              A maior rede de conexões diretas para serviços locais. Tecnologia de ponta unindo quem precisa a quem sabe fazer.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { Icon: Instagram, href: "https://www.instagram.com/bicobrasil_" },
                { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61584453683707" },
                { Icon: Music2, href: "https://www.tiktok.com/@bicobrasil" },
                { Icon: Youtube, href: "https://www.youtube.com/@BicoBrasil-l8r" },
                { Icon: Linkedin, href: "https://www.linkedin.com/in/bico-brasil-1bb190397/" },
                { Icon: Mail, href: "mailto:contato.bicobrasil@gmail.com" }
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-400 transition-all duration-300">
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:col-span-2 gap-10">
            <div>
              <h4 className="text-white font-black mb-6 uppercase text-[10px] tracking-[0.2em] opacity-50">Ajuda & Plataforma</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/about" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Sobre Nós</Link></li>
                <li><Link to="/app" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Buscar Bicos</Link></li>
                <li><Link to="/offer-services" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Anunciar Bico</Link></li>
                <li><Link to="/premium" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Planos Profissionais</Link></li>
                <li><Link to="/relacao-usuarios" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Relação Usuários</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-6 uppercase text-[10px] tracking-[0.2em] opacity-50">Legal & Suporte</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/terms" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacy" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Privacidade</Link></li>
                <li><Link to="/faq" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Dúvidas Frequentes</Link></li>
                <li><Link to="/contact" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Falar com Suporte</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
              © {new Date().getFullYear()} Bico Brasil. Todos os direitos reservados.
            </p>
            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
              Contato LGPD: privacidade@bicobrasil.com.br
            </p>
          </div>

          <div className="flex items-center gap-8">
            <Link
              to={isAdmin ? "/admin" : "/auth"}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-blue-400 transition-colors group"
            >
              <Settings size={12} className="group-hover:rotate-90 transition-transform duration-500" />
              Área Admin
            </Link>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-800">
              v4.0.2
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

