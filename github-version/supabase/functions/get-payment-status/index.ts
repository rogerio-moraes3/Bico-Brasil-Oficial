import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const paymentId = url.searchParams.get('id');

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get payment from database with user_id to verify ownership
    const { data: payment, error } = await supabase
      .from('payments')
      .select('status, plan_type, mercadopago_payment_id, expiration_date, user_id')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Verify the user owns this payment
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment.user_id !== userProfile.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - You do not have access to this payment' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optionally sync with Mercado Pago if payment ID exists
    if (payment.mercadopago_payment_id && payment.status === 'pending') {
      const mpToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      
      if (mpToken) {
        try {
          const mpResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${payment.mercadopago_payment_id}`,
            {
              headers: {
                'Authorization': `Bearer ${mpToken}`,
              }
            }
          );

          if (mpResponse.ok) {
            const mpData = await mpResponse.json();
            
            // Map Mercado Pago status to our status
            let newStatus = payment.status;
            if (mpData.status === 'approved') {
              newStatus = 'paid';
            } else if (mpData.status === 'rejected' || mpData.status === 'cancelled') {
              newStatus = 'failed';
            }

            // Update if status changed
            if (newStatus !== payment.status) {
              await supabase
                .from('payments')
                .update({ status: newStatus })
                .eq('id', paymentId);

              return new Response(
                JSON.stringify({ 
                  status: newStatus,
                  planType: payment.plan_type,
                  expirationDate: payment.expiration_date
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        } catch (mpError) {
          console.error('Error syncing with Mercado Pago:', mpError);
          // Continue with database status if MP sync fails
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        status: payment.status,
        planType: payment.plan_type,
        expirationDate: payment.expiration_date
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-payment-status:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
