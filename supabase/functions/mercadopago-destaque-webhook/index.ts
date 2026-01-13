import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função de validação de assinatura do webhook
async function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): Promise<boolean> {
  if (!xSignature || !xRequestId) return false;

  try {
    const parts = xSignature.split(',');
    let ts = '', hash = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key?.trim() === 'ts') ts = value;
      if (key?.trim().startsWith('v')) hash = value;
    }

    if (!ts || !hash) return false;

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(manifest);

    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return expectedHash === hash;
  } catch (error) {
    console.error('Erro ao validar assinatura:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.debug('Webhook recebido:', body);

    // MercadoPago envia notificações de payment
    if (body.type === 'payment' || body.topic === 'payment') {
      const paymentId = body.data?.id || body.id;

      if (!paymentId) {
        return new Response('OK', { status: 200 });
      }

      // VALIDAR ASSINATURA DO WEBHOOK
      const xSignature = req.headers.get('x-signature');
      const xRequestId = req.headers.get('x-request-id');
      const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');

      if (!webhookSecret) {
        console.error('❌ MERCADOPAGO_WEBHOOK_SECRET não configurado');
        return new Response('Configuration error', { status: 500, headers: corsHeaders });
      }

      const isValid = await validateWebhookSignature(
        xSignature,
        xRequestId,
        paymentId.toString(),
        webhookSecret
      );

      if (!isValid) {
        console.error('❌ Assinatura de webhook inválida');
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      console.debug('✅ Assinatura do webhook validada');

      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

      // Buscar informações do pagamento
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const payment = await paymentResponse.json();
      console.debug('Payment details:', payment);

      const externalReference = payment.external_reference;

      if (!externalReference) {
        console.debug('Sem external_reference, ignorando');
        return new Response('OK', { status: 200 });
      }

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Buscar ordem diretamente pelo ID (external_reference é o order.id)
      const { data: order } = await supabaseClient
        .from('destaque_orders')
        .select('*')
        .eq('id', externalReference)
        .single();

      if (!order) {
        console.error('Ordem não encontrada:', externalReference);
        return new Response('OK', { status: 200 });
      }

      if (payment.status === 'approved') {
        // Ativar destaque
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + order.days);

        await supabaseClient.from('destaque_orders').update({
          status: 'paid',
          payment_id: paymentId,
          paid_at: new Date().toISOString(),
        }).eq('id', order.id);

        // Atualizar perfil do usuário com destaque
        await supabaseClient.from('users').update({
          destaque_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', order.user_id);

        console.debug('✅ Destaque ativado para usuário:', order.user_id);
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        await supabaseClient.from('destaque_orders').update({
          status: 'failed',
          payment_id: paymentId,
        }).eq('id', order.id);

        console.debug('❌ Pagamento rejeitado/cancelado');
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('OK', { status: 200 });
  }
});
