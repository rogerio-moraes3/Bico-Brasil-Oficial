import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, Crown } from 'lucide-react';
import { toast } from '@/utils/toast';

const ADMIN_BYPASS_EMAIL = 'nando_petro@hotmail.com';

interface UnlockWithCreditsProps {
    phone: string;
    workerName: string;
    remainingCredits: number;
    onUpgradeClick: () => void;
}

export const UnlockWithCredits = ({
    phone,
    workerName,
    remainingCredits,
    onUpgradeClick
}: UnlockWithCreditsProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUnlock = async () => {
        if (!user) {
            toast.error('Faça login para contatar profissionais');
            return;
        }

        setLoading(true);

        // Admin bypass: nando_petro@hotmail.com pode ver contatos sem gastar créditos
        const isAdmin = user.email === ADMIN_BYPASS_EMAIL;

        if (isAdmin) {
            const cleanPhone = phone.replace(/\D/g, '');
            const message = encodeURIComponent(`Olá ${workerName}, vi seu anúncio no Bico Brasil.`);
            window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
            setLoading(false);
            return;
        }

        // Verificar créditos disponíveis
        if (remainingCredits === 0) {
            setLoading(false);
            onUpgradeClick();
            return;
        }

        // Debitar crédito e liberar contato
        try {
            const { error } = await supabase.rpc('decrement_view_credits', {
                user_auth_id: user.id
            });

            if (error) {
                console.error('❌ Erro ao debitar crédito:', error);
                throw new Error('Erro ao processar sua solicitação');
            }

            toast({
                title: 'Contato liberado!',
                description: `Você tem ${remainingCredits - 1} visualizações restantes`
            });

            const cleanPhone = phone.replace(/\D/g, '');
            const message = encodeURIComponent(`Olá ${workerName}, vi seu anúncio no Bico Brasil.`);
            window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
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
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
