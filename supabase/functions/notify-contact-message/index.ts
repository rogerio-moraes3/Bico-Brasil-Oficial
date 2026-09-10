import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPPORT_EMAIL = "contato.bicobrasil@gmail.com";

// Rate limit: no maximo 1 notificacao por email e 3 por IP a cada 10 minutos,
// pra impedir que alguem chamando a function direto (sem passar pelo
// formulario /contact) floode a caixa de suporte.
const RATE_LIMIT_WINDOW_MINUTES = 10;
const MAX_ATTEMPTS_PER_EMAIL = 1;
const MAX_ATTEMPTS_PER_IP = 3;

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

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function validateContact(data: unknown): { valid: boolean; error?: string; contact?: ContactMessage } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== 'string' || obj.name.trim().length < 2 || obj.name.length > 100) {
    return { valid: false, error: "Nome deve ter entre 2 e 100 caracteres" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof obj.email !== 'string' || !emailRegex.test(obj.email) || obj.email.length > 255) {
    return { valid: false, error: "Email inválido" };
  }

  if (typeof obj.subject !== 'string' || obj.subject.trim().length < 3 || obj.subject.length > 200) {
    return { valid: false, error: "Assunto deve ter entre 3 e 200 caracteres" };
  }

  if (typeof obj.message !== 'string' || obj.message.trim().length < 10 || obj.message.length > 2000) {
    return { valid: false, error: "Mensagem deve ter entre 10 e 2000 caracteres" };
  }

  return {
    valid: true,
    contact: {
      name: obj.name.trim().substring(0, 100),
      email: obj.email.trim().toLowerCase().substring(0, 255),
      subject: obj.subject.trim().substring(0, 200),
      message: obj.message.trim().substring(0, 2000),
    }
  };
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  console.debug("🚀 [notify-contact-message] Edge Function iniciada");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateContact(parsedBody);
    if (!validation.valid || !validation.contact) {
      console.error("❌ [notify-contact-message] Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contact = validation.contact;

    if (!RESEND_API_KEY) {
      console.error("❌ [notify-contact-message] RESEND_API_KEY não configurada!");
      return new Response(
        JSON.stringify({ error: "Serviço de email não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const clientIp = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();

    const [emailAttempts, ipAttempts] = await Promise.all([
      supabase
        .from("contact_notification_attempts")
        .select("id", { count: "exact", head: true })
        .eq("email", contact.email)
        .gte("created_at", windowStart),
      supabase
        .from("contact_notification_attempts")
        .select("id", { count: "exact", head: true })
        .eq("ip", clientIp)
        .gte("created_at", windowStart),
    ]);

    const emailCount = emailAttempts.count ?? 0;
    const ipCount = ipAttempts.count ?? 0;

    if (emailCount >= MAX_ATTEMPTS_PER_EMAIL || ipCount >= MAX_ATTEMPTS_PER_IP) {
      console.warn("⏳ [notify-contact-message] Rate limit atingido:", { email: contact.email, ip: clientIp, emailCount, ipCount });
      return new Response(
        JSON.stringify({ error: "Você já enviou uma mensagem recentemente. Tente novamente em alguns minutos." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("contact_notification_attempts").insert([{ email: contact.email, ip: clientIp }]);

    const safeName = contact.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeEmail = contact.email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeSubject = contact.subject.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeMessage = contact.message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #0A4CFB 0%, #12C568 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .info { background: #f8f9fa; padding: 20px; border-left: 4px solid #0A4CFB; margin: 20px 0; }
            .info strong { color: #0A4CFB; }
            .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📩 Nova Mensagem de Suporte</h1>
              <p style="margin: 10px 0 0;">Bico Brasil - /contact</p>
            </div>
            <div class="content">
              <div class="info">
                <p><strong>👤 Nome:</strong> ${safeName}</p>
                <p><strong>📧 Email:</strong> ${safeEmail}</p>
                <p><strong>📝 Assunto:</strong> ${safeSubject}</p>
              </div>
              <div class="message-box">
                ${safeMessage}
              </div>
              <p style="color: #666; font-size: 13px;">Responda este e-mail diretamente para falar com ${safeName}.</p>
              <div class="footer">
                <p>Bico Brasil - Trabalhou, Tá Pago.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    console.debug("📧 [notify-contact-message] Enviando email para", SUPPORT_EMAIL);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Bico Brasil <contato@bicobrasil.com.br>",
        to: [SUPPORT_EMAIL],
        reply_to: contact.email,
        subject: `[Suporte] ${contact.subject}`,
        html: emailHTML,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("❌ [notify-contact-message] Erro ao enviar email:", emailData);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar notificação por email" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.debug("✅ [notify-contact-message] Email enviado com sucesso:", emailData.id);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("💥 [notify-contact-message] Erro fatal:", error.message);
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar notificação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
