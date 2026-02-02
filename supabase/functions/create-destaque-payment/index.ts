import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const DEFAULT_GATEWAY_ERROR_STATUS = 502;

function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, "");

  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(numbers.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(numbers.charAt(10))) return false;

  return true;
}

// Função auxiliar para fazer requisições com retry
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error;
      console.error(`Tentativa ${i + 1} falhou:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  throw lastError;
}

type ErrorResponse = {
  code: string;
  message: string;
};

function normalizePaymentMethod(input: unknown) {
  if (typeof input === "string") {
    return input.trim().toLowerCase();
  }
  if (input == null) {
    // default to pix for backwards compatibility with older clients
    return "pix";
  }
  return "";
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { days, payer, payment_method, amount } = await req.json();
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
    const paymentMethod = normalizePaymentMethod(payment_method);

    console.debug("📥 Solicitação create-destaque-payment", {
      request_id: requestId,
      days,
      amount: typeof amount === "number" ? amount : undefined,
      payment_method: paymentMethod,
    });

    if (paymentMethod !== "pix") {
      console.warn("Pagamento destaque rejeitado: método inválido", {
        request_id: requestId,
        payment_method: paymentMethod,
      });
      return jsonResponse(400, {
        code: "PIX_ONLY",
        message: "Apenas pagamentos via PIX são aceitos.",
      });
    }

    // PIX é o único método de pagamento aceito (hardcoded no payment_method_id abaixo)
    // amount é opcional e serve apenas para validação de integridade do client

    if (!payer?.cpf) {
      return jsonResponse(400, {
        code: "CPF_REQUIRED",
        message: "CPF é obrigatório.",
      });
    }

    if (!validateCPF(payer.cpf)) {
      return jsonResponse(400, {
        code: "CPF_INVALID",
        message: "CPF inválido.",
      });
    }

    // Tabela de preços fixa
    const priceTable: Record<number, number> = {
      1: 9.90,
      3: 24.90,
      7: 39.90,
      15: 69.90,
      30: 99.90
    };

    const expectedAmount = priceTable[days];
    if (!expectedAmount) {
      return jsonResponse(400, {
        code: "PLAN_INVALID",
        message: "Plano inválido.",
      });
    }

    if (amount !== undefined && typeof amount !== "number") {
      return jsonResponse(400, {
        code: "AMOUNT_INVALID",
        message: "Valor inválido.",
      });
    }

    if (typeof amount === "number") {
      const expectedCents = Math.round(expectedAmount * 100);
      const amountCents = Math.round(amount * 100);
      if (amountCents !== expectedCents) {
      console.warn("Valor divergente no pagamento de destaque", {
        request_id: requestId,
        amount,
        expectedAmount,
      });
      return jsonResponse(400, {
        code: "AMOUNT_MISMATCH",
        message: "Valor informado não corresponde ao plano selecionado.",
      });
      }
    }

    console.debug(`💰 Criando pagamento de destaque: ${days} dias, R$ ${expectedAmount}`);

    const { data: order, error: orderError } = await supabaseClient
      .from('destaque_orders')
      .insert({
        user_id: user.id,
        days: days,
        amount: expectedAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Erro ao criar ordem:', { request_id: requestId, error: orderError?.message });
      return jsonResponse(500, {
        code: "ORDER_CREATE_FAILED",
        message: "Erro ao criar ordem de pagamento.",
      });
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado', { request_id: requestId });
      return jsonResponse(500, {
        code: "CONFIG_MISSING",
        message: "Configuração de pagamento ausente.",
      });
    }

    // Log do tipo de token (produção ou teste)
    const isTestToken = accessToken.startsWith('TEST-');
    console.debug(`🔑 Usando token ${isTestToken ? 'de TESTE' : 'de PRODUÇÃO'}`);

    const paymentData = {
      transaction_amount: expectedAmount,
      description: `Anúncio Destaque - ${days} dias`,
      payment_method_id: 'pix',
      external_reference: order.id,
      payer: {
        email: user.email || 'cliente@exemplo.com',
        first_name: payer.name || 'Cliente',
        identification: {
          type: 'CPF',
          number: payer.cpf
        }
      }
    };

    console.debug('📤 Enviando requisição para Mercado Pago...');

    const response = await fetchWithRetry('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(paymentData),
    });

    const mpData = await response.json();

    if (!response.ok) {
      console.error('❌ Erro do Mercado Pago:', {
        request_id: requestId,
        status: response.status,
        error: mpData?.message ?? mpData?.error,
      });

      await supabaseClient
        .from('destaque_orders')
        .update({ status: 'failed' })
        .eq('id', order.id);

      const errorStatus =
        response.status >= 400 && response.status < 500
          ? response.status
          : DEFAULT_GATEWAY_ERROR_STATUS;
      return jsonResponse(errorStatus, {
        code: "GATEWAY_ERROR",
        message: mpData?.message || 'Erro ao criar pagamento no Mercado Pago',
      });
    }

    console.debug('✅ Pagamento criado com sucesso:', mpData.id);

    await supabaseClient
      .from('destaque_orders')
      .update({
        payment_id: mpData.id,
        status: 'in_process'
      })
      .eq('id', order.id);

    const pixData = mpData.point_of_interaction?.transaction_data;

    return jsonResponse(200, {
      payment_id: mpData.id,
      qr_code: pixData?.qr_code || '',
      qr_code_base64: pixData?.qr_code_base64 || '',
      ticket_url: pixData?.ticket_url || '',
    });
  } catch (error) {
    console.error('💥 Erro na edge function:', error);
    const errorResponse: ErrorResponse = {
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    };
    return jsonResponse(500, errorResponse);
  }
});
