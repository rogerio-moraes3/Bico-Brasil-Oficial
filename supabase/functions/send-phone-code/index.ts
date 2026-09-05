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

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_VERIFY_SERVICE_SID = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

const RATE_LIMIT_MAX_PER_HOUR = 5;
const RESEND_COOLDOWN_MS = 45 * 1000;
const CODE_TTL_MS = 10 * 60 * 1000;

function cleanPhone(phone: unknown): string {
  return typeof phone === "string" ? phone.replace(/\D/g, "") : "";
}

function toE164BR(phoneDigits: string): string {
  return `+55${phoneDigits}`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
      console.error("Twilio secrets não configurados");
      return json({ success: false, error: "Serviço de verificação indisponível no momento." }, 500);
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ success: false, error: "Não autenticado." }, 401);
    const token = authHeader.replace("Bearer ", "").trim();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ success: false, error: "Não autenticado." }, 401);

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, phone_verified")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (profileError || !profile) return json({ success: false, error: "Perfil não encontrado." }, 404);

    let bodyJson: unknown;
    try {
      bodyJson = await req.json();
    } catch {
      return json({ success: false, error: "Requisição inválida." }, 400);
    }

    const phoneDigits = cleanPhone((bodyJson as Record<string, unknown>)?.phone);
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return json({ success: false, error: "Telefone inválido. Use DDD + número." }, 400);
    }

    // Rate limit: janela de 1h por usuário
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentSends, error: recentError } = await supabase
      .from("phone_verification_codes")
      .select("id, created_at")
      .eq("user_id", profile.id)
      .gte("created_at", oneHourAgo)
      .order("created_at", { ascending: false });

    if (recentError) {
      console.error("Erro ao checar rate limit:", recentError);
      return json({ success: false, error: "Erro interno. Tente novamente." }, 500);
    }

    if (recentSends && recentSends.length > 0) {
      const lastSentAt = new Date(recentSends[0].created_at).getTime();
      if (Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - lastSentAt)) / 1000);
        return json({ success: false, error: `Aguarde ${waitSeconds}s antes de reenviar o código.` }, 429);
      }
      if (recentSends.length >= RATE_LIMIT_MAX_PER_HOUR) {
        return json({ success: false, error: "Muitas tentativas. Aguarde 1 hora antes de tentar novamente." }, 429);
      }
    }

    const e164Phone = toE164BR(phoneDigits);

    const sendVerification = (channel: "sms") =>
      fetch(
        `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ To: e164Phone, Channel: channel }),
        }
      );

    // SMS apenas por enquanto — WhatsApp Business API exige perfil empresarial
    // (CNPJ) que ainda não temos. Voltar a tentar WhatsApp primeiro quando o
    // Business Profile da Twilio estiver aprovado.
    const channelUsed: "sms" = "sms";
    const twilioResponse = await sendVerification("sms");
    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio send error:", twilioData);
      const code = twilioData?.code;
      let message = "Não foi possível enviar o código. Verifique o número e tente novamente.";
      if (code === 60200) message = "Número de telefone inválido.";
      else if (code === 60203 || code === 60212) message = "Muitas tentativas para este número. Tente novamente mais tarde.";
      else if (code === 60205) message = "Este número não pode receber SMS.";
      return json({ success: false, error: message }, 400);
    }

    // Invalida quaisquer códigos pendentes anteriores deste usuário antes de
    // registrar o novo — evita que verify-phone-code aceite um código velho.
    await supabase
      .from("phone_verification_codes")
      .update({ status: "expired" })
      .eq("user_id", profile.id)
      .eq("status", "pending");

    const { error: insertError } = await supabase.from("phone_verification_codes").insert({
      user_id: profile.id,
      phone: phoneDigits,
      status: "pending",
      twilio_sid: twilioData.sid,
      expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
    });

    if (insertError) {
      console.error("Erro ao registrar código de verificação:", insertError);
      return json({ success: false, error: "Erro interno. Tente novamente." }, 500);
    }

    return json({
      success: true,
      channel: channelUsed,
      message: "Código enviado por SMS.",
    });
  } catch (error) {
    console.error("send-phone-code error:", error);
    return json({ success: false, error: "Erro interno. Tente novamente." }, 500);
  }
});
