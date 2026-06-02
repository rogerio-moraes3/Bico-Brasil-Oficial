import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const faqItems = [
  {
    question: "O que é o Bico Brasil?",
    answer: "O Bico Brasil é um aplicativo 100% digital que conecta profissionais autônomos a pessoas que precisam contratar serviços rápidos e de confiança. Aqui, você divulga o que faz e os clientes entram em contato direto com você — sem intermediação ou burocracia."
  },
  {
    question: "O Bico Brasil é uma agência?",
    answer: "Não. O Bico Brasil não é uma agência nem empregador. A plataforma é uma vitrine digital onde cada profissional anuncia seus serviços e negocia diretamente com o cliente."
  },
  {
    question: "Como funcionam os planos?",
    answer: "O profissional tem 3 acessos gratuitos para testar a plataforma e depois pode escolher um dos planos: Plano Básico (R$19,90/mês) com perfil publicado e acesso aos contatos, ou Plano VIP (R$29,90/mês) com fotos, vídeos, selo de credibilidade e prioridade nas buscas."
  },
  {
    question: "Como funciona o painel de destaque?",
    answer: "O Anúncio Destaque coloca seu perfil no centro da página inicial com destaque visual por R$20/dia. Pagamento via Pix ou cartão direto pelo app."
  },
  {
    question: "Quem paga a plataforma?",
    answer: "Não cobramos comissão sobre o valor do serviço. Há um plano Pro opcional (assinatura) e anúncios regionais."
  },
  {
    question: "Como é o pagamento?",
    answer: "Contratante e prestador combinam e efetuam o pagamento diretamente via PIX."
  },
  {
    question: "Tenho algum vínculo trabalhista com o Bico Brasil?",
    answer: "Não. O Bico Brasil é apenas uma plataforma que conecta quem quer trabalhar com quem precisa contratar. O profissional tem total liberdade para entrar, sair ou editar seu perfil quando quiser."
  },
  {
    question: "Que tipo de autonomia eu tenho?",
    answer: "Você decide tudo: valores, horários, forma de pagamento, e se deseja ou não aceitar um serviço. O Bico Brasil respeita a liberdade de cada profissional. Aqui, você é o dono do seu próprio negócio."
  },
  {
    question: "Como funcionam as avaliações?",
    answer: "Após o término do serviço, tanto o cliente quanto o profissional podem se avaliar mutuamente. As avaliações são liberadas após a confirmação de que o serviço foi realmente prestado."
  },
  {
    question: "Quanto posso cobrar pelos meus serviços?",
    answer: "Você define o valor! O preço mínimo sugerido é de R$80, podendo variar conforme a complexidade e o tipo de serviço."
  },
  {
    question: "E se houver problema no serviço?",
    answer: "O Bico Brasil é apenas a ponte entre as partes e não se responsabiliza pela execução. Use a avaliação pública e denuncie perfis."
  }
];

export const FAQ = () => {
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
                Esclareça suas principais dúvidas sobre o funcionamento da plataforma líder em conexões locais.
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
              {faqItems.map((faq, index) => (
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

