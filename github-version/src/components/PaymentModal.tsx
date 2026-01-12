import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Banknote, Loader2, X } from "lucide-react";
import { PixQRCodeModal } from "./PixQRCodeModal";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: 'basico' | 'vip';
  amount: number;
}

export const PaymentModal = ({ open, onOpenChange, planType, amount }: PaymentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'credit' | 'debit' | null>(null);
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerCPF, setPayerCPF] = useState("");
  const [pollingPaymentId, setPollingPaymentId] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{
    qr_code: string;
    qr_code_base64: string;
    payment_id: string;
  } | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  // Polling automático do status do pagamento
  useEffect(() => {
    if (!pollingPaymentId) return;

    console.log('🔄 Iniciando polling para payment:', pollingPaymentId);
    
    const pollInterval = setInterval(async () => {
      try {
        const { data: payment } = await supabase
          .from('payments')
          .select('status')
          .eq('id', pollingPaymentId)
          .single();

        console.log('📊 Status atual:', payment?.status);

        if (payment?.status === 'paid') {
          clearInterval(pollInterval);
          setPollingPaymentId(null);
          
          toast({
            title: "🎉 Pagamento Aprovado!",
            description: "Seu plano foi ativado com sucesso!"
          });
          
          setTimeout(() => {
            window.location.href = '/payment-success';
          }, 1500);
        } else if (payment?.status === 'failed') {
          clearInterval(pollInterval);
          setPollingPaymentId(null);
          
          toast({
            title: "❌ Pagamento não aprovado",
            description: "Tente novamente ou use outro método.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 5000);

    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      setPollingPaymentId(null);
      
      toast({
        title: "⏱️ Tempo esgotado",
        description: "Verifique se o pagamento foi processado.",
        variant: "default"
      });
    }, 15 * 60 * 1000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [pollingPaymentId, toast]);

  const handlePayment = async (method: 'pix' | 'credit' | 'debit') => {
    if (method === 'pix') {
      // Validar nome
      if (!payerName.trim() || payerName.trim().length < 3) {
        toast({
          title: "❌ Nome obrigatório",
          description: "Por favor, informe seu nome completo.",
          variant: "destructive"
        });
        return;
      }

      // Validar email
      if (!payerEmail.trim() || !payerEmail.includes('@')) {
        toast({
          title: "❌ Email obrigatório",
          description: "Por favor, informe um email válido.",
          variant: "destructive"
        });
        return;
      }

      // Validar CPF
      const cleanCPF = payerCPF.replace(/\D/g, '');
      if (!cleanCPF || cleanCPF.length !== 11) {
        toast({
          title: "❌ CPF obrigatório",
          description: "Por favor, informe um CPF válido com 11 dígitos.",
          variant: "destructive"
        });
        return;
      }
      
      if (/^(\d)\1{10}$/.test(cleanCPF)) {
        toast({
          title: "❌ CPF inválido",
          description: "Este CPF não é válido. Por favor, verifique.",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    setSelectedMethod(method);

    try {
      const cleanCPF = payerCPF.replace(/\D/g, '');
      
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: { 
          paymentMethod: method,
          planType: planType,
          amount: amount,
          payer: {
            name: payerName.trim(),
            email: payerEmail.trim(),
            cpf: cleanCPF
          }
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (method === 'pix' && data?.qr_code) {
        setQrCodeData({
          qr_code: data.qr_code,
          qr_code_base64: data.qr_code_base64,
          payment_id: data.payment_id
        });
        
        setPollingPaymentId(data.payment_id);
        setShowQrModal(true);
        onOpenChange(false);
        
        toast({
          title: "✅ QR Code gerado!",
          description: "Use o código PIX para finalizar o pagamento. Aguardando confirmação..."
        });
      } else if (data?.init_point) {
        window.open(data.init_point, '_blank');
        toast({
          title: "Redirecionando para pagamento",
          description: "Uma nova aba foi aberta com o Mercado Pago."
        });
        onOpenChange(false);
      } else {
        throw new Error("Link de pagamento não foi gerado");
      }
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      
      let errorMessage = error.message || "Não foi possível processar o pagamento.";
      let errorTitle = "Erro ao processar pagamento";
      
      if (errorMessage.includes("credenciais de PRODUÇÃO") || 
          errorMessage.includes("Unauthorized use of live credentials")) {
        errorTitle = "🔒 Conta Mercado Pago não ativada";
        errorMessage = "Suas credenciais de produção ainda não foram liberadas pelo Mercado Pago. Você precisa:\n\n1. Acessar o painel do Mercado Pago\n2. Completar a verificação de identidade\n3. Aguardar aprovação da conta\n\nOU use credenciais de TESTE temporariamente.";
      } else if (errorMessage.includes("Token") && errorMessage.includes("inválido")) {
        errorMessage = "⚙️ Token do Mercado Pago está incorreto. Verifique se copiou corretamente das configurações.";
      } else if (errorMessage.includes("TEST-") || errorMessage.includes("sandbox")) {
        errorMessage = "⚠️ Sistema configurado com credenciais de teste.";
      } else if (errorMessage.includes("credenciais")) {
        errorMessage = "⚙️ Erro na configuração de pagamento. Entre em contato com o suporte.";
      } else if (errorMessage.includes("CPF")) {
        errorMessage = "❌ CPF inválido ou em formato incorreto.";
      } else if (errorMessage.includes("pendente") || errorMessage.includes("pending")) {
        errorMessage = "⏳ Você já tem um pagamento pendente. Complete-o ou aguarde expiração.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setLoading(false);
      setSelectedMethod(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Ativar {planType === 'vip' ? 'Plano VIP' : 'Plano Básico'}
            </DialogTitle>
            <DialogDescription>
              Escolha a forma de pagamento preferida para ativar seu {planType === 'vip' ? 'Plano VIP' : 'Plano Básico'} por R$ {amount.toFixed(2)}/mês
            </DialogDescription>
          </DialogHeader>
        
          <div className="space-y-4 py-4">
            {/* Nome do Pagador */}
            <div className="space-y-2">
              <Label htmlFor="payer-name">Nome Completo *</Label>
              <Input
                id="payer-name"
                type="text"
                placeholder="João da Silva"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Email do Pagador */}
            <div className="space-y-2">
              <Label htmlFor="payer-email">Email *</Label>
              <Input
                id="payer-email"
                type="email"
                placeholder="joao@email.com"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Campo CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={payerCPF}
                onChange={(e) => setPayerCPF(formatCPF(e.target.value))}
                maxLength={14}
                disabled={loading}
              />
            </div>

            {/* Mensagem motivacional */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-center text-sm font-medium text-primary">
                ✨ Bons bicos a todo momento para você! 💰
              </p>
              <p className="text-center text-xs text-muted-foreground mt-1">
                Que não lhe falte trabalho nem dinheiro!
              </p>
            </div>

            {/* Botões de Pagamento */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-auto py-4 px-4 justify-start"
                onClick={() => handlePayment('pix')}
                disabled={loading}
              >
                <div className="flex items-center gap-3 w-full">
                  <Smartphone className="h-6 w-6 text-primary" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Pix</div>
                    <div className="text-sm text-muted-foreground">
                      Pagamento instantâneo via QR Code
                    </div>
                  </div>
                  {loading && selectedMethod === 'pix' && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto py-4 px-4 justify-start"
                onClick={() => handlePayment('credit')}
                disabled={loading}
              >
                <div className="flex items-center gap-3 w-full">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Cartão de Crédito</div>
                    <div className="text-sm text-muted-foreground">
                      Renovação automática mensal
                    </div>
                  </div>
                  {loading && selectedMethod === 'credit' && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto py-4 px-4 justify-start"
                onClick={() => handlePayment('debit')}
                disabled={loading}
              >
                <div className="flex items-center gap-3 w-full">
                  <Banknote className="h-6 w-6 text-primary" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Cartão de Débito</div>
                    <div className="text-sm text-muted-foreground">
                      Pagamento único mensal
                    </div>
                  </div>
                  {loading && selectedMethod === 'debit' && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </Button>

              <div className="text-xs text-muted-foreground text-center pt-2">
                Pagamento processado de forma segura pelo Mercado Pago
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    
    {/* Modal de QR Code PIX */}
    <PixQRCodeModal
      open={showQrModal}
      onOpenChange={setShowQrModal}
      qrCode={qrCodeData?.qr_code || ''}
      qrCodeBase64={qrCodeData?.qr_code_base64 || ''}
      paymentId={qrCodeData?.payment_id || ''}
    />
  </>
  );
};