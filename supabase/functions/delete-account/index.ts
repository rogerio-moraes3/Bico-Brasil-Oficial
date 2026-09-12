import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://bicobrasil.com.br",
  "https://www.bicobrasil.com.br",
  "http://localhost:8080",
  "http://localhost:4173",
];

function getCorsHeaders(origin: string | null) {
  const isVercelPreview = !!origin && /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
  const allowOrigin = origin && (ALLOWED_ORIGINS.includes(origin) || isVercelPreview)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token não enviado");
    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Usuário não autenticado");

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, profile_photo, avatar_url")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error("Perfil não encontrado");

    const anonymizedEmail = `deletado-${profile.id}@removido.bicobrasil.com.br`;

    // 1. Remover fotos do Storage (best-effort — se falhar, a anonimização
    // dos dados continua e o registro no banco já para de referenciá-las)
    for (const url of [profile.profile_photo, profile.avatar_url]) {
      if (!url) continue;
      try {
        const marker = "/profiles/";
        const idx = url.indexOf(marker);
        if (idx !== -1) {
          await supabase.storage.from("profiles").remove([url.slice(idx + marker.length)]);
        }
      } catch (e) {
        console.error("Erro ao remover foto do Storage:", e);
      }
    }

    // 2. Anonimizar a linha em public.users — mantém a linha (integridade
    // referencial + favoritos/mensagens de outras pessoas continuam
    // funcionando, mostrando "Usuário Removido" automaticamente via join)
    const { error: updateError } = await supabase
      .from("users")
      .update({
        name: "Usuário Removido",
        email: anonymizedEmail,
        phone: "00000000000",
        phone_verified: false,
        cpf: profile.id, // placeholder único (é o próprio id da linha), nunca um CPF real
        category: null,
        address: null,
        neighborhood: null,
        cep: null,
        city_id: null,
        house_number: null,
        profile_photo: null,
        avatar_url: null,
        plan_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) throw updateError;

    // 3. Desativar anúncios/vagas (evita "Usuário Removido" aparecendo como
    // se ainda estivesse ofertando serviço ou postando vaga). job_postings
    // precisa de status: 'closed' alem de is_active: false — a busca publica
    // (ProcurarBicos, PublicStats, AdminJobs) filtra por status = 'open', nao
    // por is_active, entao só zerar is_active deixava a vaga de um usuario
    // excluido continuar aparecendo normalmente nas buscas.
    try {
      await supabase.from("worker_services").update({ active: false }).eq("user_id", profile.id);
      await supabase.from("job_postings").update({ is_active: false, status: "closed", contact_phone: null }).eq("user_id", profile.id);
    } catch (e) {
      console.error("Erro ao desativar anúncios/vagas:", e);
    }

    // 4. Limpeza de dados pessoais sem propósito após a exclusão (best-effort)
    try {
      await supabase.from("email_change_requests").delete().eq("user_id", profile.id);
      await supabase.from("notifications").delete().eq("user_id", profile.id);
      await supabase.from("signup_errors").delete().eq("user_id", user.id);
      if (user.email) {
        await supabase.from("colaboradores_autorizados").delete().ilike("email", user.email);
      }
    } catch (e) {
      console.error("Erro na limpeza de dados secundários:", e);
    }

    // 5. Desativar login e limpar metadata do Auth (nome/foto/cpf embutidos
    // no JWT/user_metadata) — ban_duration efetivamente permanente
    const { error: banError } = await supabase.auth.admin.updateUserById(user.id, {
      email: anonymizedEmail,
      ban_duration: "876000h",
      user_metadata: {},
    });

    if (banError) throw banError;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("delete-account error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
