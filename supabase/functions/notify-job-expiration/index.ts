import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.debug('[notify-job-expiration] Iniciando verificação de jobs expirando...');

    // Buscar jobs que expiram em 1 dia
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: jobs, error } = await supabase
      .from('job_postings')
      .select(`
        id,
        title,
        date_time,
        user_id,
        users!inner(auth_id, name)
      `)
      .lte('date_time', tomorrow.toISOString())
      .gte('date_time', new Date().toISOString())
      .eq('status', 'open');

    if (error) {
      console.error('[notify-job-expiration] Erro ao buscar jobs:', error);
      throw error;
    }

    console.debug(`[notify-job-expiration] Encontrados ${jobs?.length || 0} jobs expirando em breve`);

    let notifiedCount = 0;

    for (const job of jobs || []) {
      try {
        // @ts-ignore - Supabase inner join returns object, not array
        const userAuthId = job.users?.auth_id;

        if (!userAuthId) {
          console.debug(`[notify-job-expiration] Job ${job.id} sem auth_id válido`);
          continue;
        }

        // Criar notificação
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userAuthId,
            title: '⏰ Sua vaga expira amanhã!',
            message: `A vaga "${job.title}" expira amanhã. Deseja editá-la ou renová-la?`,
            type: 'job_expiration',
            link: `/edit-job/${job.id}`
          });

        if (notifError) {
          console.error(`[notify-job-expiration] Erro ao criar notificação para job ${job.id}:`, notifError);
        } else {
          notifiedCount++;
          console.debug(`[notify-job-expiration] Notificação criada para job ${job.id} (${job.title})`);
        }
      } catch (err) {
        console.error(`[notify-job-expiration] Erro ao processar job ${job.id}:`, err);
      }
    }

    console.debug(`[notify-job-expiration] Processo concluído. ${notifiedCount} notificações enviadas.`);

    return new Response(
      JSON.stringify({
        success: true,
        totalJobs: jobs?.length || 0,
        notified: notifiedCount
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    console.error('[notify-job-expiration] Erro geral:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
