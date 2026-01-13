import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PixQRCodeModal } from "./PixQRCodeModal";
import { supabase } from "@/integrations/supabase/client";

interface PaymentCheckoutProps {
  planName: string;
  amount: number;
  onSuccess?: () => void;
}

export default function PaymentCheckout({ planName, amount, onSuccess }: PaymentCheckoutProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [payerEmail, setPayerEmail] = useState("");
  const [payerCPF, setPayerCPF] = useState("");

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  async function createPayment() {
    if (!payerEmail || !payerCPF) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha email e CPF",
        variant: "destructive"
      });
      return;
    }

    const cpfNumbers = payerCPF.replace(/\D/g, "");
    if (cpfNumbers.length !== 11) {
      toast({
        title: "CPF inválido",
        description: "Por favor, insira um CPF válido com 11 dígitos",
        variant: "destructive"
      });
      return;
    }

    // Validar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Não autenticado",
        description: "Por favor, faça login para continuar",
        variant: "destructive"
      });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      setLoading(true);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/create-pix-payment`;
      
      // Determine plan type
      const planType = planName.toLowerCase().includes('vip') ? 'vip' : 'basico';

      const response = await fetch(url, {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          description: planName,
          amount: Number(amount),
          plan_type: planType,
          payer_email: payerEmail,
          payer_cpf: cpfNumbers
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar pagamento');
      }

      const data = await response.json();

      // Set QR Code data and open modal
      setQrCode(data.qrCode);
      setQrCodeBase64(data.qrCodeBase64);
      setPaymentId(data.paymentId);
      setShowQrModal(true);

      toast({
        title: "QR Code gerado!",
        description: "Escaneie o código para pagar"
      });

    } catch (error: any) {
      console.error("❌ Erro:", error);
      toast({
        title: "Erro ao criar pagamento",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pagamento PIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={payerCPF}
              onChange={(e) => setPayerCPF(formatCPF(e.target.value))}
              disabled={loading}
            />
          </div>

          <Button
            onClick={createPayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando QR Code...
              </>
            ) : (
              `Pagar R$ ${amount.toFixed(2)} com PIX`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao confirmar, você receberá um QR Code PIX para realizar o pagamento
          </p>
        </CardContent>
      </Card>

      <PixQRCodeModal
        open={showQrModal}
        onOpenChange={setShowQrModal}
        qrCode={qrCode}
        qrCodeBase64={qrCodeBase64}
        paymentId={paymentId}
      />
    </>
  );
}
