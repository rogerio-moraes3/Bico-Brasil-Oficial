import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Preciso pagar para contratar?",
    answer: "Não! A busca por profissionais é 100% gratuita para clientes. Você só precisa criar uma conta e pode começar a buscar imediatamente.",
  },
  {
    question: "O aplicativo funciona no iPhone e Android?",
    answer: "Sim! O Bico Brasil é um Web App moderno (PWA). Funciona em qualquer navegador e você pode adicionar à tela inicial sem ir à loja de aplicativos. Não ocupa memória do seu celular.",
  },
  {
    question: "Como sei que o profissional é confiável?",
    answer: "Busque pelo selo de 'Verificado' e leia as avaliações de outros clientes antes de fechar negócio. Profissionais verificados passaram por validação de documentos.",
  },
  {
    question: "Qual o custo para profissionais?",
    answer: "Oferecemos planos acessíveis a partir de R$19,90/mês. Não cobramos comissão sobre os serviços realizados - você recebe 100% do valor combinado com o cliente.",
  },
  {
    question: "Como funciona a negociação?",
    answer: "Toda negociação é feita diretamente entre você e o profissional via WhatsApp. Não há intermediários. Vocês combinam preço, horário e forma de pagamento livremente.",
  },
  {
    question: "Posso divulgar qualquer tipo de serviço?",
    answer: "Sim, desde que seja um serviço lícito. Temos categorias que vão de construção e reformas até serviços digitais, passando por limpeza, jardinagem, fretes e muito mais.",
  },
];

export const SalesFAQ = () => {
  return (
    <section className="py-14 md:py-24 bg-[#F8FAFC] dark:bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <HelpCircle className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Tire suas dúvidas sobre o Bico Brasil
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6 shadow-sm data-[state=open]:border-primary/30 data-[state=open]:shadow-[0_2px_16px_-4px_hsl(var(--xp-primary)/0.12)] transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5 text-sm md:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
