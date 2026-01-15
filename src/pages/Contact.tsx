import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";
import { contactSchema } from "@/lib/validation";
import { safeGoBack } from "@/lib/utils";

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
      // Validar dados antes de enviar
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
        // Verificar se é erro de rate limiting
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

      // Limpar formulário
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);

      // Exibir erro de validação
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
    <>
      <Helmet>
        <title>Central de Ajuda - Bico Brasil</title>
        <meta name="description" content="Entre em contato com o Bico Brasil. Tire suas dúvidas, envie sugestões e receba suporte." />
      </Helmet>

      <div className="min-h-screen flex flex-col pb-20 md:pb-0 bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Breadcrumbs />
            <Button
              variant="ghost"
              onClick={() => safeGoBack(navigate)}
              className="mb-4 text-[var(--nav-link)]"
            >
              <ArrowLeft className="mr-2 h-4 w-4 text-[var(--nav-link)]" />
            </Button>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Central de Ajuda e Suporte</h1>
              <p className="text-muted-foreground">
                Tire suas dúvidas, envie sugestões ou reporte problemas. Estamos aqui para ajudar!
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Formulário de Contato
                </CardTitle>
                <CardDescription>
                  Responderemos seu email o mais breve possível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Sobre o que deseja falar?"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva sua mensagem aqui..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contato Direto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Você também pode nos enviar um email diretamente:
                </p>
                <a
                  href="mailto:contato.bicobrasil@gmail.com"
                  className="text-primary hover:underline font-medium"
                >
                  contato.bicobrasil@gmail.com
                </a>
                <p className="text-sm text-muted-foreground mt-4">
                  Para questões relacionadas à LGPD:
                </p>
                <a
                  href="mailto:contato.bicobrasil@gmail.com"
                  className="text-primary hover:underline font-medium"
                >
                  contato.bicobrasil@gmail.com
                </a>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
