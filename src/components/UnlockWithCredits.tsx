import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, Crown } from 'lucide-react';
import { toast } from '@/utils/toast';

const ADMIN_BYPASS_EMAIL = 'nando_petro@hotmail.com';

interface UnlockWithCreditsProps {
    workerId: string;
    workerName: string;
    remainingCredits: number;
    onUpgradeClick: () => void;
}

export const UnlockWithCredits = ({
    workerId,
    workerName,
    remainingCredits,
    onUpgradeClick
}: UnlockWithCreditsProps) => {
    const { user } = useAuth();
    const { hasUnlockedWorker, unlockWorkerContact } = useAccessControl();
    const [loading, setLoading] = useState(false);

    const openWhatsApp = (phoneNumber: string) => {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const message = encodeURIComponent(`Olá ${workerName}, vi seu anúncio no Bico Brasil.`);
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

    const handleUnlock = async () => {
        if (!user) {
            toast.error('Faça login para contatar profissionais');
            return;
        }

        setLoading(true);

        // Admin bypass: nando_petro@hotmail.com pode ver contatos sem gastar créditos
        const isAdmin = user.email === ADMIN_BYPASS_EMAIL;

        try {
            if (isAdmin) {
                await fetchAndOpen();
                setLoading(false);
                return;
            }

            const alreadyUnlocked = await hasUnlockedWorker(workerId);
            if (alreadyUnlocked) {
                await fetchAndOpen();
                setLoading(false);
                return;
            }

            if (remainingCredits === 0) {
                setLoading(false);
                onUpgradeClick();
                return;
            }

            const unlocked = await unlockWorkerContact(workerId);
            if (!unlocked) {
                throw new Error('Não foi possível desbloquear o contato');
            }

            toast({
                title: 'Contato liberado!',
                description: `Você tem ${remainingCredits - 1} visualizações restantes`
            });

            await fetchAndOpen();
        } catch (err: any) {
            console.error('❌ Erro ao desbloquear contato:', err);
            toast.error(err.message || 'Não foi possível desbloquear o contato');
        }

        setLoading(false);
    };

    return (
        <Button
            onClick={handleUnlock}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Desbloqueando...
                </>
            ) : (
                <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {user?.email === ADMIN_BYPASS_EMAIL ? (
                        <>
                            <Crown className="mr-2 h-4 w-4" />
                            Ver Contato (Admin)
                        </>
                    ) : (
                        `Desbloquear Contato (${remainingCredits} restantes)`
                    )}
                </>
            )}
        </Button>
    );
};
