import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation
function validateInput(data: unknown): { valid: boolean; error?: string; payload?: ValidatedInput } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }

  const obj = data as Record<string, unknown>;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof obj.email !== 'string' || !emailRegex.test(obj.email) || obj.email.length > 255) {
    return { valid: false, error: "Email inválido" };
  }

  // Validate name
  if (typeof obj.name !== 'string' || obj.name.trim().length < 1 || obj.name.length > 100) {
    return { valid: false, error: "Nome inválido" };
  }

  // Validate missingFields (must be array of strings)
  if (!Array.isArray(obj.missingFields)) {
    return { valid: false, error: "missingFields deve ser um array" };
  }

  const validFields = ['photo', 'category', 'description', 'phone', 'city', 'neighborhood'];
  const sanitizedFields = obj.missingFields
    .filter((f): f is string => typeof f === 'string' && validFields.includes(f))
    .slice(0, 10); // Limit to 10 fields

  return {
    valid: true,
    payload: {
      email: obj.email.trim().toLowerCase().substring(0, 255),
      name: obj.name.trim().substring(0, 100),
      missingFields: sanitizedFields
    }
  };
}

interface ValidatedInput {
  email: string;
  name: string;
  missingFields: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Verify JWT - user must be authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let parsedBody: unknown;
    try {
      parsedBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = validateInput(parsedBody);
    if (!validation.valid || !validation.payload) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, name, missingFields } = validation.payload;

    // Verify user can only send to their own email
    if (user.email?.toLowerCase() !== email.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Can only send to your own email" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize for HTML
    const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeFields = missingFields.map(f => f.replace(/</g, '&lt;').replace(/>/g, '&gt;'));

    const fieldTranslations: Record<string, string> = {
      photo: 'Foto de perfil',
      category: 'Categoria profissional',
      description: 'Descrição',
      phone: 'Telefone',
      city: 'Cidade',
      neighborhood: 'Bairro'
    };

    const translatedFields = safeFields.map(f => fieldTranslations[f] || f);

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
            .cta { display: inline-block; background: #0A4CFB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📋 Complete seu Perfil</h1>
              <p style="margin: 10px 0 0;">Bico Brasil</p>
            </div>
            <div class="content">
              <p>Olá, <strong>${safeName}</strong>!</p>
              <p>Você tem uma oportunidade de bico aguardando — complete seu cadastro!</p>
              
              <p><strong>Faltam os seguintes campos:</strong></p>
              <ul>
                ${translatedFields.map(f => `<li>${f}</li>`).join('')}
              </ul>
              
              <p style="text-align: center;">
                <a href="https://bicobrasil.lovable.app/complete-profile" class="cta">Completar Perfil Agora</a>
              </p>
              
              <div class="footer">
                <p>Bico Brasil - Trabalhou, Tá Pago.</p>
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
        from: "Bico Brasil <onboarding@resend.dev>",
        to: [email],
        subject: "📋 Complete seu perfil no Bico Brasil",
        html: emailHTML,
      }),
    });

    const emailData = await emailResponse.json();

    // Log email attempt
    await supabase.from("email_log").insert([{
      email: email,
      tipo: "profile_completion",
      status: emailResponse.ok ? "sent" : "failed",
      payload: { id: emailData.id },
      error: emailResponse.ok ? null : JSON.stringify(emailData)
    }]);

    if (!emailResponse.ok) {
      console.error('Email send failed:', emailData);
      return new Response(
        JSON.stringify({ error: "Falha ao enviar email" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile completion email sent to:', email);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
