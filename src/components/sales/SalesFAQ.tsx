import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Sparkles, MessageCircle, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  { 
    question: "O Bico Brasil realmente funciona?", 
    answer: "Sim! Somos uma plataforma focada em conexão direta. Milhares de pessoas usam o Bico Brasil todos os meses para resolver problemas domésticos ou ganhar renda extra sem intermediários." 
  },
  { 
    question: "É seguro contratar por aqui?", 
    answer: "Trabalhamos com o selo de 'Perfil Verificado', onde validamos documentos dos profissionais. Recomendamos sempre priorizar esses perfis e ler as avaliações reais da comunidade." 
  },
  { 
    question: "Quanto custa usar o sistema?", 
    answer: "Para quem busca serviços, é 100% gratuito. Para profissionais, oferecemos planos a partir de R$19,90/mês para ter visibilidade total, sem NUNCA cobrar comissão sobre o valor do seu trabalho." 
  },
  { 
    question: "Como recebo o pagamento do serviço?", 
    answer: "O pagamento é feito diretamente pelo cliente para você, da forma que combinarem (Pix, dinheiro, etc). O Bico Brasil não retém seu dinheiro e não cobra taxas sobre o serviço realizado." 
  },
  { 
    question: "Preciso baixar um aplicativo pesado?", 
    answer: "Não! O Bico Brasil é um PWA ultra-leve. Você acessa pelo navegador e pode adicionar à tela inicial do celular. Funciona como um app, mas sem ocupar espaço na sua memória." 
  },
  { 
    question: "Posso anunciar qualquer tipo de bico?", 
    answer: "Sim, desde que seja lícito. De faxina e frete até aulas particulares e serviços digitais. Se você sabe fazer, o Bico Brasil é o seu lugar." 
  },
];

export const SalesFAQ = () => {
  return (
    <section className="py-24 md:py-40 bg-[#080C14] relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-2 mb-8 backdrop-blur-md">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">Suporte 24/7</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-[0.95]">
                Dúvidas <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Frequentes.</span>
              </h2>
              
              <p className="text-blue-100/60 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-md">
                Tudo o que você precisa saber para começar a resolver sua vida ou ganhar dinheiro hoje mesmo.
              </p>

              <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <MessageCircle className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl mb-1">Ainda com dúvida?</h4>
                    <p className="text-blue-100/40 text-sm">Chame nosso time no suporte agora.</p>
                  </div>
                </div>
                <button 
                onClick={() => window.location.href = "/contact"}
                className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group/btn">
                  Falar com especialista
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="bg-white/[0.02] border border-white/5 rounded-[32px] px-8 md:px-10 data-[state=open]:border-blue-500/40 data-[state=open]:bg-white/[0.05] transition-all duration-500 overflow-hidden group"
                  >
                    <AccordionTrigger className="text-left font-bold text-white hover:no-underline py-8 text-xl md:text-2xl hover:text-blue-400 transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-100/60 pb-10 leading-relaxed font-medium text-lg md:text-xl">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};


