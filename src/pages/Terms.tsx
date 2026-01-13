import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { safeGoBack } from "@/lib/utils";

const Terms = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0 bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs />
          <Button
            variant="ghost"
            onClick={() => safeGoBack(navigate)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4 text-foreground dark:text-white" />
            Voltar
          </Button>
          
          <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Sobre o Bico Brasil</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                O Bico Brasil é uma plataforma que conecta contratantes e prestadores de serviço 
                para trabalhos manuais em Presidente Prudente-SP e região.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Responsabilidades</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">
                <strong>O Bico Brasil NÃO:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Intermedia pagamentos entre contratantes e prestadores</li>
                <li>Garante a qualidade ou execução dos serviços</li>
                <li>É responsável por problemas decorrentes dos trabalhos realizados</li>
                <li>Realiza verificação de antecedentes criminais (a menos que o usuário forneça)</li>
              </ul>
              
              <p className="mt-4 mb-4">
                <strong>O contratante é responsável por:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Escolher e negociar diretamente com o profissional</li>
                <li>Verificar referências e avaliações antes de contratar</li>
                <li>Acordar valores, prazos e condições de pagamento</li>
                <li>Zelar pela própria segurança ao contratar serviços</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. Cadastro e Uso da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>Ao se cadastrar, você concorda com estes Termos e nossa Política de Privacidade</li>
                <li>Você é responsável por manter suas informações atualizadas</li>
                <li>É proibido criar perfis falsos ou usar informações de terceiros</li>
                <li>Você deve ter 18 anos ou mais para usar a plataforma</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>4. Plano Pro (Assinatura)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>Trabalhadores podem realizar até 3 trabalhos gratuitamente</li>
                <li>Após 3 trabalhos, é necessário ativar o Plano Pro (R$ 19,90/mês)</li>
                <li>O pagamento é processado por meio do Mercado Pago</li>
                <li>Você pode cancelar a assinatura a qualquer momento</li>
                <li>Perfis sem plano ativo ficarão ocultos nas buscas após 7 dias</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>5. Avaliações e Comentários</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>Avaliações devem ser honestas e baseadas em experiências reais</li>
                <li>Comentários ofensivos ou difamatórios serão removidos</li>
                <li>O Bico Brasil se reserva o direito de moderar conteúdo inadequado</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>6. Limitação de Responsabilidade</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                O Bico Brasil atua apenas como intermediário de conexão. Qualquer problema, 
                disputa ou dano relacionado aos serviços contratados deve ser resolvido 
                diretamente entre as partes envolvidas.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>7. Alterações nos Termos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                O Bico Brasil pode atualizar estes termos a qualquer momento. Continuando 
                a usar a plataforma, você concorda com as novas versões dos termos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Natureza da Plataforma e Isenção de Vínculo</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                O Bico Brasil atua apenas como plataforma de intermediação entre prestadores de serviços 
                (pessoas físicas ou jurídicas autônomas) e contratantes.
              </p>
              <p>
                A utilização do Bico Brasil não constitui vínculo empregatício, societário, de subordinação 
                ou qualquer relação de trabalho entre a plataforma e o prestador de serviços.
              </p>
              <p>
                O prestador é responsável pela execução correta do serviço, e o contratante é responsável 
                pelo pagamento, aceitabilidade do serviço e avaliação.
              </p>
              <p>
                A plataforma presta serviço técnico-operacional de divulgação, conexão e pagamento 
                (quando aplicável), não assumindo responsabilidade direta por eventuais falhas técnicas, 
                danos causados por terceiros ou acordos financeiros privados celebrados entre usuários.
              </p>
              <p>
                Em casos de disputa entre contratante e prestador, a plataforma atua como canal de 
                comunicação e disponibiliza registros e avaliações, mas não substitui acordos privados 
                e não responde por obrigações trabalhistas entre as partes.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <p className="text-sm text-center">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-center mt-2 text-muted-foreground">
              Para dúvidas, entre em contato: <a href="mailto:contato.bicobrasil@gmail.com" className="text-primary hover:underline">contato.bicobrasil@gmail.com</a>
            </p>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Base legal: Lei nº 13.709/2018 (LGPD) e Lei nº 12.965/2014 (Marco Civil da Internet)
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
