import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const INTERNAL_TASK_SECRET = Deno.env.get("INTERNAL_TASK_SECRET");
const SUPPORT_EMAIL = "contato.bicobrasil@gmail.com";
const COMPLETE_PROFILE_URL = "https://bicobrasil.com.br/complete-profile";

// Server-to-server: chamada manualmente (rollout do backlog) ou futuramente
// por um cron. Nunca exposta ao navegador — por isso verify_jwt=false no
// config.toml e a checagem do proprio segredo aqui dentro (mesmo padrao de
// mercadopago-webhook validando MERCADOPAGO_WEBHOOK_SECRET).
function isAuthorized(req: Request): boolean {
  const provided = req.headers.get("x-internal-secret");
  return !!INTERNAL_TASK_SECRET && provided === INTERNAL_TASK_SECRET;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone_verified: boolean;
  incomplete_signup_notice_sent_at: string | null;
}

function missingFieldsFor(user: UserRow): string[] {
  const missing: string[] = [];
  if (!user.cpf || user.cpf.trim() === "") missing.push("CPF");
  if (!user.phone_verified) missing.push("Telefone/WhatsApp (verificação por SMS)");
  return missing;
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

    if (!RESEND_API_KEY) {
      console.error("❌ [notify-incomplete-signup] RESEND_API_KEY não configurada!");
      return new Response(JSON.stringify({ error: "Serviço de email não configurado" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, name, email, cpf, phone_verified, incomplete_signup_notice_sent_at")
      .eq("id", user_id)
      .maybeSingle<UserRow>();

    if (fetchError) throw fetchError;

    if (!user) {
      return new Response(JSON.stringify({ skipped: "user_not_found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const missing = missingFieldsFor(user);

    if (missing.length === 0) {
      console.debug("⏭️ [notify-incomplete-signup] Conta já completa, não precisa avisar:", user.id);
      return new Response(JSON.stringify({ skipped: "already_complete" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (user.incomplete_signup_notice_sent_at) {
      console.debug("⏭️ [notify-incomplete-signup] Aviso já enviado antes:", user.id, user.incomplete_signup_notice_sent_at);
      return new Response(JSON.stringify({ skipped: "already_notified", sent_at: user.incomplete_signup_notice_sent_at }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const safeName = (user.name || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const missingListHtml = missing.map((m) => `<li>${m}</li>`).join("");

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .missing-box { background: #fffbeb; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .missing-box ul { margin: 10px 0 0; padding-left: 20px; }
            .deadline { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .cta { text-align: center; margin: 30px 0; }
            .cta a { background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⚠️ Complete seu cadastro</h1>
              <p style="margin: 10px 0 0;">Bico Brasil</p>
            </div>
            <div class="content">
              <p>Olá, <strong>${safeName || "tudo bem"}</strong>!</p>
              <p>Notamos que seu cadastro no Bico Brasil está incompleto. Faltam os seguintes dados:</p>
              <div class="missing-box">
                <strong>Pendências:</strong>
                <ul>${missingListHtml}</ul>
              </div>
              <div class="deadline">
                <p style="margin: 0;"><strong>⏰ Atenção:</strong> se o cadastro não for completado em até <strong>3 dias</strong>, sua conta e todos os dados vinculados a ela serão excluídos permanentemente.</p>
              </div>
              <p>Não se preocupe, leva menos de 2 minutos:</p>
              <div class="cta">
                <a href="${COMPLETE_PROFILE_URL}">Completar Meu Cadastro</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Se você não reconhece este cadastro ou não pretende mais usar o Bico Brasil, pode ignorar este e-mail — a conta será removida automaticamente.</p>
              <div class="footer">
                <p>Bico Brasil - Trabalhou, Tá Pago.</p>
                <p>Dúvidas? Responda este e-mail ou fale com ${SUPPORT_EMAIL}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Bico Brasil <naoresponda@bicobrasil.com.br>",
        to: [user.email],
        reply_to: SUPPORT_EMAIL,
        subject: "⚠️ Complete seu cadastro no Bico Brasil (conta será excluída em 3 dias)",
        html: emailHTML,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("❌ [notify-incomplete-signup] Erro ao enviar email:", user.id, emailData);
      return new Response(JSON.stringify({ error: "Erro ao enviar email de aviso" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ incomplete_signup_notice_sent_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      console.error("❌ [notify-incomplete-signup] Email enviado mas falha ao marcar aviso:", user.id, updateError);
      return new Response(JSON.stringify({ warning: "Email enviado, mas falha ao registrar o envio", error: updateError.message }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.debug("✅ [notify-incomplete-signup] Aviso enviado:", user.id, user.email, missing);

    return new Response(JSON.stringify({ success: true, missing }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("💥 [notify-incomplete-signup] Erro fatal:", error.message);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
