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
          <DialogTitle className="text-2xl text-center">Pagar com PIX</DialogTitle>
          <DialogDescription className="text-center">
            Escaneie o QR Code abaixo para realizar o pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 mt-6">
          {/* QR Code Image - Reduzido */}
          <div className="flex justify-center bg-gradient-to-br from-muted/50 to-muted p-4 rounded-xl">
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
            <Label className="text-sm font-semibold">Código PIX (Copia e Cola)</Label>
            <div className="flex gap-2">
              <Input 
                value={qrCode} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Timer de Expiração - Centralizado */}
          {timeLeft > 0 && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                Tempo restante: <span className="font-semibold text-foreground">{formatTime(timeLeft)}</span>
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
          <div className="text-center p-3 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="font-medium">Aguardando confirmação do pagamento...</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Você será redirecionado automaticamente quando o pagamento for confirmado
            </p>
            {checking && (
              <p className="text-xs text-primary mt-1">
                🔍 Verificando status...
              </p>
            )}
          </div>

          {/* Status */}
          {!checking && timeLeft > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Verificando pagamento a cada 5 segundos</span>
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Como pagar</AlertTitle>
            <AlertDescription className="mt-2 space-y-1">
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra o app do seu banco</li>
                <li>Escolha <strong>PIX → Ler QR Code</strong></li>
                <li>Escaneie o código acima ou cole o código PIX</li>
                <li>Confirme o pagamento</li>
              </ol>
              <p className="text-xs mt-3 text-muted-foreground">
                💡 O pagamento é processado instantaneamente e seu plano será ativado automaticamente.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
