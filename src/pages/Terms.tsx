import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Scale, FileText } from "lucide-react";
import { safeGoBack } from "@/lib/utils";
import { motion } from "framer-motion";

const Terms = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: Shield,
      title: "1. Sobre o Bico Brasil",
      content: "O Bico Brasil é uma plataforma que conecta contratantes e prestadores de serviço para trabalhos manuais em Presidente Prudente-SP e região."
    },
    {
      icon: Scale,
      title: "2. Responsabilidades",
      content: (
        <>
          <p className="mb-4 text-blue-100/60"><strong>O Bico Brasil NÃO:</strong></p>
          <ul className="list-disc pl-6 space-y-2 text-blue-100/40">
            <li>Intermedia pagamentos entre contratantes e prestadores</li>
            <li>Garante a qualidade ou execução dos serviços</li>
            <li>É responsável por problemas decorrentes dos trabalhos realizados</li>
            <li>Realiza verificação de antecedentes criminais (a menos que fornecido)</li>
          </ul>
        </>
      )
    },
    {
      icon: FileText,
      title: "3. Cadastro e Uso",
      content: (
        <ul className="list-disc pl-6 space-y-2 text-blue-100/40">
          <li>Ao se cadastrar, você concorda com estes Termos e nossa Política</li>
          <li>Você é responsável por manter suas informações atualizadas</li>
          <li>É proibido criar perfis falsos ou usar informações de terceiros</li>
          <li>Você deve ter 18 anos ou mais para usar a plataforma</li>
        </ul>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-white selection:bg-blue-500/30">
      <Header />

      <main className="flex-grow overflow-hidden">
        {/* Hero Header */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 border-b border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2" />
          
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
                Termos de <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Uso.</span>
              </h1>
              <p className="text-xl text-blue-100/40 max-w-2xl font-medium leading-relaxed">
                Leia atentamente as regras de utilização da nossa plataforma para garantir uma experiência segura para todos.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 md:py-32 max-w-5xl mx-auto px-6">
          <div className="grid gap-8">
            {/* Sections using glassmorphism cards */}
            <div className="grid gap-8">
              {[
                {
                  title: "1. Natureza da Plataforma",
                  desc: "O Bico Brasil atua apenas como plataforma de intermediação entre prestadores de serviços autônomos e contratantes. Não constituímos vínculo empregatício ou societário."
                },
                {
                  title: "2. Responsabilidades do Usuário",
                  desc: "O contratante é responsável por escolher e negociar diretamente com o profissional. O prestador é responsável pela execução correta do serviço acordado."
                },
                {
                  title: "3. Planos e Assinaturas",
                  desc: "Trabalhadores podem realizar até 3 trabalhos gratuitamente. Após isso, é necessário ativar o Plano Profissional para manter a visibilidade do perfil."
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-colors"
                >
                  <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-lg text-blue-100/40 leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-20 p-12 rounded-[40px] bg-blue-500/5 border border-blue-400/10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Última Atualização</p>
              <p className="text-2xl font-bold text-white mb-8">{new Date().toLocaleDateString('pt-BR')}</p>
              <p className="text-blue-100/40 font-medium">
                Dúvidas sobre os termos? Envie um e-mail para <a href="mailto:contato.bicobrasil@gmail.com" className="text-blue-400 hover:underline">contato.bicobrasil@gmail.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;

