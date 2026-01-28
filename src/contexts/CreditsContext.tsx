import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_BYPASS_EMAIL = 'nando_petro@hotmail.com';

interface CreditsContextType {
    remainingCredits: number;
    isAdmin: boolean;
    refreshCredits: () => Promise<void>;
    spendCredit: () => Promise<boolean>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [remainingCredits, setRemainingCredits] = useState(3);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (user) {
            // Verificar se é admin
            setIsAdmin(user.email === ADMIN_BYPASS_EMAIL);

            // Carregar créditos do banco
            refreshCredits();
        }
    }, [user]);

    const refreshCredits = async () => {
        if (!user) return;

        // Admin bypass: admin sempre tem créditos ilimitados
        if (user.email === ADMIN_BYPASS_EMAIL) {
            setRemainingCredits(999);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_credits')
                .select('remaining_free_views')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            setRemainingCredits(data?.remaining_free_views || 0);
        } catch (error) {
            console.error('❌ Erro ao carregar créditos:', error);
            setRemainingCredits(0);
        }
    };

    const spendCredit = async (): Promise<boolean> => {
        if (!user) return false;

        // Admin bypass: admin não gasta créditos
        if (user.email === ADMIN_BYPASS_EMAIL) {
            return true;
        }

        try {
            const { error } = await supabase.rpc('decrement_view_credits', {
                user_auth_id: user.id
            });

            if (error) throw error;

            // Atualizar créditos localmente
            setRemainingCredits(prev => Math.max(0, prev - 1));
            return true;
        } catch (error) {
            console.error('❌ Erro ao debitar crédito:', error);
            return false;
        }
    };

    return (
        <CreditsContext.Provider value={{ remainingCredits, isAdmin, refreshCredits, spendCredit }}>
            {children}
        </CreditsContext.Provider>
    );
};

export const useCredits = () => {
    const context = useContext(CreditsContext);
    if (!context) {
        throw new Error('useCredits must be used within CreditsProvider');
    }
    return context;
};

// Função assíncrona para garantir que o crédito seja debitado no banco antes de liberar o contato
export async function spendCreditAndRevealContact(userId: string, jobId: string, userEmail?: string) {
    // Admin bypass
    if (userEmail === ADMIN_BYPASS_EMAIL) {
        return true;
    }

    try {
        const { data, error } = await supabase
            .from('user_credits')
            .update({ used_free_bicos: supabase.rpc('increment', { row_id: userId }) })
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('❌ Erro ao debitar crédito:', error);
        return false;
    }
}

export { ADMIN_BYPASS_EMAIL };
