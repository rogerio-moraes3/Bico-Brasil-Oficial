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
    console.warn("⚠️ Headers de assinatura ausentes");
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
      console.warn("⚠️ Formato de assinatura inválido");
      console.log("   x-signature:", xSignature);
      return false;
    }

    console.log("🔐 Validando assinatura...");
    console.log("   Timestamp:", ts);
    console.log("   Hash recebido:", hash.substring(0, 20) + "...");

    // 2. Criar manifest conforme especificação do Mercado Pago
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    console.log("📝 Manifest:", manifest);
    
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
    console.log(`🔐 Resultado: ${isValid ? "✅ ASSINATURA VÁLIDA" : "❌ ASSINATURA INVÁLIDA"}`);
    console.log(`   Hash esperado: ${expectedHash.substring(0, 20)}...`);
    console.log(`   Hash recebido: ${hash.substring(0, 20)}...`);
    
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
    console.log('🔔 ========== WEBHOOK MERCADO PAGO ==========');
    
    const body = await req.json();
    const paymentId = body.data?.id || body.id;
    const topic = body.topic || body.type;

    if (!paymentId || topic !== 'payment') {
      console.log('⚠️ Notificação ignorada');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

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
    const isValid = await validateWebhookSignature(xSignature, xRequestId, paymentId.toString(), webhookSecret);
    if (!isValid) {
      console.error("❌ ASSINATURA INVÁLIDA!");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("✅ Assinatura validada com sucesso");

    const mpToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mpToken) {
      console.error('❌ Token MP não configurado');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Fetch payment details from Mercado Pago
    console.log('📡 Buscando detalhes do pagamento no MP...');
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
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
    console.log('✅ Detalhes do pagamento recebidos');
    console.log('💳 Status MP:', mpData.status);
    console.log('💰 Valor:', mpData.transaction_amount);
    console.log('📧 Email:', mpData.payer?.email);

    // Find payment in our database using mercadopago_payment_id
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('mercadopago_payment_id', paymentId.toString())
      .single();

    if (paymentError || !payment) {
      console.error('❌ Pagamento não encontrado no banco:', paymentId);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    console.log('✅ Pagamento encontrado:', payment.id);

    // Map Mercado Pago status to our status
    let newStatus: "paid" | "failed" | "pending" | "in_process" = "pending";
    const mpStatus = mpData.status;
    
    if (mpStatus === "approved") newStatus = "paid";
    else if (["rejected", "cancelled", "refunded", "charged_back"].includes(mpStatus)) newStatus = "failed";
    else if (["in_process", "pending", "authorized"].includes(mpStatus)) newStatus = "in_process";
    else newStatus = "pending";

    console.log('🔄 Atualizando status:', payment.status, '->', newStatus);

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: newStatus,
        webhook_response: mpData,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar pagamento:', updateError);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // If payment approved, activate user plan
    if (newStatus === 'paid' && payment.user_id) {
      console.log('🎉 ========== PAGAMENTO APROVADO ==========');
      console.log('👤 Usuário ID:', payment.user_id);
      console.log('💰 Valor:', mpData.transaction_amount);
      console.log('📦 Plano:', payment.plan_type || 'basico');

      const planType = payment.plan_type || 'basico';
      const now = new Date();
      
      // Calcular duração baseada no plano
      const duration = planType === 'anual' ? 365 : 30;
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + duration);

      const { error: updateUserError } = await supabase
        .from("users")
        .update({
          plan_active: true,
          plan_type: planType,
          subscription_start: now.toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
        })
        .eq("id", payment.user_id);

      if (updateUserError) {
        console.error("❌ Erro ao ativar plano:", updateUserError);
      } else {
        console.log("✅ Plano ativado com sucesso!");
        console.log(`   Tipo: ${planType}`);
        console.log(`   Válido de: ${now.toISOString()}`);
        console.log(`   Válido até: ${subscriptionEnd.toISOString()}`);
      }

      const { error: subError } = await supabase
        .from("payments")
        .update({
          subscription_start: now.toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
        })
        .eq("id", payment.id);

      if (subError) console.error("Erro ao atualizar subscription dates:", subError);

      // Buscar dados do usuário para email
      const { data: userData } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", payment.user_id)
        .single();

      // Enviar sequência completa de emails transacionais
      if (userData?.email) {
        try {
          const appUrl = Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://bicobrasil.com.br';
          const emailBaseUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`;
          const emailHeaders = {
            "Content-Type": "application/json",
            "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
          };

          // 1. Confirmação de Pagamento Aprovado (imediato)
          console.log("📧 [1/4] Enviando confirmação de pagamento...");
          await fetch(emailBaseUrl, {
            method: "POST",
            headers: emailHeaders,
            body: JSON.stringify({
              to: userData.email,
              subject: "✅ Pagamento Aprovado - Bico Brasil",
              type: "payment_approved",
              data: {
                userName: userData.name || 'Usuário',
                planName: planType === 'basico' ? 'Plano Básico' : planType === 'vip' ? 'Plano VIP' : 'Plano Anual',
                amount: mpData.transaction_amount || payment.amount,
                subscriptionStart: now.toLocaleDateString('pt-BR'),
                subscriptionEnd: subscriptionEnd.toLocaleDateString('pt-BR'),
                profileUrl: `${appUrl}/profile`,
              },
            }),
          });
          console.log("✅ [1/4] Email de confirmação enviado");

          // 2. Recibo Profissional (após 3 segundos)
          setTimeout(async () => {
            try {
              console.log("📧 [2/4] Enviando recibo...");
              await fetch(emailBaseUrl, {
                method: "POST",
                headers: emailHeaders,
                body: JSON.stringify({
                  to: userData.email,
                  subject: "🧾 Recibo de Pagamento - Bico Brasil",
                  type: "payment_receipt",
                  data: {
                    name: userData.name || 'Usuário',
                    planName: planType === 'basico' ? 'Plano Básico' : planType === 'vip' ? 'Plano VIP' : 'Plano Anual',
                    amount: mpData.transaction_amount || payment.amount,
                    paymentId: mpData.id || paymentId,
                    paymentDate: now.toLocaleDateString('pt-BR'),
                    subscriptionStart: now.toLocaleDateString('pt-BR'),
                    subscriptionEnd: subscriptionEnd.toLocaleDateString('pt-BR'),
                    profileUrl: `${appUrl}/profile`,
                  },
                }),
              });
              console.log("✅ [2/4] Recibo enviado");
            } catch (err) {
              console.error("⚠️ Erro ao enviar recibo (não fatal):", err);
            }
          }, 3000);

          // 3. Liberação de Acesso (após 6 segundos)
          setTimeout(async () => {
            try {
              console.log("📧 [3/4] Enviando liberação de acesso...");
              await fetch(emailBaseUrl, {
                method: "POST",
                headers: emailHeaders,
                body: JSON.stringify({
                  to: userData.email,
                  subject: "🎉 Seu Plano Foi Ativado - Bico Brasil",
                  type: "plan_activated",
                  data: {
                    name: userData.name || 'Usuário',
                    planName: planType === 'basico' ? 'Plano Básico' : planType === 'vip' ? 'Plano VIP' : 'Plano Anual',
                    subscriptionStart: now.toLocaleDateString('pt-BR'),
                    subscriptionEnd: subscriptionEnd.toLocaleDateString('pt-BR'),
                    profileUrl: `${appUrl}/profile`,
                  },
                }),
              });
              console.log("✅ [3/4] Email de liberação enviado");
            } catch (err) {
              console.error("⚠️ Erro ao enviar liberação (não fatal):", err);
            }
          }, 6000);

          // 4. Boas-Vindas (após 10 segundos)
          setTimeout(async () => {
            try {
              console.log("📧 [4/4] Enviando boas-vindas...");
              await fetch(emailBaseUrl, {
                method: "POST",
                headers: emailHeaders,
                body: JSON.stringify({
                  to: userData.email,
                  subject: "👋 Bem-vindo ao Bico Brasil - Comece Agora!",
                  type: "welcome",
                  data: {
                    name: userData.name || 'Usuário',
                    profileUrl: `${appUrl}/profile`,
                  },
                }),
              });
              console.log("✅ [4/4] Email de boas-vindas enviado");
            } catch (err) {
              console.error("⚠️ Erro ao enviar boas-vindas (não fatal):", err);
            }
          }, 10000);

        } catch (emailErr) {
          console.error("⚠️ Erro geral no envio de emails (não fatal):", emailErr);
        }
      }

      // Criar notificação para o usuário
      const { error: notifUserError } = await supabase
        .from("notifications")
        .insert({
          user_id: payment.user_id,
          type: "payment_approved",
          title: "Pagamento Aprovado! 🎉",
          message: `Seu plano foi ativado com sucesso! Válido até ${subscriptionEnd.toLocaleDateString('pt-BR')}`,
          link: "/profile",
        });

      if (notifUserError) console.error("Erro ao criar notificação usuário:", notifUserError);
      else console.log("✅ Notificação criada para o usuário:", payment.user_id);

      // Buscar admin e criar notificação
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .limit(1);

      if (adminRoles && adminRoles.length > 0) {
        const { error: notifAdminError } = await supabase
          .from("notifications")
          .insert({
            user_id: adminRoles[0].user_id,
            type: "new_payment",
            title: "Novo Pagamento Recebido 💰",
            message: `Pagamento de R$ ${payment.amount.toFixed(2)} aprovado`,
            link: "/admin",
          });

        if (notifAdminError) console.error("Erro ao criar notificação admin:", notifAdminError);
        else console.log("✅ Notificação criada para admin");
      }
      
      console.log('🎊 ========== PROCESSO COMPLETO ==========');
    } else {
      console.log('ℹ️ Status:', newStatus, '- Nenhuma ação adicional necessária');
    }

    console.log('✅ Webhook processado com sucesso');
    console.log('==========================================\n');
    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return new Response('OK', { status: 200, headers: corsHeaders });
  }
});
