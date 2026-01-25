import React from 'react';
import { toast } from '@/utils/toast';

function sanitizePhone(phone: string): string {
    return (phone || '').replace(/\D/g, '');
}

// No componente JobDetails, use esta lógica para o WhatsApp:
const handleWhatsAppClick = (phone: string) => {
    const cleanPhone = sanitizePhone(phone);
    if (!cleanPhone) {
        toast.error('Este profissional não possui um número de WhatsApp válido.');
        return;
    }
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
};

export { sanitizePhone, handleWhatsAppClick };
