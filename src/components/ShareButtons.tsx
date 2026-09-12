import { Button } from '@/components/ui/button';
import { Network, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  /** Classes extras pra cada botão — usado quando o botão precisa bater o
   * tamanho de outro botão vizinho fora deste componente (ex.: "Filtros"
   * em ProcurarBicos.tsx). Sem isso, mantém o tamanho compacto padrão. */
  buttonClassName?: string;
}

export function ShareButtons({
  title = 'Bico Brasil',
  text = 'Encontre profissionais ou ofereça seus serviços no Bico Brasil!',
  url,
  className = '',
  buttonClassName = ''
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
        className={cn("gap-2", buttonClassName)}
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className={cn("gap-2", buttonClassName)}
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">Copiar Link</span>
      </Button>
    </div>
  );
}
