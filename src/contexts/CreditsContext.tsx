import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Função assíncrona para garantir que o crédito seja debitado no banco antes de liberar o contato
export async function spendCreditAndRevealContact(userId: string, jobId: string) {
    try {
        const { data, error } = await supabase
            .from('user_credits')
            .update({ used_free_bicos: supabase.rpc('increment', { row_id: userId }) })
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao debitar crédito:', error);
        return false;
    }
}
