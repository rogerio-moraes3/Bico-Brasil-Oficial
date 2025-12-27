import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { jobId, categoryId, cityId } = await req.json();

    console.log(`📢 Notificando novo trabalho: ${jobId} - Categoria: ${categoryId}, Cidade: ${cityId}`);

    // Buscar detalhes do trabalho
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('*, category:categories(name), city:cities(name, state)')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('❌ Erro ao buscar trabalho:', jobError);
      throw new Error('Trabalho não encontrado');
    }

    // Buscar prestadores relevantes (mesma categoria + cidade + plano ativo)
    let workersQuery = supabase
      .from('users')
      .select('id, email, name')
      .eq('type', 'worker')
      .eq('plan_active', true);

    if (cityId) {
      workersQuery = workersQuery.eq('city_id', cityId);
    }

    const { data: workers, error: workersError } = await workersQuery;

    if (workersError) {
      console.error('❌ Erro ao buscar prestadores:', workersError);
      throw workersError;
    }

    console.log(`👥 Encontrados ${workers?.length || 0} prestadores para notificar`);

    // Criar notificações no banco
    if (workers && workers.length > 0) {
      const notifications = workers.map(worker => ({
        user_id: worker.id,
        title: "🆕 Novo Trabalho Disponível",
        message: `Novo trabalho em ${job.city?.name}: ${job.title}`,
        type: "new_job",
        link: `/jobs/${jobId}`,
        read: false
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('⚠️ Erro ao criar notificações:', notifError);
      } else {
        console.log(`✅ ${notifications.length} notificações criadas`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: workers?.length || 0 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error("❌ Erro na função notify-new-job:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);