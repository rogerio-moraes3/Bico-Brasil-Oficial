import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Lock, Crown, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContactAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingViews: number;
  onConfirm?: () => void;
}

export function ContactAccessModal({
  open,
  onOpenChange,
  remainingViews,
  onConfirm,
}: ContactAccessModalProps) {
  const navigate = useNavigate();

  if (remainingViews > 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Visualizar Contato
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p className="text-base">
                Você tem <strong className="text-primary">{remainingViews} consulta{remainingViews !== 1 ? 's' : ''} gratuita{remainingViews !== 1 ? 's' : ''}</strong> restante{remainingViews !== 1 ? 's' : ''}.
              </p>
              <p className="text-sm text-muted-foreground">
                Após visualizar este contato, você terá {remainingViews - 1} consulta{remainingViews - 1 !== 1 ? 's' : ''} disponível{remainingViews - 1 !== 1 ? 'is' : ''}.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-2 mt-4">
            <Button 
              onClick={() => {
                if (onConfirm) onConfirm();
                onOpenChange(false);
              }}
              className="w-full"
            >
              Confirmar Visualização
            </Button>
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-destructive" />
            Consultas Gratuitas Esgotadas
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-2">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-base font-medium text-foreground mb-2">
                Você esgotou suas 3 consultas grátis
              </p>
              <p className="text-sm text-muted-foreground">
                Assine um plano para visualizar contatos ilimitadamente e aproveitar todos os benefícios da plataforma.
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                Benefícios do Plano Premium:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-6">
                <li>Visualização ilimitada de contatos</li>
                <li>Destaque nos resultados de busca</li>
                <li>Suporte prioritário</li>
                <li>Estatísticas detalhadas</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-2 mt-4">
          <Button 
            onClick={() => {
              onOpenChange(false);
              navigate('/premium');
            }}
            className="w-full"
          >
            <Crown className="h-4 w-4 mr-2" />
            Ver Planos Premium
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            Voltar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
