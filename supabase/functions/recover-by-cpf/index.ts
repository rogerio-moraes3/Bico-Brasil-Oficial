import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoverRequest {
  cpf: string;
  action: 'lookup' | 'send-reset' | 'request-email-change' | 'confirm-email-change';
  newEmail?: string;
  code?: string;
}

// Rate limiting map (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  record.count++;
  return true;
}

function validateCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) { sum += parseInt(cleanCpf[i]) * (10 - i); }
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== parseInt(cleanCpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) { sum += parseInt(cleanCpf[i]) * (11 - i); }
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== parseInt(cleanCpf[10])) return false;
  return true;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function generateCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (100000 + (buf[0] % 900000)).toString();
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(code));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sendInternalEmail(
  supabaseUrl: string,
  serviceKey: string,
  to: string,
  subject: string,
  type: string,
  data: Record<string, unknown>
): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ to, subject, type, data }),
    });
    if (!response.ok) {
      console.error("send-email respondeu com erro:", await response.text());
    }
    return response.ok;
  } catch (err) {
    console.error("Erro ao chamar send-email:", err);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") { return new Response(null, { headers: corsHeaders }); }
  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || "unknown";

    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ success: false, error: "Muitas tentativas. Aguarde 1 hora antes de tentar novamente." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { cpf, action, newEmail, code }: RecoverRequest = await req.json();

    const cleanCpf = cpf?.replace(/\D/g, '') || '';
    if (!validateCPF(cleanCpf)) {
      return new Response(
        JSON.stringify({ success: false, error: "CPF inválido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!['lookup', 'send-reset', 'request-email-change', 'confirm-email-change'].includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: "Ação inválida" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = req.headers.get('origin') || 'https://bicobrasil.com.br';

    const { data: user, error: lookupError } = await supabase
      .from('users')
      .select('id, email, auth_id')
      .eq('cpf', cleanCpf)
      .maybeSingle();

    await supabase.from('audit_log').insert({
      action: `cpf_recovery_${action}`,
      ip_address: clientIP,
      payload: { cpf_last4: cleanCpf.slice(-4), found: !!user, action }
    });

    if (lookupError) {
      return new Response(
        JSON.stringify({ success: false, error: "Erro interno. Tente novamente." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'lookup') {
      return new Response(
        JSON.stringify({ success: true, message: "Se este CPF estiver cadastrado, você poderá prosseguir com a recuperação.", canProceed: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'send-reset') {
      if (user?.email) {
        const { data: linkData, error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: user.email,
          options: { redirectTo: `${siteUrl}/auth?mode=reset-password` }
        });

        if (resetError || !linkData?.properties?.action_link) {
          console.error("Reset link generation error:", resetError);
          return new Response(
            JSON.stringify({ success: false, error: "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde." }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const sent = await sendInternalEmail(
          supabaseUrl, supabaseServiceKey, user.email,
          "🔑 Redefinição de senha - Bico Brasil", "password_recovery",
          { actionLink: linkData.properties.action_link }
        );

        if (!sent) {
          return new Response(
            JSON.stringify({ success: false, error: "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde." }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
      // CPF não encontrado: nenhuma tentativa de envio é feita, resposta genérica
      // (evita revelar se o CPF existe ou não na base).
      return new Response(
        JSON.stringify({ success: true, message: "Se este CPF estiver cadastrado, um link de recuperação foi enviado para o email associado." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'request-email-change') {
      if (!newEmail || !validateEmail(newEmail)) {
        return new Response(
          JSON.stringify({ success: false, error: "Email inválido" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { data: existingUser } = await supabase.from('users').select('id').eq('email', newEmail).maybeSingle();
      if (existingUser) {
        return new Response(
          JSON.stringify({ success: false, error: "Este email já está em uso por outra conta." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (user?.email && user?.auth_id) {
        const plainCode = generateCode();
        const codeHash = await hashCode(plainCode);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Invalida qualquer pedido anterior ainda pendente do mesmo usuário
        await supabase.from('email_change_requests').delete().eq('user_id', user.id).is('used_at', null);
        await supabase.from('email_change_requests').insert({
          user_id: user.id,
          code_hash: codeHash,
          new_email: newEmail,
          expires_at: expiresAt,
        });

        // Código vai para o e-mail JÁ CADASTRADO, nunca para o novo — é a
        // segunda verificação que impede troca de e-mail só com o CPF.
        const sent = await sendInternalEmail(
          supabaseUrl, supabaseServiceKey, user.email,
          "🔒 Confirme a troca de e-mail - Bico Brasil", "email_change_code",
          { newEmail, code: plainCode, expiresInMinutes: 10 }
        );

        if (!sent) {
          return new Response(
            JSON.stringify({ success: false, error: "Não foi possível enviar o código de confirmação. Tente novamente mais tarde." }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Se este CPF estiver cadastrado, um código de confirmação foi enviado para o e-mail atualmente cadastrado." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'confirm-email-change') {
      const genericCodeError = () => new Response(
        JSON.stringify({ success: false, error: "Código inválido ou expirado." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

      if (!newEmail || !validateEmail(newEmail)) {
        return new Response(
          JSON.stringify({ success: false, error: "Email inválido" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      if (!code || !/^\d{6}$/.test(code)) {
        return genericCodeError();
      }
      if (!user?.id || !user?.auth_id) {
        return genericCodeError();
      }

      const { data: pending } = await supabase
        .from('email_change_requests')
        .select('id, code_hash, new_email, attempts, expires_at')
        .eq('user_id', user.id)
        .is('used_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!pending) return genericCodeError();
      if (new Date(pending.expires_at).getTime() < Date.now()) return genericCodeError();
      if (pending.attempts >= 5) return genericCodeError();
      if (pending.new_email !== newEmail) return genericCodeError();

      const submittedHash = await hashCode(code);
      if (submittedHash !== pending.code_hash) {
        await supabase.from('email_change_requests').update({ attempts: pending.attempts + 1 }).eq('id', pending.id);
        return genericCodeError();
      }

      const { data: existingUser } = await supabase.from('users').select('id').eq('email', newEmail).maybeSingle();
      if (existingUser) {
        return new Response(
          JSON.stringify({ success: false, error: "Este email já está em uso por outra conta." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error: authError } = await supabase.auth.admin.updateUserById(user.auth_id, { email: newEmail });
      if (authError) {
        console.error("Email change error:", authError);
        return new Response(
          JSON.stringify({ success: false, error: "Não foi possível atualizar o email. Entre em contato com o suporte." }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      await supabase.from('users').update({ email: newEmail }).eq('id', user.id);
      await supabase.from('email_change_requests').update({ used_at: new Date().toISOString() }).eq('id', pending.id);

      // Best-effort: já manda o link de definição de senha para o novo e-mail.
      // Se esse envio falhar, a troca de e-mail em si já foi concluída — não
      // faz sentido reportar erro pro usuário por causa disso.
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: newEmail,
        options: { redirectTo: `${siteUrl}/auth?mode=reset-password` }
      });
      if (!linkError && linkData?.properties?.action_link) {
        await sendInternalEmail(
          supabaseUrl, supabaseServiceKey, newEmail,
          "🔑 Defina sua nova senha - Bico Brasil", "password_recovery",
          { actionLink: linkData.properties.action_link }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Email atualizado com sucesso! Um link para definir sua senha foi enviado para o novo endereço." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Ação não suportada" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("recover-by-cpf error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno. Tente novamente." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
