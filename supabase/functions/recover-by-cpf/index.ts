import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoverRequest {
  cpf: string;
  action: 'lookup' | 'send-reset' | 'change-email';
  newEmail?: string;
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
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf[i]) * (10 - i);
  }
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== parseInt(cleanCpf[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf[i]) * (11 - i);
  }
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== parseInt(cleanCpf[10])) return false;
  
  return true;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Muitas tentativas. Aguarde 1 hora antes de tentar novamente." 
        }),
        { 
          status: 429, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const { cpf, action, newEmail }: RecoverRequest = await req.json();
    
    // Validate CPF format
    const cleanCpf = cpf?.replace(/\D/g, '') || '';
    if (!validateCPF(cleanCpf)) {
      console.debug(`Invalid CPF format attempted`);
      return new Response(
        JSON.stringify({ success: false, error: "CPF inválido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate action
    if (!['lookup', 'send-reset', 'change-email'].includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: "Ação inválida" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase with service role (server-side only)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Lookup user by CPF (server-side, no data exposed to client)
    const { data: user, error: lookupError } = await supabase
      .from('users')
      .select('id, email, auth_id')
      .eq('cpf', cleanCpf)
      .maybeSingle();

    // Log attempt for security monitoring
    await supabase.from('audit_log').insert({
      action: `cpf_recovery_${action}`,
      ip_address: clientIP,
      payload: { 
        cpf_last4: cleanCpf.slice(-4),
        found: !!user,
        action 
      }
    });

    if (lookupError) {
      console.error("Database error:", lookupError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro interno. Tente novamente." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // IMPORTANT: Always return same response whether CPF exists or not (prevents enumeration)
    if (action === 'lookup') {
      // Don't reveal if CPF exists or not - just confirm we received the request
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Se este CPF estiver cadastrado, você poderá prosseguir com a recuperação.",
          canProceed: true // Always true to prevent enumeration
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'send-reset') {
      // Send password reset if user exists, but don't reveal if they don't
      if (user?.email) {
        const { error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: user.email,
          options: {
            redirectTo: `${req.headers.get('origin') || supabaseUrl}/auth?mode=reset-password`
          }
        });

        if (resetError) {
          console.error("Reset email error:", resetError);
        } else {
          console.debug(`Recovery email sent for CPF ending in ${cleanCpf.slice(-4)}`);
        }
      }

      // Always return success message (prevents enumeration)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Se este CPF estiver cadastrado, um link de recuperação foi enviado para o email associado." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'change-email') {
      // Validate new email
      if (!newEmail || !validateEmail(newEmail)) {
        return new Response(
          JSON.stringify({ success: false, error: "Email inválido" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if new email is already in use
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', newEmail)
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Este email já está em uso por outra conta." 
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (user?.auth_id) {
        // Update email in auth and profile
        const { error: authError } = await supabase.auth.admin.updateUserById(
          user.auth_id,
          { email: newEmail }
        );

        if (authError) {
          console.error("Auth update error:", authError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Não foi possível atualizar o email. Entre em contato com o suporte." 
            }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Update profile email
        await supabase
          .from('users')
          .update({ email: newEmail })
          .eq('id', user.id);

        // Send recovery email to new address
        await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: newEmail,
          options: {
            redirectTo: `${req.headers.get('origin') || supabaseUrl}/auth?mode=reset-password`
          }
        });

        console.debug(`Email changed and recovery sent for CPF ending in ${cleanCpf.slice(-4)}`);
      }

      // Always return generic success (prevents enumeration)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Se este CPF estiver cadastrado, o email foi atualizado e um link de recuperação foi enviado." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Ação não suportada" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno. Tente novamente." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
