import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl text-center">Perguntas Frequentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-foreground font-medium leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
