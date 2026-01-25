import React from 'react';

const CHECKOUT_URL = process.env.REACT_APP_CHECKOUT_URL || '';

const UpgradeToPaid = () => {
    const handleUpgrade = () => {
        if (!CHECKOUT_URL) {
            console.error('URL de checkout não configurada.');
            return;
        }
        // Redirecionamento direto para o Mercado Pago
        window.location.href = CHECKOUT_URL;
    };

    return (
        <button onClick={handleUpgrade}>
            Desbloquear Bicos Ilimitados
        </button>
    );
};

export default UpgradeToPaid;
