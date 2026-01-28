import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';

function sanitizePhone(phone: string): string {
    return (phone || '').replace(/\D/g, '');
}

const ADMIN_BYPASS_EMAIL = 'nando_petro@hotmail.com';

export const JobDetails = () => {
    const { user } = useAuth();

    const handleWhatsAppClick = (phone: string) => {
        const cleanPhone = sanitizePhone(phone);
        if (!cleanPhone) {
            toast.error('Este profissional não possui um número de WhatsApp válido.');
            return;
        }

        // Admin bypass: nando_petro@hotmail.com pode ver contatos sem travas
        const isAdmin = user?.email === ADMIN_BYPASS_EMAIL;

        if (isAdmin) {
            window.open(`https://wa.me/55${cleanPhone}`, '_blank');
            return;
        }

        // Lógica normal de créditos para outros usuários
        window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    };

    return { handleWhatsAppClick, sanitizePhone };
};

export { sanitizePhone, ADMIN_BYPASS_EMAIL };
