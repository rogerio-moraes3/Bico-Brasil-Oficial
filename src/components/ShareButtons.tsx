import { Button } from '@/components/ui/button';
import { Network, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

export function ShareButtons({
  title = 'Bico Brasil',
  text = 'Encontre profissionais ou ofereça seus serviços no Bico Brasil!',
  url,
  className = ''
}: ShareButtonsProps) {
  const shareUrl = url || window.location.href;
  const whatsappText = encodeURIComponent(`${text}\n\n${shareUrl}`);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado!', {
        description: 'O link foi copiado para a área de transferência.'
      });
    } catch (err) {
      toast.error('Erro ao copiar', {
        description: 'Não foi possível copiar o link.'
      });
    }
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsAppShare}
        className="gap-2"
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-2"
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">Copiar Link</span>
      </Button>
    </div>
  );
}
