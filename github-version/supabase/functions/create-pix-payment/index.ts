import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função de validação de CPF
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// FASE 1: Função auxiliar para retry de requisições
async function fetchWithRetry(url: string, options: any, retries = 2, waitMs = 600) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      if (i === retries) throw err;
      console.log(`⚠️ Retry ${i + 1}/${retries} após ${waitMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }
  throw new Error('Falha após todas as tentativas');
}

interface PaymentRequest {
  paymentMethod: "pix" | "credit" | "debit";
  planType?: "basico" | "vip" | "anual";
  amount?: number;
  cardToken?: string;
  installments?: number;
  email?: string;
  payer?: {
    name?: string;
    cpf?: string;
    email?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ler corpo UMA única vez
    const body = (await req.json()) as PaymentRequest;

    // supabase server client (service role)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token não enviado (Authorization header faltando)");
    const token = authHeader.replace("Bearer ", "").trim();

    // busca usuário via token (token de sessão do cliente)
    const { data: userData, error: getUserErr } = await supabaseClient.auth.getUser(token);
    if (getUserErr || !userData?.user) throw new Error("Usuário não autenticado");

    const user = userData.user;

    // pega profile no seu schema users (ajuste o nome da coluna se for diferente)
    const { data: profile, error: profileError } = await supabaseClient
      .from("users")
      .select("id, email, name, phone")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error("Perfil do usuário não encontrado");

    console.log("🚀 Iniciando processo de pagamento...");
    console.log(`👤 Usuário: ${profile.name} (${profile.id})`);

    // Validar Access Token
    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("❌ MERCADOPAGO_ACCESS_TOKEN não configurado");
      throw new Error("Configuração de pagamento inválida. Entre em contato com o suporte.");
    }

    // Verificar tipo de token (informativo)
    const isProductionToken = accessToken.startsWith("APP_USR-");
    const isTestToken = accessToken.startsWith("TEST-");

    console.log(`🔐 Token tipo: ${isProductionToken ? "PRODUÇÃO" : isTestToken ? "TESTE" : "DESCONHECIDO"}`);

    // ⚠️ Avisar se for teste, mas NÃO bloquear
    if (isTestToken) {
      console.warn("⚠️ Usando credenciais de TESTE - Pagamentos em sandbox (não são reais)");
    }

    // ℹ️ Informativo (não bloqueia mais)
    if (isProductionToken) {
      console.log("✅ Usando credenciais de PRODUÇÃO - Pagamentos reais");
    }

    // ====== AUTO-CANCELAMENTO DE PAGAMENTOS PENDENTES ======
    const { data: userPendingPayments, error: pendingErr } = await supabaseClient
      .from("payments")
      .select("id, mercadopago_payment_id, status")
      .eq("user_id", profile.id)
      .in("status", ["pending", "in_process"])
      .not("mercadopago_payment_id", "is", null);

    if (pendingErr) {
      console.error('❌ Erro ao buscar pendentes:', pendingErr);
      throw pendingErr;
    }

    // Cancelar cada pagamento pendente automaticamente
    if (userPendingPayments && userPendingPayments.length > 0) {

      for (const oldPayment of userPendingPayments) {
        try {
          const cancelResponse = await fetchWithRetry(
            `https://api.mercadopago.com/v1/payments/${oldPayment.mercadopago_payment_id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ status: "cancelled" }),
            },
            2, // 2 tentativas de retry
            300 // 300ms entre tentativas
          );

          if (cancelResponse.ok) {
            console.log(`✅ Pagamento ${oldPayment.id} cancelado no MP`);
          } else {
            console.log(`⚠️ Não foi possível cancelar ${oldPayment.id} no MP (continuando...)`);
          }

          // Atualizar status no banco
          await supabaseClient
            .from("payments")
            .update({ status: "cancelled" })
            .eq("id", oldPayment.id);

          console.log(`✅ Pagamento ${oldPayment.id} marcado como cancelled no banco`);
        } catch (error) {
          console.error(`❌ Erro ao cancelar pagamento ${oldPayment.id}:`, error);
          // Continua mesmo com erro
        }
      }

      console.log('✅ Cancelamento automático concluído');
    }

    // Params
    const paymentMethod = body.paymentMethod;
    const planType = body.planType ?? "basico";
    const amount = Number(body.amount ?? 19.9);
    const cardToken = body.cardToken;
    const installments = Number(body.installments ?? 1);
    const payer = body.payer;
    const email = body.email ?? profile.email;

    const validAmounts = [19.9, 29.9, 249.9, 9.90, 24.90, 39.90, 69.90, 99.90];
    if (!validAmounts.includes(amount)) throw new Error("Valor de plano inválido");

    // cria o registro de pagamento
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: profile.id,
        amount,
        gateway: "mercadopago",
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    console.log('🔐 Token MP existe:', !!accessToken);
    if (!accessToken) throw new Error("Token Mercado Pago não configurado");

    const planName = planType === "vip"
      ? "VIP (R$ 29,90)"
      : planType === "anual"
        ? "Anual (R$ 249,90)"
        : "Premium (R$ 19,90)";
    console.log('💰 Criando NOVO pagamento PIX para user:', profile.id);
    console.log('📊 Valor:', amount, 'Plano:', planName);
    console.log('👤 Pagador:', payer?.name, payer?.email);

    // --- PIX ---
    if (paymentMethod === "pix") {
      if (!payer?.cpf) throw new Error("CPF do pagador obrigatório para PIX");
      const payerCPF = payer.cpf.replace(/\D/g, "");
      if (!validateCPF(payerCPF)) {
        throw new Error("CPF inválido. Verifique os dígitos e tente novamente.");
      }

      // Dados do pagador (priorizar dados enviados)
      const payerName = payer?.name || profile.name || "Nome não informado";
      const payerEmail = payer?.email || email || profile.email || "email@exemplo.com";

      console.log("👤 Dados do Pagador:");
      console.log("   Nome:", payerName);
      console.log("   Email:", payerEmail);
      console.log("   CPF:", payerCPF);

      console.log('📤 Enviando pagamento PIX para Mercado Pago...');

      // Corpo da requisição conforme documentação oficial do Mercado Pago
      // 📚 Documentação: https://www.mercadopago.com.br/developers/en/reference/payments/_payments/post
      const pixPaymentBody = {
        transaction_amount: amount,
        description: `Plano ${planName} - Bico Brasil`,
        payment_method_id: "pix",
        payer: {
          email: payerEmail,
          first_name: payerName.split(' ')[0] || payerName,
          last_name: payerName.split(' ').slice(1).join(' ') || payerName,
          identification: {
            type: "CPF",
            number: payerCPF
          }
        },
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
        external_reference: payment.id,
        metadata: {
          user_id: profile.id,
          plan_type: planType || 'basico',
          user_email: profile.email,
          user_name: profile.name,
          payment_source: 'web_app'
        },
        additional_info: {
          items: [
            {
              id: planType === 'vip' ? 'PLAN_VIP' : planType === 'anual' ? 'PLAN_ANUAL' : 'PLAN_BASICO',
              title: planType === 'vip' ? 'Plano VIP' : planType === 'anual' ? 'Plano Anual (12 meses)' : 'Plano Premium',
              description: planType === 'vip'
                ? 'Acesso completo com destaque e prioridade'
                : planType === 'anual'
                  ? 'Acesso Premium por 12 meses com 30% de desconto'
                  : 'Acesso aos recursos premium da plataforma',
              category_id: 'subscription',
              quantity: 1,
              unit_price: amount
            }
          ],
          payer: {
            first_name: payerName.split(' ')[0] || payerName,
            last_name: payerName.split(' ').slice(1).join(' ') || payerName,
            phone: {
              area_code: profile.phone?.substring(0, 2) || "11",
              number: profile.phone?.substring(2) || "000000000"
            }
          }
        }
      };

      console.log("📋 Corpo da requisição:", JSON.stringify(pixPaymentBody, null, 2));
      console.log("📤 Enviando para Mercado Pago API...");
      console.log("🔑 Token tipo:", isProductionToken ? "PRODUÇÃO" : "TESTE");
      console.log("💰 Valor:", amount);
      console.log("👤 CPF:", payerCPF);

      // FASE 1: Requisição com retry e Idempotency Key
      const mpRes = await fetchWithRetry(
        "https://api.mercadopago.com/v1/payments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify(pixPaymentBody),
        },
        2,
        400
      );

      const text = await mpRes.text();
      let pixData;
      try {
        pixData = JSON.parse(text);
      } catch {
        pixData = { raw: text };
      }

      console.log('✅ PIX criado com sucesso!');
      console.log('📋 ID Pagamento MP:', pixData.id);
      console.log('💳 Status:', pixData.status);
      console.log('🔗 QR Code gerado:', !!pixData.point_of_interaction?.transaction_data?.qr_code);

      // FASE 1: Tratamento de erros específicos
      if (!mpRes.ok) {
        console.error("❌ Mercado Pago PIX error:", text);

        // Mensagens de erro específicas
        if (mpRes.status === 401) {
          let errorMessage = "Token Mercado Pago inválido. Verifique MERCADOPAGO_ACCESS_TOKEN nas configurações.";

          try {
            const errorJson = JSON.parse(text);
            console.error("📄 Detalhes do erro 401:", errorJson);

            if (errorJson.message?.includes("Unauthorized use of live credentials")) {
              errorMessage = "Suas credenciais de PRODUÇÃO do Mercado Pago ainda não foram ativadas. Acesse o painel do Mercado Pago e complete a verificação da conta ou use credenciais de TESTE temporariamente.";
            } else if (errorJson.message?.includes("invalid") || errorJson.message?.includes("malformed")) {
              errorMessage = "Token do Mercado Pago está mal formatado ou inválido. Verifique se copiou corretamente.";
            }
          } catch (parseError) {
            console.warn("⚠️ Não foi possível parsear erro JSON");
          }

          return new Response(JSON.stringify({
            error: errorMessage,
            mercadopago_error: text
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 401,
          });
        }

        if (mpRes.status === 429) {
          return new Response(JSON.stringify({
            error: "Limite de requisições atingido. Aguarde alguns minutos e tente novamente."
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 429,
          });
        }

        return new Response(JSON.stringify({
          error: "Erro ao criar pagamento PIX no Mercado Pago",
          details: pixData
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: mpRes.status,
        });
      }

      // Enviar email com QR Code PIX
      try {
        console.log("📧 Enviando email com QR Code PIX...");
        const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": req.headers.get("Authorization") || "",
          },
          body: JSON.stringify({
            to: email || profile.email,
            subject: "📱 Seu código PIX está pronto - Bico Brasil",
            type: "payment_generated",
            data: {
              name: payer?.name || profile.name,
              planName: planType === 'basico' ? 'Plano Básico' : planType === 'vip' ? 'Plano VIP' : 'Plano Anual',
              amount: amount,
              qrCode: pixData.point_of_interaction?.transaction_data?.qr_code || '',
              qrCodeBase64: pixData.point_of_interaction?.transaction_data?.qr_code_base64 || '',
              expirationDate: pixData.date_of_expiration || '',
              paymentId: pixData.id || payment.id,
            },
          }),
        });

        if (emailResponse.ok) {
          console.log("✅ Email PIX enviado com sucesso para:", email || profile.email);
        } else {
          console.log("⚠️ Falha ao enviar email PIX (não crítico)");
        }
      } catch (emailErr) {
        console.error("⚠️ Erro ao enviar email PIX (não fatal):", emailErr);
      }

      return new Response(
        JSON.stringify({
          payment_id: payment.id,
          qr_code: pixData.point_of_interaction?.transaction_data?.qr_code,
          qr_code_base64: pixData.point_of_interaction?.transaction_data?.qr_code_base64,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // --- CARTÃO (token) ---
    if (cardToken) {
      const cardRes = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_amount: amount,
          token: cardToken,
          description: `Plano ${planName} - Bico Brasil`,
          installments,
          payment_method_id: paymentMethod === "credit" ? "visa" : "debvisa",
          payer: { email: email || profile.email },
          notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
          external_reference: payment.id,
          statement_descriptor: "BICOBRASIL",
        }),
      });

      const txt = await cardRes.text();
      let cardData;
      try {
        cardData = JSON.parse(txt);
      } catch {
        cardData = { raw: txt };
      }

      if (!cardRes.ok) {
        console.error("Card payment error:", txt);
        return new Response(JSON.stringify({ error: "Erro pagamento cartão", details: cardData }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: cardRes.status,
        });
      }

      return new Response(
        JSON.stringify({
          type: "card",
          status: cardData.status,
          payment_id: cardData.id,
          detail: cardData.status_detail,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    return new Response(JSON.stringify({ error: "Método de pagamento inválido" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (err: any) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
