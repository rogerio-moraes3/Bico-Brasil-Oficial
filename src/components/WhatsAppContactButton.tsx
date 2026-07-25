import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppContactButtonProps {
  workerId: string;
  workerName: string;
  canViewContact: boolean;
  remainingViews: number;
  onUpgradeClick: () => void;
}

export const WhatsAppContactButton = ({
  workerId,
  workerName,
  canViewContact,
  remainingViews,
  onUpgradeClick
}: WhatsAppContactButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasUnlockedWorker, unlockWorkerContact } = useAccessControl();

  const openWhatsApp = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${workerName}, vi seu anúncio no Bico Brasil e tenho interesse.`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const fetchAndOpen = async () => {
    const { data, error } = await supabase.rpc('get_worker_contact', { worker_id: workerId });
    const contact = Array.isArray(data) ? data[0] : data;
    if (error || !contact?.phone) {
      throw new Error('Não foi possível obter o telefone. Tente novamente.');
    }
    openWhatsApp(contact.phone);
  };

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

    try {
      // Premium/tester: acesso direto
      if (canViewContact) {
        await fetchAndOpen();
        setLoading(false);
        return;
      }

      // Já desbloqueou esse contato antes
      const alreadyUnlocked = await hasUnlockedWorker(workerId);
      if (alreadyUnlocked) {
        await fetchAndOpen();
        setLoading(false);
        return;
      }

      // Sem cota grátis restante
      if (remainingViews <= 0) {
        setLoading(false);
        onUpgradeClick();
        return;
      }

      // Consome uma das 3 consultas grátis
      const unlocked = await unlockWorkerContact(workerId);
      if (!unlocked) {
        throw new Error('Não foi possível desbloquear o contato');
      }

      toast({
        title: "Contato desbloqueado!",
        description: `Você tem ${remainingViews - 1} visualizações restantes`,
      });

      await fetchAndOpen();
    } catch (err: any) {
      console.error("❌ Erro ao contatar:", err);
      toast({
        title: "Erro",
        description: err.message || "Não foi possível abrir o WhatsApp. Tente novamente.",
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
