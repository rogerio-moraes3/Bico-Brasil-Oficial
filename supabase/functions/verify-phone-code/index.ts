import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_VERIFY_SERVICE_SID = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

const MAX_ATTEMPTS = 5;

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
      .select("id")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (profileError || !profile) return json({ success: false, error: "Perfil não encontrado." }, 404);

    let bodyJson: unknown;
    try {
      bodyJson = await req.json();
    } catch {
      return json({ success: false, error: "Requisição inválida." }, 400);
    }

    const obj = bodyJson as Record<string, unknown>;
    const phoneDigits = cleanPhone(obj?.phone);
    const code = typeof obj?.code === "string" ? obj.code.trim() : "";

    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return json({ success: false, error: "Telefone inválido." }, 400);
    }
    if (!/^\d{4,8}$/.test(code)) {
      return json({ success: false, error: "Código inválido." }, 400);
    }

    // reason distingue os motivos pro frontend: "invalid_code"/"expired" ainda
    // valem tentar de novo ou reenviar; "too_many_attempts" é quando a tela
    // deve parar de oferecer "tentar de novo" e oferecer falar com o suporte.
    const codeError = (reason: "invalid_code" | "expired" | "too_many_attempts", attemptsRemaining?: number) =>
      json({
        success: false,
        error: reason === "too_many_attempts"
          ? "Muitas tentativas erradas. Fale com o suporte para verificar seu telefone."
          : reason === "expired"
            ? "Código expirado. Solicite um novo."
            : "Código inválido.",
        reason,
        ...(attemptsRemaining !== undefined ? { attemptsRemaining } : {}),
      }, reason === "too_many_attempts" ? 423 : 400);

    const { data: pending, error: pendingError } = await supabase
      .from("phone_verification_codes")
      .select("id, phone, attempts, expires_at, status")
      .eq("user_id", profile.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingError) {
      console.error("Erro ao buscar código pendente:", pendingError);
      return json({ success: false, error: "Erro interno. Tente novamente." }, 500);
    }

    if (!pending || pending.phone !== phoneDigits) return codeError("invalid_code");
    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await supabase.from("phone_verification_codes").update({ status: "expired" }).eq("id", pending.id);
      return codeError("expired");
    }
    if (pending.attempts >= MAX_ATTEMPTS) {
      await supabase.from("phone_verification_codes").update({ status: "failed" }).eq("id", pending.id);
      return codeError("too_many_attempts");
    }

    const e164Phone = toE164BR(phoneDigits);

    const twilioResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: e164Phone, Code: code }),
      }
    );

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok || twilioData.status !== "approved") {
      const newAttempts = pending.attempts + 1;
      const exhausted = newAttempts >= MAX_ATTEMPTS;
      await supabase
        .from("phone_verification_codes")
        .update({ attempts: newAttempts, status: exhausted ? "failed" : "pending" })
        .eq("id", pending.id);
      return exhausted
        ? codeError("too_many_attempts")
        : codeError("invalid_code", MAX_ATTEMPTS - newAttempts);
    }

    const now = new Date().toISOString();

    await supabase
      .from("phone_verification_codes")
      .update({ status: "approved", verified_at: now })
      .eq("id", pending.id);

    const { error: updateUserError } = await supabase
      .from("users")
      .update({ phone: phoneDigits, phone_verified: true, phone_verified_at: now, updated_at: now })
      .eq("id", profile.id);

    if (updateUserError) {
      console.error("Erro ao marcar telefone como verificado:", updateUserError);
      return json({ success: false, error: "Erro interno. Tente novamente." }, 500);
    }

    try {
      await supabase.from("audit_log").insert({
        action: "phone_verified",
        user_id: profile.id,
        payload: { phone_last4: phoneDigits.slice(-4) },
      });
    } catch (e) {
      console.error("Erro ao registrar audit_log:", e);
    }

    return json({ success: true, message: "Telefone verificado com sucesso!" });
  } catch (error) {
    console.error("verify-phone-code error:", error);
    return json({ success: false, error: "Erro interno. Tente novamente." }, 500);
  }
});
