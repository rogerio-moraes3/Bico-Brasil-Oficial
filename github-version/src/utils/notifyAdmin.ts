/**
 * Notifica o admin quando um pagamento for aprovado
 * Pode ser expandido para enviar email, webhook, etc.
 */
export async function notifyAdmin(paymentData: {
  paymentId: string;
  userId: string;
  planType: string;
  amount: number;
  status: string;
}) {
  try {
    // TODO: Implementar notificação real
    // Exemplos:
    // - Enviar email via edge function
    // - Chamar webhook externo
    // - Inserir notificação na tabela de notificações

    // Implementação futura: enviar notificação real

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao notificar admin:", error);
    return { success: false, error };
  }
}
