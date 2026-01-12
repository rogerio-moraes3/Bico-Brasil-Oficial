import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { safeGoBack } from "@/lib/utils";

const Privacy = () => {
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
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Informações que Coletamos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">Coletamos apenas as informações essenciais para o funcionamento da plataforma:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados de cadastro:</strong> nome, telefone (WhatsApp), e-mail, cidade, bairro</li>
                <li><strong>Dados profissionais:</strong> categoria de serviço, disponibilidade, preços</li>
                <li><strong>Dados opcionais:</strong> foto de perfil, descrição, documentos (RG/antecedentes)</li>
                <li><strong>Dados de uso:</strong> avaliações, trabalhos realizados, histórico de pagamentos</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Como Usamos Seus Dados</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>Para conectar contratantes e prestadores de serviço</li>
                <li>Para exibir perfis públicos de trabalhadores</li>
                <li>Para processar pagamentos de assinaturas (Plano Pro)</li>
                <li>Para enviar notificações sobre trabalhos e atualizações</li>
                <li>Para melhorar a experiência da plataforma</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. Compartilhamento de Dados</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">
                <strong>Seus dados NÃO são compartilhados com terceiros,</strong> exceto:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Com outros usuários da plataforma (nome, telefone, categoria, avaliações)</li>
                <li>Com processadores de pagamento (Mercado Pago) para assinaturas</li>
                <li>Quando exigido por lei ou ordem judicial</li>
              </ul>
              
              <p className="mt-4">
                Nunca vendemos ou alugamos seus dados pessoais para empresas de marketing 
                ou publicidade.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>4. Seus Direitos (LGPD)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acessar</strong> seus dados a qualquer momento</li>
                <li><strong>Corrigir</strong> informações desatualizadas ou incorretas</li>
                <li><strong>Excluir</strong> sua conta e todos os dados associados</li>
                <li><strong>Revogar</strong> consentimento para uso de dados</li>
                <li><strong>Portar</strong> seus dados para outra plataforma</li>
              </ul>
              
              <p className="mt-4">
                Para exercer qualquer um desses direitos, entre em contato:
                <br />
                <strong>contato.bicobrasil@gmail.com</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>5. Segurança dos Dados</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Utilizamos medidas de segurança técnicas e organizacionais para proteger 
                seus dados contra acesso não autorizado, perda ou vazamento. Isso inclui:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Criptografia de dados sensíveis</li>
                <li>Servidores seguros e atualizados</li>
                <li>Acesso restrito a informações pessoais</li>
                <li>Monitoramento constante de segurança</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>6. Cookies e Rastreamento</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Utilizamos cookies essenciais para o funcionamento da plataforma 
                (login, preferências). Não usamos cookies de rastreamento para publicidade.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>7. Retenção de Dados</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão 
                da conta, seus dados são removidos em até 30 dias, exceto informações 
                que devemos manter por obrigação legal (registros fiscais, por exemplo).
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>8. Alterações nesta Política</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Podemos atualizar esta política periodicamente. Mudanças significativas 
                serão notificadas por e-mail ou na plataforma.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Consentimento LGPD</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                Ao criar sua conta no Bico Brasil, você autoriza expressamente o tratamento de seus 
                dados pessoais (nome, telefone, email, CPF, documentos, imagens) para fins de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Autenticação e gestão de conta</li>
                <li>Publicação de serviços e perfil profissional</li>
                <li>Comunicação entre contratante e prestador</li>
                <li>Processamento de pagamentos</li>
                <li>Cumprimento de obrigações legais</li>
              </ul>
              <p>
                Você está ciente dos direitos previstos na Lei n.º 13.709/2018 (LGPD) e concorda que 
                seus dados sejam utilizados nos termos desta Política de Privacidade.
              </p>
              <p className="font-semibold">
                Você pode exercer seus direitos de acesso, correção, eliminação ou portabilidade 
                de dados a qualquer momento através do email de contato.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <p className="text-sm text-center">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-center mt-2 text-muted-foreground">
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato:<br />
              <a href="mailto:contato.bicobrasil@gmail.com" className="text-primary hover:underline font-medium">contato.bicobrasil@gmail.com</a>
            </p>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Controlador de dados: Bico Brasil | Base legal: Lei nº 13.709/2018 (LGPD)
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
