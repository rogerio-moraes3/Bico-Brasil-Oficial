import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppContactButtonProps {
  phone: string;
  workerName: string;
  canViewContact: boolean;
  remainingViews: number;
  onUpgradeClick: () => void;
}

export const WhatsAppContactButton = ({
  phone,
  workerName,
  canViewContact,
  remainingViews,
  onUpgradeClick
}: WhatsAppContactButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleContact = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para contatar profissionais",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Se for premium/tester, abrir WhatsApp diretamente
    if (canViewContact) {
      const cleanPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá ${workerName}, vi seu anúncio no Bico Brasil e tenho interesse.`);
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
      setLoading(false);
      return;
    }

    // Se não for premium, verificar créditos
    if (remainingViews === 0) {
      setLoading(false);
      onUpgradeClick();
      return;
    }

    // Decrementar crédito para usuários free
    try {
      const { error } = await supabase.rpc('decrement_view_credits', {
        user_auth_id: user.id
      });
      
      if (error) throw error;

      toast({
        title: "Visualização registrada",
        description: `Você tem ${remainingViews - 1} visualizações restantes`,
      });

      // Abrir WhatsApp após decrementar
      const cleanPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá ${workerName}, vi seu anúncio no Bico Brasil e tenho interesse.`);
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    } catch (err) {
      console.error("Erro ao decrementar visualização:", err);
      toast({
        title: "Erro",
        description: "Não foi possível registrar visualização",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  return (
    <Button
      onClick={handleContact}
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Abrindo...
        </>
      ) : (
        <>
          <MessageSquare className="mr-2 h-4 w-4" />
          Contatar via WhatsApp
        </>
      )}
    </Button>
  );
};