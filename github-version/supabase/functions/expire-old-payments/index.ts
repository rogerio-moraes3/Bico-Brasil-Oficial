import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security: Require service role key for authentication
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader || !authHeader.includes(serviceRoleKey || '')) {
      console.error('❌ Unauthorized access attempt to expire-old-payments');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Unauthorized: This endpoint requires service role authentication' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('⏰ Iniciando expiração automática de QR Codes antigos...');

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Expirar pagamentos pendentes com mais de 15 minutos
    const expirationTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    console.log('🔍 Buscando pagamentos pendentes antes de:', expirationTime);

    const { data: expiredPayments, error: updateError } = await supabase
      .from("payments")
      .update({ 
        status: "failed",
        updated_at: new Date().toISOString()
      })
      .eq("status", "pending")
      .lt("created_at", expirationTime)
      .select("id, user_id, amount, created_at");

    if (updateError) {
      console.error('❌ Erro ao expirar pagamentos:', updateError);
      throw updateError;
    }

    const count = expiredPayments?.length || 0;
    console.log(`✅ ${count} pagamento(s) expirado(s)`);

    if (expiredPayments && expiredPayments.length > 0) {
      console.log('📋 IDs expirados:', expiredPayments.map(p => p.id).join(', '));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${count} QR Code(s) expirado(s)`,
        expiredPayments: expiredPayments || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Erro na função expire-old-payments:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
