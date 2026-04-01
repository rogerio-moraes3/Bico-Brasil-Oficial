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

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Endpoint de teste GET
  if (req.method === "GET") {
    console.debug("🧪 GET Request - Edge Function Working!");
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Edge function create-mercadopago-payment is working!",
        timestamp: new Date().toISOString(),
        secrets: {
          mp_token_exists: !!Deno.env.get("MERCADOPAGO_ACCESS_TOKEN"),
          supabase_url_exists: !!Deno.env.get("SUPABASE_URL"),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    console.debug("🚀 Iniciando create-mercadopago-payment...");

    // Ler corpo
    const body = await req.json();
    const { planType, amount, payer } = body;

    console.debug("📦 Dados recebidos:", { planType, amount, payer: payer ? "presente" : "ausente" });

    // Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token não enviado");

    const token = authHeader.replace("Bearer ", "").trim();
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) throw new Error("Usuário não autenticado");

    const user = userData.user;
    console.debug("✅ Usuário autenticado:", user.id);

    // Buscar profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("users")
      .select("id, email, name")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error("Perfil não encontrado");

    console.debug("✅ Profile encontrado:", profile.id);

    // Validar CPF
    if (!payer?.cpf) throw new Error("CPF obrigatório");
    const payerCPF = payer.cpf.replace(/\D/g, "");
    if (!validateCPF(payerCPF)) {
      throw new Error("CPF inválido. Verifique os dígitos e tente novamente.");
    }

    // Checar pagamento pendente (últimos 15 minutos)
    const { data: existingPending } = await supabaseClient
      .from("payments")
      .select("id,status")
      .eq("user_id", profile.id)
      .eq("status", "pending")
      .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .limit(1);

    if (existingPending && existingPending.length > 0) {
      throw new Error("Você já tem um pagamento pendente.");
    }

    // Criar registro de pagamento
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: profile.id,
        amount: Number(amount),
        gateway: "mercadopago",
        status: "pending",
        plan_type: planType,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;
    console.debug("✅ Registro de pagamento criado:", payment.id);

    // Token Mercado Pago
    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado nos Secrets");

    console.debug("🔐 Token MP encontrado");

    const planName = planType === "vip" ? "VIP" : "Básico";
    console.debug("💰 Criando pagamento PIX:", { amount, planName, user: profile.id });

    // CRIAR PAGAMENTO PIX via API v1/payments
    const mpPayload = {
      transaction_amount: Number(amount),
      description: `Plano ${planName} - Bico Brasil`,
      payment_method_id: "pix",
      payer: {
        email: payer.email || profile.email,
        first_name: payer.name || profile.name || "Cliente",
        identification: {
          type: "CPF",
          number: payerCPF,
        },
      },
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
      external_reference: payment.id,
    };

    console.debug("📤 Enviando para Mercado Pago /v1/payments...");

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(mpPayload),
    });

    const mpText = await mpRes.text();
    let mpData;

    try {
      mpData = JSON.parse(mpText);
    } catch {
      mpData = { raw: mpText };
    }

    console.debug("📥 Resposta MP status:", mpRes.status);
    console.debug("📥 Resposta MP data:", JSON.stringify(mpData, null, 2));

    if (!mpRes.ok) {
      console.error("❌ Erro Mercado Pago:", mpText);
      throw new Error(`Mercado Pago error: ${mpData.message || mpText}`);
    }

    // Extrair QR Code
    const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!qrCode && !qrCodeBase64) {
      console.error("❌ QR Code não retornado pela API");
      throw new Error("QR Code não foi gerado pelo Mercado Pago");
    }

    console.debug("✅ QR Code gerado com sucesso!");

    // Atualizar payment com QR code
    await supabaseClient
      .from("payments")
      .update({
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
        mercadopago_payment_id: mpData.id?.toString(),
      })
      .eq("id", payment.id);

    // RETORNAR no formato esperado pelo frontend
    return new Response(
      JSON.stringify({
        payment_id: payment.id,
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
        mercadopago_id: mpData.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err: any) {
    console.error("❌ Erro na Edge Function:", err.message);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
