import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

/**
 * Valida assinatura do webhook do Mercado Pago usando HMAC SHA-256
 * Documentação: https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
 */
async function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): Promise<boolean> {
  if (!xSignature || !xRequestId) {
    console.debug("⚠️ Headers de assinatura ausentes");
    return false;
  }

  try {
    // 1. Parse do header x-signature (formato: "ts=1234567890,v1=hash")
    const parts = xSignature.split(",");
    let ts = "";
    let hash = "";

    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key && key.trim() === "ts") ts = value;
      if (key && key.trim().startsWith("v")) hash = value;
    }

    if (!ts || !hash) {
      console.debug("⚠️ Formato de assinatura inválido");
      console.debug("   x-signature:", xSignature);
      return false;
    }

    console.debug("🔐 Validando assinatura...");
    console.debug("   Timestamp:", ts);
    console.debug("   Hash recebido:", hash.substring(0, 20) + "...");

    // 2. Criar manifest conforme especificação do Mercado Pago
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    console.debug("📝 Manifest:", manifest);

    // 3. Usar Web Crypto API nativa do Deno (global crypto.subtle)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(manifest);

    // 4. Importar chave secreta para HMAC
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // 5. Gerar assinatura HMAC SHA-256
    const signature = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );

    // 6. Converter para hexadecimal
    const expectedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // 7. Comparar hashes
    const isValid = expectedHash === hash;
    console.debug(`🔐 Resultado: ${isValid ? "✅ ASSINATURA VÁLIDA" : "❌ ASSINATURA INVÁLIDA"}`);
    console.debug(`   Hash esperado: ${expectedHash.substring(0, 20)}...`);
    console.debug(`   Hash recebido: ${hash.substring(0, 20)}...`);

    return isValid;
  } catch (error) {
    console.error("❌ Erro ao validar assinatura:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.debug('🔔 ========== WEBHOOK MERCADO PAGO ==========');

    const body = await req.json();
    const url = new URL(req.url);
    const topic = body.topic || body.type;
    let mpId: string | null = null;

    if (topic === 'payment') {
      if (body.topic) {
        mpId = url.searchParams.get('id');
      } else if (body.type) {
        mpId = url.searchParams.get('data.id');
      }
    }

    if (!mpId) {
      mpId = body?.data?.id ?? null;
    }

    if (!mpId || topic !== 'payment') {
      console.debug('⚠️ Notificação ignorada');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    console.debug('🔔 MP ID recebido:', mpId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validar assinatura - OBRIGATÓRIO para segurança
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");
    const webhookSecret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");

    // CRÍTICO: Rejeitar requisições se o secret não estiver configurado
    if (!webhookSecret) {
      console.error("❌ MERCADOPAGO_WEBHOOK_SECRET não configurado - rejeitando webhook");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CRÍTICO: Rejeitar requisições sem headers de assinatura
    if (!xSignature || !xRequestId) {
      console.error("❌ Headers de assinatura ausentes - rejeitando webhook");
      return new Response(JSON.stringify({ error: "Missing signature headers" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validar assinatura HMAC
    const isValid = await validateWebhookSignature(xSignature, xRequestId, mpId.toString(), webhookSecret);
    if (!isValid) {
      console.error("❌ ASSINATURA INVÁLIDA!");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.debug("✅ Assinatura validada com sucesso");

    const mpToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mpToken) {
      console.error('❌ Token MP não configurado');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Fetch payment details from Mercado Pago
    console.debug('📡 Buscando detalhes do pagamento no MP...');
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${mpId}`,
      {
        headers: {
          'Authorization': `Bearer ${mpToken}`,
        }
      }
    );

    if (!mpResponse.ok) {
      console.error('❌ Erro ao buscar pagamento no MP:', mpResponse.status);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const mpData = await mpResponse.json();
    console.debug('✅ Detalhes do pagamento recebidos');
    console.debug('💳 Status MP:', mpData.status);
    console.debug('💰 Valor:', mpData.transaction_amount);
    console.debug('📧 Email:', mpData.payer?.email);
    if (mpData.status !== 'approved') {
      console.debug('ℹ️ Pagamento não aprovado:', mpData.status);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const { data: order, error: orderError } = await supabase
      .from('destaque_orders')
      .select('*')
      .eq('mercadopago_payment_id', mpId.toString())
      .maybeSingle();

    if (orderError || !order) {
      console.error('❌ Pedido de destaque não encontrado:', mpId);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    console.debug('✅ Pedido de destaque encontrado:', order.id);
    console.debug('👤 Usuário ID:', order.user_id);

    if (order.status === 'approved') {
      console.debug('✅ Pedido já aprovado (idempotente):', order.id);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + (order.days || 0));

    const { error: orderUpdateError } = await supabase
      .from('destaque_orders')
      .update({
        status: 'approved',
        updated_at: now.toISOString()
      })
      .eq('id', order.id)
      .neq('status', 'approved');

    if (orderUpdateError) {
      console.error('❌ Erro ao aprovar pedido de destaque:', orderUpdateError);
    } else {
      console.debug('✅ Pedido aprovado no banco:', order.id);
    }

    const { data: activeHighlight, error: highlightError } = await supabase
      .from('ads_highlight')
      .select('id, ends_at')
      .eq('user_id', order.user_id)
      .gt('ends_at', now.toISOString())
      .order('ends_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (highlightError) {
      console.error('❌ Erro ao buscar destaque ativo:', highlightError);
    }

    if (activeHighlight?.id) {
      const currentEnd = new Date(activeHighlight.ends_at);
      const finalEnd = currentEnd > endsAt ? currentEnd : endsAt;
      const { error: highlightUpdateError } = await supabase
        .from('ads_highlight')
        .update({
          ends_at: finalEnd.toISOString(),
          price: order.amount
        })
        .eq('id', activeHighlight.id);

      if (highlightUpdateError) {
        console.error('❌ Erro ao atualizar destaque:', highlightUpdateError);
      } else {
        console.debug('✅ Destaque atualizado:', {
          highlightId: activeHighlight.id,
          userId: order.user_id,
          ends_at: finalEnd.toISOString()
        });
      }
    } else {
      const { error: highlightInsertError } = await supabase
        .from('ads_highlight')
        .insert({
          user_id: order.user_id,
          starts_at: now.toISOString(),
          ends_at: endsAt.toISOString(),
          price: order.amount
        });

      if (highlightInsertError) {
        console.error('❌ Erro ao inserir destaque:', highlightInsertError);
      } else {
        console.debug('✅ Destaque criado:', {
          userId: order.user_id,
          starts_at: now.toISOString(),
          ends_at: endsAt.toISOString()
        });
      }
    }

    console.debug('✅ Webhook processado com sucesso');
    console.debug('==========================================\n');
    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return new Response('OK', { status: 200, headers: corsHeaders });
  }
});
