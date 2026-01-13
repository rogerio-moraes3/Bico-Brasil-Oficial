import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { days, paymentMethod, payer } = await req.json();

    if (paymentMethod !== 'pix') {
      throw new Error('Apenas pagamentos via PIX são aceitos');
    }

    if (!payer?.cpf) {
      throw new Error('CPF é obrigatório');
    }

    if (!validateCPF(payer.cpf)) {
      throw new Error('CPF inválido');
    }

    // Tabela de preços fixa
    const priceTable: Record<number, number> = {
      1: 9.90,
      3: 24.90,
      7: 39.90,
      15: 69.90,
      30: 99.90
    };

    const amount = priceTable[days];
    if (!amount) {
      throw new Error('Plano inválido');
    }

    console.debug(`💰 Criando pagamento de destaque: ${days} dias, R$ ${amount}`);

    const { data: order, error: orderError } = await supabaseClient
      .from('destaque_orders')
      .insert({
        user_id: user.id,
        days: days,
        amount: amount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Erro ao criar ordem:', orderError);
      throw new Error('Erro ao criar ordem de pagamento');
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado');
      throw new Error('Configuração de pagamento ausente');
    }

    // Log do tipo de token (produção ou teste)
    const isTestToken = accessToken.startsWith('TEST-');
    console.debug(`🔑 Usando token ${isTestToken ? 'de TESTE' : 'de PRODUÇÃO'}`);

    const paymentData = {
      transaction_amount: amount,
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
      console.error('❌ Erro do Mercado Pago:', mpData);
      
      await supabaseClient
        .from('destaque_orders')
        .update({ status: 'failed' })
        .eq('id', order.id);
      
      throw new Error(mpData.message || 'Erro ao criar pagamento no Mercado Pago');
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

    return new Response(
      JSON.stringify({
        payment_id: mpData.id,
        qr_code: pixData?.qr_code || '',
        qr_code_base64: pixData?.qr_code_base64 || '',
        ticket_url: pixData?.ticket_url || '',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('💥 Erro na edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
