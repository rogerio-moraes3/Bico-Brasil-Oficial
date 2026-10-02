import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const DAILY_EMAIL_LIMIT = 100;

// contato@ (e nao naoresponda@, usado pela send-email): o texto aprovado
// termina com "é só responder este e-mail", entao as respostas precisam
// chegar em algum lugar.
const FROM = "Bico Brasil <contato@bicobrasil.com.br>";
const SUBJECT = "Sua conta no Bico Brasil — convite para voltar";

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

// Texto aprovado pelo dono do projeto — nao alterar a redacao sem aprovacao
// nova. A versao text/plain abaixo e a mesma coisa sem marcacao.
const EMAIL_TEXT = `Olá!

Identificamos um problema técnico em nosso sistema que fez sua conta no Bico Brasil ser removida sem motivo da sua parte. Pedimos desculpas pelo transtorno — isso não deveria ter acontecido.

A boa notícia: você pode se cadastrar novamente em poucos minutos e voltar a usar a plataforma normalmente.

👉 Cadastre-se de novo: https://bicobrasil.com.br/auth

Qualquer dúvida, é só responder este e-mail.

Equipe Bico Brasil`;

const EMAIL_HTML = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0; padding:0; background:#f9f9f9;">
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; padding:20px;">
      <div style="background:white; padding:30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <p>Olá!</p>

        <p>Identificamos um problema técnico em nosso sistema que fez sua conta no Bico Brasil ser removida sem motivo da sua parte. Pedimos desculpas pelo transtorno — isso não deveria ter acontecido.</p>

        <p>A boa notícia: você pode se cadastrar novamente em poucos minutos e voltar a usar a plataforma normalmente.</p>

        <p>👉 Cadastre-se de novo: <a href="https://bicobrasil.com.br/auth" style="color:#0A4CFB;">https://bicobrasil.com.br/auth</a></p>

        <p style="text-align:center;">
          <a href="https://bicobrasil.com.br/auth" style="display:inline-block; background-color:#0A4CFB; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; margin:20px 0; font-weight:bold;">Cadastre-se de novo</a>
        </p>

        <p>Qualquer dúvida, é só responder este e-mail.</p>

        <p>Equipe Bico Brasil</p>
      </div>
    </div>
  </body>
</html>`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: "Unauthorized: Invalid token" }, 401);

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return json({ error: "Forbidden: Admin access required" }, 403);

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // corpo vazio e aceitavel, default action = "status"
    }
    const action = typeof body.action === "string" ? body.action : "status";
    // dryRun default true — so manda de verdade com dryRun:false explicito.
    const dryRun = body.dryRun !== false;
    // targetEmail restringe o lote a um unico destinatario, pra teste real
    // isolado sem consumir a fila do resto.
    const targetEmail = typeof body.targetEmail === "string"
      ? body.targetEmail.trim().toLowerCase()
      : null;
    const limit = typeof body.limit === "number" && body.limit > 0
      ? Math.min(body.limit, DAILY_EMAIL_LIMIT)
      : DAILY_EMAIL_LIMIT;

    async function counts() {
      const out: Record<string, number> = { pending: 0, sent: 0, failed: 0, skipped: 0 };
      for (const status of Object.keys(out)) {
        const { count } = await supabase
          .from("deleted_account_notice_log")
          .select("id", { count: "exact", head: true })
          .eq("email_status", status);
        out[status] = count ?? 0;
      }
      return out;
    }

    if (action === "status") {
      return json({ action: "status", from: FROM, subject: SUBJECT, counts: await counts() });
    }

    if (action !== "send_batch") {
      return json({ error: `Unknown action: ${action}` }, 400);
    }

    let query = supabase
      .from("deleted_account_notice_log")
      .select("id, email")
      .eq("email_status", "pending")
      .order("created_at", { ascending: true })
      .limit(limit);
    if (targetEmail) query = query.eq("email", targetEmail);

    const { data: pending, error: pendingError } = await query;
    if (pendingError) return json({ error: pendingError.message }, 500);

    if (dryRun) {
      return json({
        action: "send_batch",
        dryRun: true,
        wouldSend: pending?.length ?? 0,
        from: FROM,
        subject: SUBJECT,
        counts: await counts(),
      });
    }

    if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY nao configurada" }, 500);

    let sent = 0;
    let failed = 0;
    for (const row of pending ?? []) {
      let ok = false;
      let errorText: string | null = null;
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM,
            to: [row.email],
            subject: SUBJECT,
            html: EMAIL_HTML,
            text: EMAIL_TEXT,
          }),
        });
        ok = res.ok;
        if (!ok) errorText = JSON.stringify(await res.json().catch(() => ({})));
      } catch (e) {
        ok = false;
        errorText = String(e);
      }

      await supabase
        .from("deleted_account_notice_log")
        .update({
          email_status: ok ? "sent" : "failed",
          email_sent_at: ok ? new Date().toISOString() : null,
          email_error: ok ? null : errorText,
        })
        .eq("id", row.id);

      if (ok) sent++;
      else failed++;
    }

    return json({
      action: "send_batch",
      dryRun: false,
      sent,
      failed,
      counts: await counts(),
    });
  } catch (error) {
    console.error("notify-deleted-accounts:", error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
