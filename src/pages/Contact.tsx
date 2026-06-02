import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SalesFooter } from "@/components/sales/SalesFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Send, ArrowLeft, Sparkles, Phone, MapPin } from "lucide-react";
import { Helmet } from "react-helmet";
import { contactSchema } from "@/lib/validation";
import { safeGoBack } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Contact() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validatedData = contactSchema.parse({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim()
      });

      const { error } = await supabase
        .from('contacts')
        .insert([{
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message
        }]);

      if (error) {
        if (error.message?.includes('rate limit') || error.message?.includes('5 minutes')) {
          toast({
            title: "Aguarde um momento",
            description: "Você já enviou uma mensagem recentemente. Tente novamente em alguns minutos.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Mensagem enviada!",
        description: "Responderemos por email em breve.",
      });

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      if (error.errors && error.errors.length > 0) {
        toast({
          title: "Dados inválidos",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao enviar mensagem",
          description: "Tente novamente mais tarde ou entre em contato por email.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-white selection:bg-blue-500/30">
      <Helmet>
        <title>Suporte - Bico Brasil</title>
        <meta name="description" content="Entre em contato com o Bico Brasil. Tire suas dúvidas, envie sugestões e receba suporte." />
      </Helmet>

      <Header />

      <main className="flex-grow overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full -translate-y-1/2" />
           
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
                  <span>Estamos aqui para você</span>
                </div>

                <h1 className="text-6xl md:text-[100px] font-black leading-[0.85] tracking-tighter mb-12">
                   Central de <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Suporte.</span>
                </h1>

                <p className="text-xl md:text-3xl text-blue-100/60 max-w-2xl leading-relaxed font-medium">
                   Dúvidas, sugestões ou problemas? Fale com nosso time agora e resolva sua vida em minutos.
                </p>
              </motion.div>
           </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-24 md:py-40 relative">
           <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-24 items-start">
                 
                 {/* Left side: Info */}
                 <div>
                    <h2 className="text-4xl font-black mb-12 tracking-tighter">Canais de <span className="text-blue-400">Atendimento</span></h2>
                    
                    <div className="space-y-8">
                       {[
                          { 
                             icon: Mail, 
                             label: "E-mail Oficial", 
                             value: "contato.bicobrasil@gmail.com", 
                             href: "mailto:contato.bicobrasil@gmail.com" 
                          },
                          { 
                             icon: MessageSquare, 
                             label: "Suporte via App", 
                             value: "Acesse o chat interno", 
                             href: "/app" 
                          },
                          { 
                             icon: MapPin, 
                             label: "Presença", 
                             value: "Atendimento Nacional 100% Digital", 
                             href: "#" 
                          }
                       ].map((item, i) => (
                          <div key={i} className="flex gap-6 group">
                             <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300">
                                <item.icon className="w-6 h-6 text-blue-400" />
                             </div>
                             <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100/30 mb-1">{item.label}</p>
                                <a href={item.href} className="text-xl font-bold text-white hover:text-blue-400 transition-colors">{item.value}</a>
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="mt-20 p-8 rounded-[40px] bg-gradient-to-br from-blue-600/20 to-indigo-600/5 border border-blue-500/20 backdrop-blur-xl">
                       <h4 className="text-blue-400 text-xl font-black mb-4">Privacidade & Dados</h4>
                       <p className="text-blue-100/50 font-medium leading-relaxed mb-6">
                          Para questões relacionadas à LGPD e seus dados, utilize nosso canal exclusivo de privacidade.
                       </p>
                       <a href="mailto:contato.bicobrasil@gmail.com" className="text-blue-400 font-bold hover:underline">Políticas de Privacidade →</a>
                    </div>
                 </div>

                 {/* Right side: Form */}
                 <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-10 md:p-12 rounded-[48px] bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl"
                 >
                    <form onSubmit={handleSubmit} className="space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Nome Completo</Label>
                             <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                                className="h-16 bg-white/[0.03] border-white/10 rounded-2xl px-6 focus:ring-blue-500/40 focus:border-blue-500/40 text-lg transition-all"
                                required
                             />
                          </div>
                          <div className="space-y-3">
                             <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Seu melhor E-mail</Label>
                             <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                className="h-16 bg-white/[0.03] border-white/10 rounded-2xl px-6 focus:ring-blue-500/40 focus:border-blue-500/40 text-lg transition-all"
                                required
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Assunto</Label>
                          <Input
                             id="subject"
                             value={subject}
                             onChange={(e) => setSubject(e.target.value)}
                             placeholder="Sobre o que deseja falar?"
                             className="h-16 bg-white/[0.03] border-white/10 rounded-2xl px-6 focus:ring-blue-500/40 focus:border-blue-500/40 text-lg transition-all"
                             required
                          />
                       </div>

                       <div className="space-y-3">
                          <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Sua Mensagem</Label>
                          <Textarea
                             id="message"
                             value={message}
                             onChange={(e) => setMessage(e.target.value)}
                             placeholder="Escreva aqui os detalhes..."
                             className="min-h-[200px] bg-white/[0.03] border-white/10 rounded-3xl px-6 py-6 focus:ring-blue-500/40 focus:border-blue-500/40 text-lg transition-all resize-none"
                             required
                          />
                       </div>

                       <Button
                          type="submit"
                          className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white font-black text-2xl rounded-3xl shadow-[0_20px_40px_rgba(30,94,255,0.25)] transition-all active:scale-95 disabled:opacity-50"
                          disabled={submitting}
                       >
                          {submitting ? "Enviando..." : (
                             <span className="flex items-center gap-3">
                                Enviar Mensagem <Send className="w-6 h-6" />
                             </span>
                          )}
                       </Button>
                    </form>
                 </motion.div>

              </div>
           </div>
        </section>
      </main>

      <SalesFooter />
    </div>
  );
}

