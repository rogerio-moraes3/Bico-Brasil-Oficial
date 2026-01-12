/**
 * Mercado Pago Integration
 * Funções auxiliares para pagamentos
 */

export const MERCADOPAGO_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "",
  // Access token é usado apenas no backend (Edge Functions)
};

export interface PixPaymentData {
  payment_id: string;
  qr_code: string;
  qr_code_base64: string;
  mercadopago_id?: string;
}

export interface PaymentRequest {
  planType: 'basico' | 'vip';
  amount: number;
  payer: {
    cpf: string;
    email?: string;
    name?: string;
  };
}

export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, "");
  return numbers.length === 11;
};
