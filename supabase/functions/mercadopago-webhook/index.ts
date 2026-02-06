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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.debug('🔔 ========== WEBHOOK MERCADO PAGO ==========');

    const url = new URL(req.url);
    let body: Record<string, any> = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const paymentId = url.searchParams.get('id') ||
      url.searchParams.get('data.id') ||
      body?.data?.id ||
      body?.id;
    const topic = url.searchParams.get('topic') ||
      url.searchParams.get('type') ||
      body?.topic ||
      body?.type;

    if (!paymentId || topic !== 'payment') {
      console.debug('⚠️ Notificação ignorada');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const paymentIdString = paymentId.toString();

    // Validar assinatura - OBRIGATÓRIO para segurança
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");
    const webhookSecret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");

    // CRÍTICO: Rejeitar requisições se o secret não estiver configurado
    if (!webhookSecret) {
      console.error("❌ MERCADOPAGO_WEBHOOK_SECRET não configurado - rejeitando webhook");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 401,
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
    const isValid = await validateWebhookSignature(xSignature, xRequestId, paymentIdString, webhookSecret);
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
      `https://api.mercadopago.com/v1/payments/${paymentIdString}`,
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
      console.debug('ℹ️ Pagamento não aprovado, ignorando');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const externalReference = mpData?.external_reference?.toString();
    let order: any = null;

    if (externalReference && isUuid(externalReference)) {
      const { data: orderByExternal, error: orderByExternalError } = await supabase
        .from('destaque_orders')
        .select('*')
        .eq('id', externalReference)
        .limit(1);

      if (!orderByExternalError && orderByExternal && orderByExternal.length > 0) {
        order = orderByExternal[0];
      }
    }

    if (!order) {
      const { data: orderByMpId, error: orderByMpIdError } = await supabase
        .from('destaque_orders')
        .select('*')
        .eq('mercadopago_payment_id', paymentIdString)
        .limit(1);

      if (!orderByMpIdError && orderByMpId && orderByMpId.length > 0) {
        order = orderByMpId[0];
      }
    }

    if (!order) {
      const { data: orderByPaymentId, error: orderByPaymentIdError } = await supabase
        .from('destaque_orders')
        .select('*')
        .eq('payment_id', paymentIdString)
        .limit(1);

      if (!orderByPaymentIdError && orderByPaymentId && orderByPaymentId.length > 0) {
        order = orderByPaymentId[0];
      }
    }

    if (!order) {
      console.error('❌ Pedido de destaque não encontrado:', paymentIdString);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    console.debug('✅ Pedido de destaque encontrado:', order.id);

    const now = new Date();
    const nowIso = now.toISOString();

    const { data: updatedOrders, error: updateError } = await supabase
      .from('destaque_orders')
      .update({
        status: 'approved',
        paid_at: nowIso,
        mercadopago_payment_id: paymentIdString,
        updated_at: nowIso,
      })
      .eq('id', order.id)
      .neq('status', 'approved')
      .select('id');

    if (updateError) {
      console.error('❌ Erro ao atualizar pedido:', updateError);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    if (!updatedOrders || updatedOrders.length === 0) {
      console.debug('ℹ️ Pedido já estava aprovado, encerrando');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const highlightDays = Number(order.days ?? 0);
    const durationDays = Number.isFinite(highlightDays) && highlightDays > 0 ? highlightDays : 0;

    if (durationDays <= 0) {
      console.error('❌ Dias inválidos para destaque:', order.days);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const { data: activeHighlights, error: highlightError } = await supabase
      .from('ads_highlight')
      .select('*')
      .eq('user_id', order.user_id)
      .gt('ends_at', nowIso)
      .order('ends_at', { ascending: false })
      .limit(1);

    if (highlightError) {
      console.error('❌ Erro ao buscar destaque ativo:', highlightError);
    }

    const activeHighlight = activeHighlights && activeHighlights.length > 0 ? activeHighlights[0] : null;
    const baseEndsAt = activeHighlight?.ends_at ? new Date(activeHighlight.ends_at) : now;
    const baseDate = baseEndsAt.getTime() > now.getTime() ? baseEndsAt : now;
    const newEndsAt = new Date(baseDate);
    newEndsAt.setDate(newEndsAt.getDate() + durationDays);

    if (activeHighlight) {
      const { error: updateHighlightError } = await supabase
        .from('ads_highlight')
        .update({ ends_at: newEndsAt.toISOString() })
        .eq('id', activeHighlight.id);

      if (updateHighlightError) {
        console.error('❌ Erro ao estender destaque:', updateHighlightError);
      }
    } else {
      const { error: insertHighlightError } = await supabase
        .from('ads_highlight')
        .insert({
          user_id: order.user_id,
          starts_at: nowIso,
          ends_at: newEndsAt.toISOString(),
          price: order.amount,
        });

      if (insertHighlightError) {
        console.error('❌ Erro ao criar destaque:', insertHighlightError);
      }
    }

    const emailPayload = {
      to: mpData?.payer?.email || '',
      subject: '✅ Pagamento de destaque aprovado - Bico Brasil',
      type: 'payment_approved',
      data: {
        userName: mpData?.payer?.first_name || 'Usuário',
        planName: `Destaque ${durationDays} dias`,
        amount: order.amount,
        subscriptionStart: now.toLocaleDateString('pt-BR'),
        subscriptionEnd: newEndsAt.toLocaleDateString('pt-BR'),
        profileUrl: `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://bicobrasil.com.br'}/profile`,
      },
    };

    if (emailPayload.to) {
      const emailPromise = fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
        },
        body: JSON.stringify(emailPayload),
      }).catch((err) => console.error("⚠️ Erro ao enviar email (não fatal):", err));

      const waitUntil = (globalThis as { EdgeRuntime?: { waitUntil?: (promise: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil;
      if (waitUntil) {
        waitUntil(emailPromise);
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
