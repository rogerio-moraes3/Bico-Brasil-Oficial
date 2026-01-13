import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          ok: false,
          mode: "unknown",
          reason: "Token do Mercado Pago não configurado. Configure MERCADOPAGO_ACCESS_TOKEN nas secrets do projeto.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar tipo de token
    const isProductionToken = accessToken.startsWith("APP_USR-");
    const isTestToken = accessToken.startsWith("TEST-");

    // Se for token de TESTE, permitir (não bloquear)
    if (isTestToken) {

      return new Response(
        JSON.stringify({
          ok: true,
          mode: "test",
          reason: "Modo TESTE ativo - Pagamentos em sandbox (não são reais). Use credenciais de produção para pagamentos reais.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Se não for nem TEST nem PROD
    if (!isProductionToken) {
      return new Response(
        JSON.stringify({
          ok: false,
          mode: "unknown",
          reason: "Token inválido. Use um Access Token válido (TEST-... ou APP_USR-...).",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validar token com API do Mercado Pago

    
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Se erro 401/403, conta não está ativada
      const isNotActivated = response.status === 401 || response.status === 403;
      
      console.error(`❌ Erro ${response.status}:`, errorData);
      
      return new Response(
        JSON.stringify({
          ok: false,
          mode: "production",
          reason: isNotActivated 
            ? "Suas credenciais de PRODUÇÃO ainda não foram ativadas. Complete a verificação da sua conta no Mercado Pago (documento, selfie, comprovante de endereço)."
            : "Token de produção inválido ou expirado. Gere um novo Access Token no painel do Mercado Pago.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accountData = await response.json();

    // Token validado em produção

    return new Response(
      JSON.stringify({
        ok: true,
        mode: "production",
        reason: "Credenciais válidas! Sistema pronto para processar pagamentos REAIS.",
        account: {
          id: accountData.id,
          nickname: accountData.nickname,
          site_id: accountData.site_id,
        },
        webhook_configured: !!Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET"),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("❌ Erro ao validar credenciais:", error);
    
    return new Response(
      JSON.stringify({
        ok: false,
        mode: "unknown",
        reason: `Erro ao comunicar com Mercado Pago: ${error.message}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
