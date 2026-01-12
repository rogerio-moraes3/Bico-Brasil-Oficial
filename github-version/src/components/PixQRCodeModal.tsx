import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, CheckCircle, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Label } from './ui/label';

interface PixQRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: string;
  qrCodeBase64: string;
  paymentId: string;
}

export function PixQRCodeModal({
  open,
  onOpenChange,
  qrCode,
  qrCodeBase64,
  paymentId
}: PixQRCodeModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutos em segundos

  // Timer de expiração
  useEffect(() => {
    if (!open || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [open, timeLeft]);

  // Formatar tempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!open || !paymentId) return;

    // Poll payment status every 5 seconds
    const interval = setInterval(async () => {
      setChecking(true);
      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('id', paymentId)
        .single();

      setChecking(false);

      if (data?.status === 'paid') {
        toast({
          title: "Pagamento confirmado! ✅",
          description: "Seu plano foi ativado com sucesso"
        });
        onOpenChange(false);
        window.location.href = '/payment-success';
      } else if (data?.status === 'failed') {
        toast({
          title: "Pagamento não aprovado",
          description: "Tente novamente ou use outro método de pagamento",
          variant: "destructive"
        });
        onOpenChange(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [open, paymentId, onOpenChange, toast]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Cole no seu app de pagamento"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-0 h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            ←
          </Button>
          <DialogTitle className="text-2xl text-center text-emerald-900 dark:text-emerald-100">Pagar com PIX</DialogTitle>
          <DialogDescription className="text-center text-slate-700 dark:text-slate-300">
            Escaneie o QR Code abaixo para realizar o pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 mt-6">
          {/* QR Code Image - Reduzido */}
          <div className="flex justify-center bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-56 h-56"
              />
            </div>
          </div>

          {/* PIX Code Copia e Cola - Logo abaixo do QR */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Código PIX (Copia e Cola)</Label>
            <div className="flex gap-2">
              <Input
                value={qrCode}
                readOnly
                className="font-mono text-xs bg-emerald-100 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:border-emerald-500 dark:hover:bg-emerald-600"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Timer de Expiração - Centralizado */}
          {timeLeft > 0 && (
            <div className="text-center py-2">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Tempo restante: <span className="font-semibold text-emerald-800 dark:text-emerald-200">{formatTime(timeLeft)}</span>
              </p>
            </div>
          )}

          {timeLeft <= 0 && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>QR Code Expirado</AlertTitle>
              <AlertDescription>
                Este QR Code expirou. Por favor, gere um novo pagamento.
              </AlertDescription>
            </Alert>
          )}

          {/* Indicador de Aguardando Pagamento - Embaixo */}
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700">
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-800 dark:text-emerald-200 mb-1">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">Aguardando confirmação do pagamento...</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Você será redirecionado automaticamente quando o pagamento for confirmado
            </p>
            {checking && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                🔍 Verificando status...
              </p>
            )}
          </div>

          {/* Status */}
          {!checking && timeLeft > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>Verificando pagamento a cada 5 segundos</span>
            </div>
          )}

          {/* Instructions */}
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700">
            <Info className="h-4 w-4 text-green-800 dark:text-green-200" />
            <AlertTitle className="text-green-900 dark:text-green-100">Como pagar</AlertTitle>
            <AlertDescription className="mt-2 space-y-1 text-slate-700 dark:text-slate-300">
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra o app do seu banco</li>
                <li>Escolha <strong className="text-green-800 dark:text-green-200">PIX → Ler QR Code</strong></li>
                <li>Escaneie o código acima ou cole o código PIX</li>
                <li>Confirme o pagamento</li>
              </ol>
              <p className="text-xs mt-3 text-slate-600 dark:text-slate-400">
                💡 O pagamento é processado instantaneamente e seu plano será ativado automaticamente.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
