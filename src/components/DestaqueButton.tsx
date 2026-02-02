import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Star, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PixQRCodeModal } from './PixQRCodeModal';

interface DestaqueButtonProps {
  initialDays?: number;
}

export const DestaqueButton = ({ initialDays = 1 }: DestaqueButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(initialDays);
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerCPF, setPayerCPF] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  // Auto-fill user data when modal opens
  useEffect(() => {
    if (open && user) {
      const fetchUserData = async () => {
        const { data } = await supabase
          .from('users')
          .select('name, phone, email, cpf')
          .eq('auth_id', user.id)
          .single();

        if (data) {
          setPayerName(data.name || '');
          setPayerPhone(data.phone || '');
          setPayerEmail(data.email || user.email || '');
          setPayerCPF(data.cpf ? formatCPF(data.cpf) : '');
        }
      };
      fetchUserData();
    }
  }, [open, user]);

  const handleActivateDestaque = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para ativar o Anúncio Destaque",
        variant: "destructive"
      });
      return;
    }

    // Validações
    if (!payerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, preencha seu nome completo",
        variant: "destructive"
      });
      return;
    }

    const phoneDigits = payerPhone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, preencha um telefone válido",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payerEmail.trim() || !emailRegex.test(payerEmail.trim())) {
      toast({
        title: "Email inválido",
        description: "Por favor, preencha um email válido",
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

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Não autenticado');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/create-destaque-payment`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          days,
          amount: totalPrice,
          payment_method: "pix",
          payer: {
            name: payerName.trim(),
            cpf: cpfNumbers,
            email: payerEmail.trim(),
            phone: phoneDigits
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro ao criar pagamento PIX');
      }

      if (data.qr_code) {
        setQrCode(data.qr_code);
        setQrCodeBase64(data.qr_code_base64);
        setPaymentId(data.payment_id);
        setShowQrModal(true);
        setOpen(false);

        toast({
          title: "QR Code gerado!",
          description: "Escaneie o código para pagar"
        });
      }
    } catch (error) {
      console.error('Erro ao ativar destaque:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Tabela de preços fixa
  const priceTable: Record<number, number> = {
    1: 9.90,
    3: 24.90,
    7: 39.90,
    15: 69.90,
    30: 99.90
  };

  const totalPrice = priceTable[days] || 0;

  // Opções de planos
  const planOptions = [
    { days: 1, label: '1 dia', price: 9.90 },
    { days: 3, label: '3 dias', price: 24.90 },
    { days: 7, label: '7 dias', price: 39.90 },
    { days: 15, label: '15 dias', price: 69.90 },
    { days: 30, label: '30 dias', price: 99.90 }
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="w-full text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Assinar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto touch-pan-y overscroll-y-contain">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="bg-primary">
                <Star className="h-3 w-3 mr-1" />
                Destaque
              </Badge>
            </div>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Zap className="h-5 w-5 text-primary" />
              Anúncio Destaque
            </DialogTitle>
            <DialogDescription>
              Fique no topo da página inicial e seja visto por mais clientes!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Benefícios:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Aparece no centro da página inicial</li>
                <li>• Destaque visual com fundo colorido</li>
                <li>• Prioridade máxima nas buscas</li>
                <li>• Mais visualizações e contatos</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Escolha o período:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {planOptions.map((option) => (
                  <Button
                    key={option.days}
                    variant={days === option.days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDays(option.days)}
                    className={`relative transition-all ${days === option.days ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-xs opacity-80">R$ {option.price.toFixed(2)}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                disabled={loading}
              />
            </div>

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

            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Total a pagar:</p>
              <p className="text-3xl font-bold text-primary">
                R$ {totalPrice.toFixed(2)}
              </p>
            </div>

            <Button
              onClick={handleActivateDestaque}
              className="w-full gap-2"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Gerar QR Code PIX
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PixQRCodeModal
        open={showQrModal}
        onOpenChange={setShowQrModal}
        qrCode={qrCode}
        qrCodeBase64={qrCodeBase64}
        paymentId={paymentId}
      />
    </>
  );
};
