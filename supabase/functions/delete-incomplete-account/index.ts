import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const INTERNAL_TASK_SECRET = Deno.env.get("INTERNAL_TASK_SECRET");
const NOTICE_WAIT_MS = 3 * 24 * 60 * 60 * 1000;

// Exclusao DEFINITIVA (nao e o fluxo de anonimizacao do delete-account) —
// so para contas com cadastro incompleto (CPF pendente e/ou telefone nao
// verificado) que ja receberam o aviso ha 3+ dias e continuam incompletas.
// Chamada pelo pg_cron (via pg_net) usando o segredo guardado no Vault, ou
// manualmente durante o rollout do backlog. Nunca exposta ao navegador.
function isAuthorized(req: Request): boolean {
  const provided = req.headers.get("x-internal-secret");
  return !!INTERNAL_TASK_SECRET && provided === INTERNAL_TASK_SECRET;
}

interface UserRow {
  id: string;
  auth_id: string | null;
  email: string;
  cpf: string | null;
  phone_verified: boolean;
  incomplete_signup_notice_sent_at: string | null;
}

// Todas as tabelas com linhas vinculadas a um usuario (mapeadas via FK e via
// busca de colunas user_id/worker_id/applicant_id/viewed_profile_id/
// contractor_id em information_schema, ao vivo). Deletadas explicitamente —
// nao dependemos so de ON DELETE CASCADE porque duas delas (ads_highlight,
// payments) sao NO ACTION e bloqueariam o delete de public.users, e porque
// o pedido e "todas as linhas relacionadas", nao anonimizar/orfanizar.
const RELATED_TABLES: Array<{ table: string; column: string }> = [
  { table: "ads_highlight", column: "user_id" },
  { table: "payments", column: "user_id" },
  { table: "contact_unlocks", column: "worker_id" },
  { table: "contact_unlocks", column: "user_id" },
  { table: "favorites", column: "worker_id" },
  { table: "favorites", column: "user_id" },
  { table: "job_applications", column: "applicant_id" },
  { table: "job_postings", column: "user_id" },
  { table: "national_launch_notification_log", column: "user_id" },
  { table: "phone_verification_codes", column: "user_id" },
  { table: "profile_views", column: "viewed_profile_id" },
  { table: "worker_services", column: "user_id" },
  { table: "email_change_requests", column: "user_id" },
  { table: "notifications", column: "user_id" },
  { table: "signup_errors", column: "user_id" },
  { table: "destaque_orders", column: "user_id" },
  { table: "user_credits", column: "user_id" },
  { table: "user_roles", column: "user_id" },
  { table: "audit_log", column: "user_id" },
  { table: "conversations", column: "worker_id" },
  { table: "conversations", column: "contractor_id" },
];

function isStillIncomplete(user: UserRow): boolean {
  return !user.cpf || user.cpf.trim() === "" || !user.phone_verified;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { user_id } = await req.json();
    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "user_id é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, auth_id, email, cpf, phone_verified, incomplete_signup_notice_sent_at")
      .eq("id", user_id)
      .maybeSingle<UserRow>();

    if (fetchError) throw fetchError;

    if (!user) {
      console.debug("⏭️ [delete-incomplete-account] Conta já não existe (idempotente):", user_id);
      return new Response(JSON.stringify({ skipped: "user_not_found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Re-verificação server-side — nunca confia cegamente em quem chamou,
    // mesmo com o segredo correto (defesa em profundidade pra uma operação
    // destrutiva e irreversível).
    if (!isStillIncomplete(user)) {
      console.debug("⏭️ [delete-incomplete-account] Conta foi completada, não deleta:", user.id);
      return new Response(JSON.stringify({ skipped: "now_complete" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!user.incomplete_signup_notice_sent_at) {
      console.debug("⏭️ [delete-incomplete-account] Nunca foi avisado, não deleta:", user.id);
      return new Response(JSON.stringify({ skipped: "never_notified" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const noticeSentAt = new Date(user.incomplete_signup_notice_sent_at).getTime();
    if (Date.now() - noticeSentAt < NOTICE_WAIT_MS) {
      console.debug("⏭️ [delete-incomplete-account] Ainda dentro do prazo de 3 dias:", user.id);
      return new Response(JSON.stringify({ skipped: "grace_period_active" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.debug("🗑️ [delete-incomplete-account] Excluindo conta incompleta:", user.id, user.email);

    // 1. Storage: remove a pasta inteira profiles/<id>/ (nao só as 2 colunas
    // conhecidas — pega qualquer arquivo que tenha sobrado la).
    try {
      const { data: files, error: listError } = await supabase.storage.from("profiles").list(user.id);
      if (listError) throw listError;
      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("profiles").remove(paths);
      }
    } catch (e) {
      console.error("Erro ao limpar Storage (segue mesmo assim):", e);
    }

    // 2. Todas as linhas relacionadas em outras tabelas.
    const ids = new Set([user.id, ...(user.auth_id ? [user.auth_id] : [])]);
    for (const { table, column } of RELATED_TABLES) {
      for (const id of ids) {
        try {
          await supabase.from(table).delete().eq(column, id);
        } catch (e) {
          console.error(`Erro ao limpar ${table}.${column} para ${id}:`, e);
        }
      }
    }

    // 3. A própria linha em public.users.
    const { error: deleteUserError } = await supabase.from("users").delete().eq("id", user.id);
    if (deleteUserError) throw deleteUserError;

    // 4. Auth (Admin API) — por último: libera o e-mail pra um novo cadastro.
    // Se falhar aqui, os dados já foram removidos do banco/storage; loga pra
    // acompanhamento manual em vez de tentar desfazer o que já foi limpo.
    if (user.auth_id) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.auth_id);
      if (authDeleteError) {
        console.error("⚠️ [delete-incomplete-account] Dados removidos, mas falha ao deletar do Auth:", user.id, authDeleteError);
        return new Response(
          JSON.stringify({ success: true, warning: "Dados removidos, mas falha ao deletar do Auth", error: authDeleteError.message }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    console.debug("✅ [delete-incomplete-account] Conta excluída por completo:", user.id);

    return new Response(JSON.stringify({ success: true, deleted_user_id: user.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("💥 [delete-incomplete-account] Erro fatal:", error.message);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
