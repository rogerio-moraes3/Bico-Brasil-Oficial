import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, Mail, KeyRound } from 'lucide-react';
import { formatCPF, validateCPF } from '@/lib/validators';

type Mode = 'lookup' | 'options' | 'change-email' | 'confirm-code';

export default function RecoverByCPF() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cpf, setCpf] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<Mode>('lookup');
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (value: string) => {
    setCpf(formatCPF(value));
  };

  const handleLookup = async () => {
    const cleanCpf = cpf.replace(/\D/g, '');

    if (!validateCPF(cleanCpf)) {
      toast({
        title: "CPF inválido",
        description: "Digite um CPF válido",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('recover-by-cpf', {
        body: { cpf: cleanCpf, action: 'lookup' }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        // Move to options - we don't know if CPF exists (by design)
        setMode('options');
      } else {
        toast({
          title: "Erro",
          description: data?.error || "Não foi possível processar sua solicitação",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Lookup error:', error);
      const errorMessage = error?.message?.includes('429')
        ? "Muitas tentativas. Aguarde 1 hora antes de tentar novamente."
        : "Erro ao processar solicitação. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendResetToEmail = async () => {
    const cleanCpf = cpf.replace(/\D/g, '');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('recover-by-cpf', {
        body: { cpf: cleanCpf, action: 'send-reset' }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitação enviada",
        description: data?.message || "Se o CPF estiver cadastrado, você receberá um email de recuperação."
      });
    } catch (error: any) {
      console.error('Reset error:', error);
      const errorMessage = error?.message?.includes('429')
        ? "Muitas tentativas. Aguarde 1 hora antes de tentar novamente."
        : "Erro ao processar solicitação. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido",
        variant: "destructive"
      });
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('recover-by-cpf', {
        body: { cpf: cleanCpf, action: 'request-email-change', newEmail }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Código enviado",
          description: data?.message || "Se o CPF estiver cadastrado, um código foi enviado para o e-mail atualmente cadastrado."
        });
        setMode('confirm-code');
      } else {
        toast({
          title: "Erro",
          description: data?.error || "Não foi possível processar sua solicitação",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Request email change error:', error);
      const errorMessage = error?.message?.includes('429')
        ? "Muitas tentativas. Aguarde 1 hora antes de tentar novamente."
        : "Erro ao processar solicitação. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    if (!/^\d{6}$/.test(code)) {
      toast({
        title: "Código inválido",
        description: "Digite o código de 6 dígitos recebido no e-mail antigo",
        variant: "destructive"
      });
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('recover-by-cpf', {
        body: { cpf: cleanCpf, action: 'confirm-email-change', newEmail, code }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Email atualizado",
          description: data?.message || "Email atualizado com sucesso! Um link para definir sua senha foi enviado."
        });
        setMode('options');
        setNewEmail('');
        setCode('');
      } else {
        toast({
          title: "Erro",
          description: data?.error || "Não foi possível confirmar o código",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Confirm email change error:', error);
      const errorMessage = error?.message?.includes('429')
        ? "Muitas tentativas. Aguarde 1 hora antes de tentar novamente."
        : "Erro ao processar solicitação. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4 pb-20 md:pb-12">
        <div className="container max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/auth?mode=login')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-[var(--nav-link)]" />
            Voltar ao login
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <KeyRound className="h-6 w-6" />
                Recuperar Acesso por CPF
              </CardTitle>
              <CardDescription>
                {mode === 'lookup' && 'Digite seu CPF para recuperar sua conta'}
                {mode === 'options' && 'Escolha como deseja recuperar sua conta'}
                {mode === 'change-email' && 'Digite um novo email para recuperação'}
                {mode === 'confirm-code' && 'Digite o código enviado ao seu e-mail cadastrado'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {mode === 'lookup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  <Button
                    onClick={handleLookup}
                    className="w-full"
                    disabled={loading || cpf.replace(/\D/g, '').length !== 11}
                  >
                    {loading ? 'Processando...' : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Continuar
                      </>
                    )}
                  </Button>
                </>
              )}

              {mode === 'options' && (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Se o CPF informado estiver cadastrado, você poderá recuperar sua conta pelos métodos abaixo.
                    </p>
                  </div>

                  <Button
                    onClick={sendResetToEmail}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar link para o email cadastrado
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Não tem mais acesso ao email?
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setMode('change-email')}
                    className="w-full"
                  >
                    Usar outro email para recuperação
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMode('lookup');
                      setCpf('');
                    }}
                    className="w-full"
                  >
                    Tentar outro CPF
                  </Button>
                </>
              )}

              {mode === 'change-email' && (
                <>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Atenção: Ao trocar o email, você perderá acesso pelo email anterior. Por segurança, vamos enviar um código de confirmação para o e-mail atualmente cadastrado antes de concluir a troca.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-email">Novo Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="seu-novo@email.com"
                    />
                  </div>

                  <Button
                    onClick={handleRequestEmailChange}
                    className="w-full"
                    disabled={loading || !newEmail}
                  >
                    {loading ? 'Enviando...' : 'Enviar código de confirmação'}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setMode('options')}
                    className="w-full"
                  >
                    Voltar
                  </Button>
                </>
              )}

              {mode === 'confirm-code' && (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Enviamos um código de 6 dígitos para o e-mail atualmente cadastrado na conta. Digite-o abaixo para confirmar a troca para <strong>{newEmail}</strong>.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-code">Código de confirmação</Label>
                    <Input
                      id="confirm-code"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={handleConfirmEmailChange}
                    className="w-full"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? 'Confirmando...' : 'Confirmar troca de email'}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMode('change-email');
                      setCode('');
                    }}
                    className="w-full"
                  >
                    Voltar
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
