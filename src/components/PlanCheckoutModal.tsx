import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCPF, validateCPF } from "@/lib/validators";
import { formatBRL } from "@/lib/utils";
import { PixQRCodeModal } from "./PixQRCodeModal";
import { validateMercadoPagoToken, type MercadoPagoValidation } from "@/lib/validateMercadoPago";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface PlanCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: "basico" | "vip" | "anual";
  amount: number;
  planName: string;
}

export function PlanCheckoutModal({
  open,
  onOpenChange,
  planType,
  amount,
  planName
}: PlanCheckoutModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validatingMP, setValidatingMP] = useState(false);
  const [mpValidation, setMpValidation] = useState<MercadoPagoValidation | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const [qrCodeData, setQrCodeData] = useState<{
    qr_code: string;
    qr_code_base64: string;
    payment_id: string;
  } | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Auto-preencher dados do usuário ao abrir modal
  useEffect(() => {
    if (open && user) {
      const fetchUserData = async () => {
        const { data } = await supabase
          .from('users')
          .select('name, cpf, phone, email')
          .eq('auth_id', user.id)
          .single();

        if (data) {
          setName(data.name || "");
          setCpf(data.cpf ? formatCPF(data.cpf) : "");
          setPhone(data.phone || "");
          setEmail(data.email || user.email || "");
        } else {
          setEmail(user.email || "");
        }
      };
      fetchUserData();
    }
  }, [open, user]);

  // Validar credenciais Mercado Pago ao abrir modal
  useEffect(() => {
    if (open) {
      validateCredentials();
    }
  }, [open]);

  const validateCredentials = async () => {
    setValidatingMP(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      // Timeout de 5s
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${supabaseUrl}/functions/v1/validate-mp-credentials`, {
        method: 'GET',
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const validation = await response.json();
      setMpValidation({
        ok: validation.ok,
        mode: validation.mode,
        reason: validation.reason,
        badge: validation.ok ? 'success' : 'warning',
      });
    } catch (err) {
      setMpValidation({
        ok: false,
        mode: 'unknown',
        reason: 'Não foi possível verificar as credenciais do Mercado Pago agora.',
        badge: 'warning',
      });
    } finally {
      setValidatingMP(false);
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleGenerateQRCode = async () => {
    // Validar credenciais primeiro
    if (!mpValidation?.ok) {
      toast.error(mpValidation?.reason || "Configure as credenciais do Mercado Pago primeiro");
      return;
    }

    // Validações de formulário
    if (!name.trim()) {
      toast.error("Por favor, preencha seu nome completo");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error("Por favor, preencha um telefone válido");
      return;
    }
    // Email validation with proper regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      toast.error("Por favor, preencha um email válido");
      return;
    }
    if (!validateCPF(cpf)) {
      toast.error("Por favor, preencha um CPF válido");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Você precisa estar logado");
        setLoading(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/create-pix-payment`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          paymentMethod: "pix",
          planType,
          amount,
          payer: {
            name: name.trim(),
            cpf: cpf.replace(/\D/g, ""),
            email: email.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar QR Code PIX");
      }

      if (!data.qr_code || !data.qr_code_base64) {
        throw new Error("Dados do QR Code não foram retornados");
      }

      setQrCodeData({
        qr_code: data.qr_code,
        qr_code_base64: data.qr_code_base64,
        payment_id: data.payment_id,
      });

      toast.success("QR Code PIX gerado com sucesso!");
      onOpenChange(false);
      setShowQRModal(true);

    } catch (error: any) {
      console.error("❌ Erro ao gerar QR Code:", error);
      toast.error(error.message || "Erro ao gerar QR Code PIX");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setQrCodeData(null);
    setName("");
    setPhone("");
    setEmail("");
    setCpf("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-emerald-50 dark:bg-emerald-950/20 backdrop-blur-lg border-2 border-emerald-500 dark:border-emerald-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">
              Assinar Plano {planName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status de validação do Mercado Pago */}
            {validatingMP && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Validando credenciais do Mercado Pago...
                </AlertDescription>
              </Alert>
            )}

            {mpValidation && (
              <Alert
                variant={mpValidation.badge === 'error' ? 'destructive' : 'default'}
                className={
                  mpValidation.badge === 'success'
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                    : mpValidation.badge === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
                      : ''
                }
              >
                <div className="flex items-start gap-2">
                  {mpValidation.badge === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                  {mpValidation.badge === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />}
                  {mpValidation.badge === 'error' && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                  <div className="flex-1">
                    {process.env.NODE_ENV === 'development' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={mpValidation.badge === 'success' ? 'default' : mpValidation.badge === 'warning' ? 'secondary' : 'destructive'}>
                          {mpValidation.mode === 'production' ? 'PRODUÇÃO' : mpValidation.mode === 'test' ? 'TESTE' : 'ERRO'}
                        </Badge>
                      </div>
                    )}
                    <AlertDescription className={
                      mpValidation.badge === 'success'
                        ? 'text-green-800 dark:text-green-200'
                        : mpValidation.badge === 'warning'
                          ? 'text-yellow-800 dark:text-yellow-200'
                          : ''
                    }>
                      {planType === 'basico'
                        ? "R$ 19,90 — invista pouco para aumentar suas chances de fechar trabalhos hoje."
                        : planType === 'vip'
                          ? "R$ 29,90 — apareça primeiro nas buscas e receba 3x mais contatos."
                          : planType === 'anual'
                            ? "Plano Anual — economia garantida para profissionais que querem crescer."
                            : "Assine e aumente suas chances de ser contratado imediatamente."
                      }
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <div className="text-center mb-4 p-4 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg border-2 border-emerald-500 dark:border-emerald-600 shadow-lg">
              <p className="text-3xl font-bold text-emerald-950 dark:text-emerald-100">R$ {formatBRL(amount)}</p>
              <p className="text-sm text-emerald-900 dark:text-emerald-200 font-semibold">Pagamento via PIX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-emerald-950 dark:text-emerald-100 font-semibold">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-emerald-950 dark:text-emerald-100 font-semibold">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-950 dark:text-emerald-100 font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-emerald-950 dark:text-emerald-100 font-semibold">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                disabled={loading}
                maxLength={14}
                className="border-slate-300 dark:border-slate-700"
              />
            </div>

            <Button
              onClick={handleGenerateQRCode}
              disabled={loading || validatingMP || !mpValidation?.ok}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando QR Code...
                </>
              ) : validatingMP ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : !mpValidation?.ok ? (
                'Configure o Mercado Pago primeiro'
              ) : (
                "Gerar QR Code PIX"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {qrCodeData && (
        <PixQRCodeModal
          key={qrCodeData.payment_id}
          open={showQRModal}
          onOpenChange={handleCloseQRModal}
          qrCode={qrCodeData.qr_code}
          qrCodeBase64={qrCodeData.qr_code_base64}
          paymentId={qrCodeData.payment_id}
          planLabel={planName}
          amount={amount}
        />
      )}
    </>
  );
}
