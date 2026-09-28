import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const INTERNAL_TASK_SECRET = Deno.env.get("INTERNAL_TASK_SECRET");
const SUPPORT_EMAIL = "contato.bicobrasil@gmail.com";
const COMPLETE_PROFILE_URL = "https://bicobrasil.com.br/complete-profile";
// Cadencia minima entre lembretes pra mesma conta — nao e mais um prazo pra
// exclusao (essa conta nunca mais e apagada por isso, ver
// supabase/migrations/20260916120000_feature_gate_incomplete_profiles.sql).
// incomplete_signup_notice_sent_at agora significa so "ultimo lembrete
// enviado"; o cron reenvia depois desse intervalo, indefinidamente, ate
// completar.
const REMINDER_INTERVAL_DAYS = 7;

// Server-to-server: chamado pelo cron remind-incomplete-signup-accounts (ver
// migration 20260916140000). Nunca exposta ao navegador — por isso
// verify_jwt=false no config.toml e a checagem do proprio segredo aqui
// dentro (mesmo padrao de mercadopago-webhook validando
// MERCADOPAGO_WEBHOOK_SECRET).
function isAuthorized(req: Request): boolean {
  const provided = req.headers.get("x-internal-secret");
  return !!INTERNAL_TASK_SECRET && provided === INTERNAL_TASK_SECRET;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  type: string | null;
  cpf: string | null;
  phone_verified: boolean;
  city_id: string | null;
  neighborhood: string | null;
  cep: string | null;
  house_number: string | null;
  category: string | null;
  incomplete_signup_notice_sent_at: string | null;
}

// Espelha public.is_profile_complete() (ver migration
// 20260916120000_feature_gate_incomplete_profiles.sql) e
// computeMissingFields() em src/hooks/useProfileCompletion.tsx. Mantenha as
// tres em sincronia se os campos exigidos mudarem.
function missingFieldsFor(user: UserRow): string[] {
  const missing: string[] = [];
  if (!user.cpf || user.cpf.trim() === "") missing.push("CPF");
  if (!user.phone_verified) missing.push("Telefone/WhatsApp confirmado");
  if (!user.city_id) missing.push("Cidade");
  if (!user.neighborhood || user.neighborhood.trim() === "") missing.push("Bairro");
  if (!user.cep || user.cep.trim() === "") missing.push("CEP");
  if (!user.house_number || user.house_number.trim() === "") missing.push("Número da residência");
  if (user.type === "worker" && (!user.category || user.category.trim() === "")) missing.push("Categoria de trabalho");
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
      .select("id, name, email, type, cpf, phone_verified, city_id, neighborhood, cep, house_number, category, incomplete_signup_notice_sent_at")
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
      const lastSentMs = new Date(user.incomplete_signup_notice_sent_at).getTime();
      const daysSinceLastNotice = (Date.now() - lastSentMs) / (24 * 60 * 60 * 1000);
      if (daysSinceLastNotice < REMINDER_INTERVAL_DAYS) {
        console.debug("⏭️ [notify-incomplete-signup] Lembrete enviado há menos de", REMINDER_INTERVAL_DAYS, "dias:", user.id, user.incomplete_signup_notice_sent_at);
        return new Response(JSON.stringify({ skipped: "reminded_recently", sent_at: user.incomplete_signup_notice_sent_at }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
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
            .header { background: linear-gradient(135deg, #1650E0 0%, #5B8DEF 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .missing-box { background: #eff6ff; border: 1px solid #93c5fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .missing-box ul { margin: 10px 0 0; padding-left: 20px; }
            .unlocks-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; }
            .cta { text-align: center; margin: 30px 0; }
            .cta a { background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Complete seu cadastro</h1>
              <p style="margin: 10px 0 0;">Bico Brasil</p>
            </div>
            <div class="content">
              <p>Olá, <strong>${safeName || "tudo bem"}</strong>!</p>
              <p>Notamos que seu cadastro no Bico Brasil ainda está incompleto. Faltam os seguintes dados:</p>
              <div class="missing-box">
                <strong>Pendências:</strong>
                <ul>${missingListHtml}</ul>
              </div>
              <div class="unlocks-box">
                <p style="margin: 0;">Complete seu cadastro pra liberar publicação de vagas, oferta de serviços e desbloqueio de contatos.</p>
              </div>
              <p>Não se preocupe, leva menos de 2 minutos:</p>
              <div class="cta">
                <a href="${COMPLETE_PROFILE_URL}">Completar Meu Cadastro</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Sua conta continua ativa normalmente enquanto isso — este é só um lembrete, não é preciso responder se não quiser completar agora.</p>
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
        subject: "Complete seu cadastro no Bico Brasil e libere todas as funções",
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
