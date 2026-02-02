import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingViews: number;
}

export const UpgradeModal = ({ open, onOpenChange, remainingViews }: UpgradeModalProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/premium');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Crown className="h-12 w-12 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {remainingViews > 0 
              ? `Restam ${remainingViews} visualizações gratuitas` 
              : 'Limite de visualizações atingido'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {remainingViews > 0
              ? 'Aproveite suas visualizações gratuitas! Para acesso ilimitado, assine um plano.'
              : 'Você atingiu o limite de 3 visualizações gratuitas. Assine para continuar navegando!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary mt-0.5" />
            <span className="text-sm">Visualizações ilimitadas de perfis</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary mt-0.5" />
            <span className="text-sm">Acesso completo aos contatos (WhatsApp, telefone)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary mt-0.5" />
            <span className="text-sm">Aparece destacado nas buscas</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary mt-0.5" />
            <span className="text-sm">Suporte prioritário</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleUpgrade} className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Ver Planos Premium
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Continuar Navegando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
