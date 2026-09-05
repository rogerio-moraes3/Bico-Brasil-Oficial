import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const DAILY_EMAIL_LIMIT = 100;

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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function emailHtml(name: string, phoneVerified: boolean): string {
  const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cta = phoneVerified
    ? { href: "https://bicobrasil.com.br/search-workers", label: "Ver quem já está por perto" }
    : { href: "https://bicobrasil.com.br/complete-profile", label: "Completar meu cadastro" };
  const extra = phoneVerified
    ? ""
    : `<p>Falta só um passo pra aproveitar tudo: confirmar seu telefone/WhatsApp no seu perfil. É rápido.</p>`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #0A4CFB 0%, #12C568 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .cta { display: inline-block; background: #0A4CFB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Estamos no ar em todo o Brasil!</h1>
            <p style="margin: 10px 0 0;">Bico Brasil</p>
          </div>
          <div class="content">
            <p>Oi, <strong>${safeName}</strong>!</p>
            <p>Ótima notícia: o Bico Brasil agora atende profissionais e contratantes em <strong>todo o território nacional</strong> — não é mais só a região de Presidente Prudente. Já são mais de 100 cidades ativas, de norte a sul.</p>
            ${extra}
            <p style="text-align: center;">
              <a href="${cta.href}" class="cta" style="display: inline-block; background-color: #0A4CFB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">${cta.label}</a>
            </p>
            <div class="footer">
              <p>Bico Brasil - Trabalhou, Tá Pago.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

const IN_APP_TITLE = "Estamos no ar em todo o Brasil!";
const inAppBody = (phoneVerified: boolean) =>
  phoneVerified
    ? "O Bico Brasil agora atende todo o território nacional. Já são mais de 100 cidades ativas — dá uma olhada em quem está perto de você."
    : "O Bico Brasil agora atende todo o território nacional. Falta só confirmar seu telefone/WhatsApp no perfil pra aproveitar tudo.";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
      // corpo vazio é aceitavel, default action = "status"
    }
    const action = typeof body.action === "string" ? body.action : "status";
    const dryRun = body.dryRun !== false; // default true — precisa passar dryRun:false explicitamente pra mandar de verdade
    // targetEmail restringe o send_batch a um unico usuario — pra teste real
    // isolado sem tocar na fila do resto da lista (que continua pending).
    const targetEmail = typeof body.targetEmail === "string" ? body.targetEmail.trim().toLowerCase() : null;

    if (action === "seed") {
      // Popula o log com todo usuario real ainda nao presente (idempotente:
      // UNIQUE(user_id) + ON CONFLICT DO NOTHING evita duplicar em re-chamadas).
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, auth_id, email, phone_verified")
        .not("email", "is", null)
        .neq("email", "");
      if (usersError) return json({ error: usersError.message }, 500);

      const rows = (users ?? [])
        .filter((u) => !!u.email && !!u.auth_id)
        .map((u) => ({
          user_id: u.id,
          auth_id: u.auth_id,
          email: u.email,
          phone_verified_at_seed: !!u.phone_verified,
        }));

      const { error: insertError } = await supabase
        .from("national_launch_notification_log")
        .upsert(rows, { onConflict: "user_id", ignoreDuplicates: true });
      if (insertError) return json({ error: insertError.message }, 500);

      return json({ action: "seed", totalCandidates: rows.length });
    }

    if (action === "send_batch") {
      // 1) In-app: sem limite externo, processa tudo que ainda esta pendente
      // (ou so o targetEmail, se informado).
      let inAppQuery = supabase
        .from("national_launch_notification_log")
        .select("id, auth_id, phone_verified_at_seed")
        .eq("in_app_status", "pending")
        .limit(1000);
      if (targetEmail) inAppQuery = inAppQuery.eq("email", targetEmail);
      const { data: inAppPending, error: inAppErr } = await inAppQuery;
      if (inAppErr) return json({ error: inAppErr.message }, 500);

      let inAppSent = 0;
      if (!dryRun) {
        for (const row of inAppPending ?? []) {
          const { error: notifErr } = await supabase.from("notifications").insert({
            user_id: row.auth_id,
            title: IN_APP_TITLE,
            body: inAppBody(row.phone_verified_at_seed),
            is_read: false,
            data: { type: "system", link: row.phone_verified_at_seed ? "/search-workers" : "/complete-profile" },
          });
          await supabase
            .from("national_launch_notification_log")
            .update({
              in_app_status: notifErr ? "failed" : "sent",
              in_app_sent_at: notifErr ? null : new Date().toISOString(),
            })
            .eq("id", row.id);
          if (!notifErr) inAppSent++;
        }
      }

      // 2) Email: respeita o limite diario do Resend (ou so o targetEmail).
      let emailQuery = supabase
        .from("national_launch_notification_log")
        .select("id, user_id, email, phone_verified_at_seed, users(name)")
        .eq("email_status", "pending")
        .limit(DAILY_EMAIL_LIMIT);
      if (targetEmail) emailQuery = emailQuery.eq("email", targetEmail);
      const { data: emailPending, error: emailErr } = await emailQuery;
      if (emailErr) return json({ error: emailErr.message }, 500);

      let emailSent = 0;
      let emailFailed = 0;
      if (!dryRun && RESEND_API_KEY) {
        for (const row of emailPending ?? []) {
          const name = (row as any).users?.name || "profissional";
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Bico Brasil <contato@bicobrasil.com.br>",
              to: [row.email],
              subject: "Estamos no ar em todo o Brasil!",
              html: emailHtml(name, row.phone_verified_at_seed),
            }),
          });
          const resData = await res.json().catch(() => ({}));
          await supabase
            .from("national_launch_notification_log")
            .update({
              email_status: res.ok ? "sent" : "failed",
              email_sent_at: res.ok ? new Date().toISOString() : null,
              email_error: res.ok ? null : JSON.stringify(resData),
            })
            .eq("id", row.id);
          if (res.ok) emailSent++;
          else emailFailed++;
        }
      }

      const { count: emailRemaining } = await supabase
        .from("national_launch_notification_log")
        .select("id", { count: "exact", head: true })
        .eq("email_status", "pending");

      return json({
        action: "send_batch",
        dryRun,
        inAppCandidates: inAppPending?.length ?? 0,
        inAppSent,
        emailCandidatesThisBatch: emailPending?.length ?? 0,
        emailSent,
        emailFailed,
        emailRemaining: emailRemaining ?? 0,
      });
    }

    // action === "status" (default): so reporta contagens, nunca envia nada.
    const { count: total } = await supabase
      .from("national_launch_notification_log")
      .select("id", { count: "exact", head: true });
    const { count: emailSentCount } = await supabase
      .from("national_launch_notification_log")
      .select("id", { count: "exact", head: true })
      .eq("email_status", "sent");
    const { count: inAppSentCount } = await supabase
      .from("national_launch_notification_log")
      .select("id", { count: "exact", head: true })
      .eq("in_app_status", "sent");

    return json({ action: "status", total: total ?? 0, emailSent: emailSentCount ?? 0, inAppSent: inAppSentCount ?? 0 });
  } catch (error) {
    console.error("send-national-launch-notification error:", error);
    return json({ error: "Erro interno" }, 500);
  }
});
