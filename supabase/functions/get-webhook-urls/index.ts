import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin access
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !role) {
      console.debug("Admin check failed for user:", user.id);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL não configurado");
    }

    const webhookUrls = {
      payment_webhook: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
      destaque_webhook: `${supabaseUrl}/functions/v1/mercadopago-destaque-webhook`,
      instructions: [
        "1. Acesse: https://www.mercadopago.com.br/developers/panel/webhooks",
        "2. Clique em 'Criar webhook'",
        "3. Configure:",
        "   - Nome: Pagamentos PIX - Produção",
        `   - URL: ${supabaseUrl}/functions/v1/mercadopago-webhook`,
        "   - Eventos: Marque 'Pagamentos' (payment)",
        "   - Versão da API: v1",
        "4. Salve a configuração",
        "5. Copie o Secret gerado e configure MERCADOPAGO_WEBHOOK_SECRET",
      ],
      current_environment: Deno.env.get("DENO_DEPLOYMENT_ID") ? "production" : "development",
    };

    console.debug("Webhook URLs returned to admin:", user.email);

    return new Response(
      JSON.stringify(webhookUrls, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in get-webhook-urls:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
