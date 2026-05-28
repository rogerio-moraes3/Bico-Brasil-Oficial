import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Eye, Database, Heart } from "lucide-react";
import { safeGoBack } from "@/lib/utils";
import { motion } from "framer-motion";

const Privacy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-white selection:bg-blue-500/30">
      <Header />

      <main className="flex-grow overflow-hidden">
        {/* Hero Header */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 border-b border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-600/5 blur-[150px] rounded-full -translate-y-1/2" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                Sua Privacidade <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">é Sagrada.</span>
              </h1>
              <p className="text-xl text-blue-100/40 max-w-2xl font-medium leading-relaxed">
                Transparência total sobre como protegemos seus dados e garantimos sua segurança digital dentro do Bico Brasil.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 md:py-32 max-w-5xl mx-auto px-6">
          <div className="grid gap-12">
            {[
              {
                icon: Database,
                title: "1. Dados Coletados",
                desc: "Coletamos apenas o essencial para a conexão: Nome, WhatsApp, e-mail e localização aproximada (bairro/cidade). Fotos e documentos são opcionais para verificação de confiança."
              },
              {
                icon: Lock,
                title: "2. Segurança de Elite",
                desc: "Utilizamos criptografia de ponta a ponta e servidores protegidos para garantir que suas informações nunca caiam em mãos erradas."
              },
              {
                icon: Heart,
                title: "3. Respeito à LGPD",
                desc: "Você tem controle total. Pode acessar, corrigir ou excluir seus dados permanentemente a qualquer momento através das configurações do seu perfil."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-12 rounded-[48px] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all duration-500 flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">{item.title}</h3>
                  <p className="text-xl text-blue-100/40 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}

            <div className="mt-20 p-12 rounded-[48px] bg-blue-500/5 border border-blue-400/10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Última Atualização</p>
              <p className="text-2xl font-bold text-white mb-8">{new Date().toLocaleDateString('pt-BR')}</p>
              <p className="text-blue-100/40 font-medium">
                Dúvidas sobre sua privacidade? Envie um e-mail para <a href="mailto:contato.bicobrasil@gmail.com" className="text-blue-400 hover:underline">privacidade@bicobrasil.com.br</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;

