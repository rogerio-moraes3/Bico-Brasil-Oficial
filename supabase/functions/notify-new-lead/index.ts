import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema (manual implementation to avoid Zod dependency issues in Deno)
function validateLead(data: unknown): { valid: boolean; error?: string; lead?: Lead } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (!obj.lead || typeof obj.lead !== 'object') {
    return { valid: false, error: "Missing 'lead' object in request body" };
  }

  const lead = obj.lead as Record<string, unknown>;

  // Validate nome
  if (typeof lead.nome !== 'string' || lead.nome.trim().length < 2 || lead.nome.length > 100) {
    return { valid: false, error: "Nome deve ter entre 2 e 100 caracteres" };
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof lead.email !== 'string' || !emailRegex.test(lead.email) || lead.email.length > 255) {
    return { valid: false, error: "Email inválido" };
  }

  // Validate cidade
  if (typeof lead.cidade !== 'string' || lead.cidade.trim().length < 2 || lead.cidade.length > 100) {
    return { valid: false, error: "Cidade deve ter entre 2 e 100 caracteres" };
  }

  // Validate tipo_interesse
  const validTipos = ['fazer_bico', 'anunciar_servico'];
  if (typeof lead.tipo_interesse !== 'string' || !validTipos.includes(lead.tipo_interesse)) {
    return { valid: false, error: "Tipo de interesse inválido" };
  }

  // Sanitize inputs
  return {
    valid: true,
    lead: {
      nome: lead.nome.trim().substring(0, 100),
      email: lead.email.trim().toLowerCase().substring(0, 255),
      cidade: lead.cidade.trim().substring(0, 100),
      tipo_interesse: lead.tipo_interesse,
      created_at: typeof lead.created_at === 'string' ? lead.created_at : new Date().toISOString()
    }
  };
}

interface Lead {
  nome: string;
  email: string;
  cidade: string;
  tipo_interesse: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.debug("🚀 [notify-new-lead] Edge Function iniciada");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const rawBody = await req.text();
    console.debug("📦 [notify-new-lead] Dados recebidos (truncated):", rawBody.substring(0, 200));

    // Parse and validate input
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateLead(parsedBody);
    if (!validation.valid || !validation.lead) {
      console.error("❌ [notify-new-lead] Validation failed:", validation.error);
      await supabase.from("email_log").insert([{
        email: "validation_error",
        tipo: "validation_failed",
        status: "failed",
        error: validation.error
      }]);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lead = validation.lead;
    console.debug("✅ [notify-new-lead] Lead validado:", {
      nome: lead.nome,
      email: lead.email,
      cidade: lead.cidade,
      tipo: lead.tipo_interesse
    });

    // Verificar se RESEND_API_KEY está configurada
    if (!RESEND_API_KEY) {
      console.error("❌ [notify-new-lead] RESEND_API_KEY não configurada!");
      await supabase.from("email_log").insert([{
        email: lead.email,
        tipo: "error",
        status: "failed",
        error: "RESEND_API_KEY não configurada"
      }]);
      return new Response(
        JSON.stringify({ error: "Serviço de email não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar emails dos colaboradores autorizados usando service role (bypasses RLS)
    const { data: colaboradores, error: colabError } = await supabase
      .from("colaboradores_autorizados")
      .select("email");

    console.debug("👥 [notify-new-lead] Colaboradores buscados:", {
      quantidade: colaboradores?.length || 0,
      error: colabError
    });

    if (colabError || !colaboradores || colaboradores.length === 0) {
      console.error("❌ [notify-new-lead] Erro ao buscar colaboradores:", colabError);
      await supabase.from("email_log").insert([{
        email: lead.email,
        tipo: "admin_notification",
        status: "failed",
        error: "Colaboradores não encontrados"
      }]);
      return new Response(
        JSON.stringify({ error: "Erro interno ao processar notificação" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminEmails = colaboradores.map(c => c.email);
    const tipoInteresseFormatado = lead.tipo_interesse === 'fazer_bico'
      ? '🔨 Fazer Bico'
      : '📢 Anunciar Serviço';

    // HTML template for admin notification (sanitized values)
    const safeNome = lead.nome.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeEmail = lead.email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeCidade = lead.cidade.replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
            .lead-info { background: #f8f9fa; padding: 20px; border-left: 4px solid #0A4CFB; margin: 20px 0; }
            .lead-info strong { color: #0A4CFB; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .badge { display: inline-block; padding: 6px 12px; background: #12C568; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎯 Novo Lead Cadastrado!</h1>
              <p style="margin: 10px 0 0;">Lista VIP - Bico Brasil</p>
            </div>
            <div class="content">
              <p>Olá, Admin!</p>
              <p>Um novo lead acaba de se cadastrar na lista VIP do Bico Brasil:</p>
              
              <div class="lead-info">
                <p><strong>👤 Nome:</strong> ${safeNome}</p>
                <p><strong>📧 Email:</strong> ${safeEmail}</p>
                <p><strong>📍 Cidade:</strong> ${safeCidade}</p>
                <p><strong>💼 Interesse:</strong> <span class="badge">${tipoInteresseFormatado}</span></p>
                <p><strong>🕐 Data:</strong> ${new Date(lead.created_at).toLocaleString('pt-BR')}</p>
              </div>

              <p>Este lead está aguardando o lançamento oficial da plataforma e deve ser notificado quando estivermos prontos!</p>
              
              <div class="footer">
                <p>Bico Brasil - Painel Administrativo</p>
                <p>Trabalhou, Tá Pago.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar email via Resend API para admins
    console.debug("📧 [notify-new-lead] Enviando email para admins");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Bico Brasil <onboarding@resend.dev>",
        to: adminEmails,
        subject: `🎉 Novo Lead: ${safeNome} de ${safeCidade}`,
        html: emailHTML,
      }),
    });

    const emailData = await emailResponse.json();

    console.debug("📧 [notify-new-lead] Resposta do envio para admins:", {
      status: emailResponse.status,
      ok: emailResponse.ok
    });

    // Logar resultado do email para admins
    await supabase.from("email_log").insert([{
      email: adminEmails.join(", "),
      tipo: "admin_notification",
      status: emailResponse.ok ? "sent" : "failed",
      payload: { id: emailData.id },
      error: emailResponse.ok ? null : JSON.stringify(emailData)
    }]);

    if (!emailResponse.ok) {
      console.error("❌ [notify-new-lead] Erro ao enviar email para admins");
    }

    // Enviar email de confirmação para o usuário
    const userEmailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #0A4CFB 0%, #12C568 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .badge { display: inline-block; padding: 6px 12px; background: #12C568; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Bem-vindo à Lista VIP!</h1>
              <p style="margin: 10px 0 0;">Bico Brasil</p>
            </div>
            <div class="content">
              <p>Olá, <strong>${safeNome}</strong>!</p>
              <p>Seu cadastro na lista VIP do Bico Brasil foi confirmado com sucesso!</p>
              
              <p>Você será um dos primeiros a saber quando lançarmos a plataforma.</p>
              
              <p><strong>O que acontece agora?</strong></p>
              <ul>
                <li>✅ Você receberá um e-mail de aviso prévio antes do lançamento</li>
                <li>✅ Terá acesso antecipado às funcionalidades</li>
                <li>✅ Poderá testar a plataforma antes de todos</li>
              </ul>

              <p>Seus dados cadastrados:</p>
              <ul>
                <li>📧 <strong>Email:</strong> ${safeEmail}</li>
                <li>📍 <strong>Cidade:</strong> ${safeCidade}</li>
                <li>💼 <strong>Interesse:</strong> <span class="badge">${tipoInteresseFormatado}</span></li>
              </ul>
              
              <p>Obrigado por fazer parte dos primeiros passos do Bico Brasil!</p>
              
              <div class="footer">
                <p>Bico Brasil - Trabalhou, Tá Pago.</p>
                <p>Estamos quase lá. Fique pronto!</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    console.debug("📨 [notify-new-lead] Enviando email de confirmação para usuário");

    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Bico Brasil <onboarding@resend.dev>",
        to: [lead.email],
        subject: `🎉 Você está na lista VIP do Bico Brasil!`,
        html: userEmailHTML,
      }),
    });

    const userEmailData = await userEmailResponse.json();

    console.debug("📨 [notify-new-lead] Resposta do envio para usuário:", {
      status: userEmailResponse.status,
      ok: userEmailResponse.ok
    });

    // Logar resultado do email para usuário
    await supabase.from("email_log").insert([{
      email: lead.email,
      tipo: "user_confirmation",
      status: userEmailResponse.ok ? "sent" : "failed",
      payload: { id: userEmailData.id },
      error: userEmailResponse.ok ? null : JSON.stringify(userEmailData)
    }]);

    if (!userEmailResponse.ok) {
      console.error("❌ [notify-new-lead] Erro ao enviar email para usuário");
    } else {
      console.debug("✅ [notify-new-lead] Email de confirmação enviado para usuário");
    }

    console.debug("🎉 [notify-new-lead] Processo concluído com sucesso!");

    return new Response(
      JSON.stringify({
        success: true,
        logged: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("💥 [notify-new-lead] Erro fatal:", error.message);

    // Logar erro fatal
    await supabase.from("email_log").insert([{
      email: "system",
      tipo: "fatal_error",
      status: "failed",
      error: error.message
    }]);

    return new Response(
      JSON.stringify({ error: "Erro interno ao processar notificação" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
