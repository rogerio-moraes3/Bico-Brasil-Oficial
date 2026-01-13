import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'payment_generated' | 'payment_approved' | 'payment_failed' |
  'payment_receipt' | 'plan_activated' | 'welcome' |
  'payment_pending' | 'payment_expired' |
  'job_posted' | 'service_created';
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { to, subject, type, data }: EmailRequest = await req.json();

    // SECURITY: Validate that the recipient matches the authenticated user's email
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('email')
      .eq('auth_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (to !== profile.email && to !== user.email) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Can only send emails to your own email address' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.debug(`📧 Enviando email tipo: ${type} para: ${to} (user: ${user.id})`);

    let html = '';

    // Template baseado no tipo
    switch (type) {
      case 'payment_generated':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">QR Code PIX Gerado! 📱</h1>
            <p>Olá ${data.name},</p>
            <p>Seu código PIX foi gerado com sucesso!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Plano:</strong> ${data.planName}</p>
              <p><strong>Valor:</strong> R$ ${data.amount.toFixed(2)}</p>
              <p><strong>Válido por:</strong> 10 minutos</p>
            </div>

            <p>Use o QR Code no aplicativo ou copie o código PIX para concluir o pagamento.</p>
            
            <div style="background: #dbeafe; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <p style="margin: 0;"><strong>💡 Dica:</strong> Após o pagamento, seu plano será ativado automaticamente!</p>
            </div>

            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Se você não solicitou este pagamento, ignore este email.
            </p>
          </div>
        `;
        break;

      case 'payment_approved':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">✅ Pagamento Aprovado!</h1>
            <p>Olá ${data.userName},</p>
            <p>Seu pagamento foi confirmado com sucesso!</p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #16a34a;">
              <h2 style="margin-top: 0; color: #16a34a;">Detalhes do Plano</h2>
              <p><strong>Plano:</strong> ${data.planName}</p>
              <p><strong>Valor:</strong> R$ ${data.amount.toFixed(2)}</p>
              <p><strong>Vigência:</strong> ${data.subscriptionStart} até ${data.subscriptionEnd}</p>
            </div>

            <p>Seu perfil já está ativo e visível para clientes! 🎉</p>
            
            <div style="margin: 30px 0;">
              <a href="${data.profileUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ver Meu Perfil
              </a>
            </div>

            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Obrigado por fazer parte da nossa plataforma!
            </p>
          </div>
        `;
        break;

      case 'payment_failed':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">❌ Pagamento Não Aprovado</h1>
            <p>Olá ${data.userName},</p>
            <p>Infelizmente, não conseguimos confirmar seu pagamento.</p>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dc2626;">
              <p><strong>Motivo:</strong> ${data.reason || 'Não especificado'}</p>
            </div>

            <p>O que fazer agora:</p>
            <ul>
              <li>Verifique se o pagamento foi realizado corretamente</li>
              <li>Tente novamente com outro método</li>
              <li>Entre em contato com nosso suporte</li>
            </ul>

            <div style="margin: 30px 0;">
              <a href="${data.tryAgainUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Tentar Novamente
              </a>
            </div>

            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Precisa de ajuda? Entre em contato com nosso suporte.
            </p>
          </div>
        `;
        break;

      case 'job_posted':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">📋 Trabalho Publicado!</h1>
            <p>Olá ${data.userName},</p>
            <p>Seu trabalho foi publicado com sucesso na plataforma!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">${data.jobTitle}</h2>
              <p>${data.jobDescription}</p>
            </div>

            <p>Profissionais qualificados já podem visualizar e entrar em contato!</p>
            
            <div style="margin: 30px 0;">
              <a href="${data.jobUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ver Meu Trabalho
              </a>
            </div>
          </div>
        `;
        break;

      case 'service_created':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">✨ Serviço Criado!</h1>
            <p>Olá ${data.userName},</p>
            <p>Seu serviço foi adicionado ao seu perfil!</p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">${data.serviceTitle}</h2>
              <p>${data.serviceDescription}</p>
              <p><strong>Preço:</strong> R$ ${data.price}</p>
            </div>

            <p>Agora clientes podem encontrar e contratar este serviço!</p>
          </div>
        `;
        break;

      case 'payment_receipt':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🧾 Recibo de Pagamento</h1>
              <p style="color: #dbeafe; margin: 10px 0 0 0;">Bico Brasil - Trabalho Pesado</p>
            </div>

            <div style="padding: 30px; background: white;">
              <p style="margin: 0 0 20px 0; color: #374151;">Olá <strong>${data.name}</strong>,</p>
              
              <p style="color: #6b7280; margin-bottom: 30px;">
                Este é o recibo do seu pagamento realizado com sucesso na plataforma Bico Brasil.
              </p>

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>📄 Número do Pedido:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">#${data.paymentId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>📅 Data do Pagamento:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.paymentDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>📦 Plano Adquirido:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>💰 Valor Pago:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #16a34a; font-size: 18px;"><strong>R$ ${data.amount.toFixed(2)}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>📌 Status:</strong></td>
                    <td style="padding: 10px 0; text-align: right; color: #16a34a;"><strong>✅ Aprovado</strong></td>
                  </tr>
                </table>
              </div>

              <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin-bottom: 25px;">
                <p style="margin: 0; color: #166534;"><strong>📆 Vigência do Plano:</strong></p>
                <p style="margin: 5px 0 0 0; color: #15803d;">De ${data.subscriptionStart} até ${data.subscriptionEnd}</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${data.profileUrl || 'https://bicobrasil.com.br/profile'}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; 
                          text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Acessar Meu Perfil
                </a>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Bico Brasil | Trabalho Pesado<br>
                Este é um email automático, não responda.
              </p>
            </div>
          </div>
        `;
        break;

      case 'plan_activated':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a; text-align: center;">🎉 Seu Plano Foi Ativado!</h1>
            
            <p>Olá <strong>${data.name}</strong>,</p>
            
            <p>Parabéns! Seu <strong>${data.planName}</strong> já está ativo e pronto para uso!</p>

            <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h2 style="margin-top: 0; color: #166534;">O que você pode fazer agora:</h2>
              <ul style="color: #15803d; line-height: 1.8;">
                <li>✅ Seu perfil está <strong>visível</strong> para todos os clientes</li>
                <li>✅ Você pode visualizar <strong>contatos ilimitados</strong> de ofertas de trabalho</li>
                <li>✅ Receba <strong>notificações prioritárias</strong> de novas vagas</li>
                <li>✅ Destaque o seu perfil nos resultados de busca</li>
              </ul>
            </div>

            <div style="background: #dbeafe; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <p style="margin: 0;"><strong>📆 Vigência:</strong></p>
              <p style="margin: 5px 0 0 0;">De ${data.subscriptionStart} até ${data.subscriptionEnd}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.profileUrl}" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Começar Agora
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Aproveite ao máximo seu plano! Se precisar de ajuda, estamos aqui para você.
            </p>
          </div>
        `;
        break;

      case 'welcome':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb; text-align: center;">👋 Bem-vindo ao Bico Brasil!</h1>
            
            <p>Olá <strong>${data.name}</strong>,</p>
            
            <p>É um prazer tê-lo(a) conosco! Sua conta foi ativada e você já pode aproveitar todos os benefícios.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">🚀 Primeiros Passos:</h3>
              <ol style="color: #374151; line-height: 1.8;">
                <li><strong>Complete seu perfil</strong> com foto e informações profissionais</li>
                <li><strong>Adicione seus serviços</strong> e habilidades</li>
                <li><strong>Comece a buscar trabalhos</strong> na sua cidade</li>
                <li><strong>Receba notificações</strong> de novas vagas</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.profileUrl}" style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Completar Meu Perfil
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              💼 <strong>Dica:</strong> Profissionais com perfil completo e foto recebem 3x mais propostas!
            </p>
          </div>
        `;
        break;

      case 'payment_pending':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b; text-align: center;">⏳ Pagamento Pendente</h1>
            
            <p>Olá <strong>${data.name}</strong>,</p>
            
            <p>Estamos aguardando a confirmação do seu pagamento PIX.</p>

            <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p><strong>📦 Plano:</strong> ${data.planName}</p>
              <p><strong>💰 Valor:</strong> R$ ${data.amount.toFixed(2)}</p>
              <p><strong>⏰ Expira em:</strong> ${data.expiresIn}</p>
            </div>

            <p>Assim que recebermos a confirmação do pagamento, seu plano será ativado automaticamente.</p>

            <div style="background: #dbeafe; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <p style="margin: 0;"><strong>💡 Dica:</strong> Pagamentos PIX geralmente são confirmados em poucos minutos.</p>
            </div>
          </div>
        `;
        break;

      case 'payment_expired':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626; text-align: center;">⏰ Pagamento Expirado</h1>
            
            <p>Olá <strong>${data.name}</strong>,</p>
            
            <p>Infelizmente, o prazo para pagamento do QR Code PIX expirou.</p>

            <div style="background: #fee2e2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p><strong>📦 Plano:</strong> ${data.planName}</p>
              <p><strong>💰 Valor:</strong> R$ ${data.amount.toFixed(2)}</p>
              <p><strong>⏰ Expirado em:</strong> ${data.expiredAt}</p>
            </div>

            <p>Não se preocupe! Você pode gerar um novo QR Code e tentar novamente.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.tryAgainUrl}" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Tentar Novamente
              </a>
            </div>
          </div>
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid email type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Enviar email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bico Brasil <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('❌ Erro ao enviar email via Resend:', errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const result = await resendResponse.json();
    console.debug('✅ Email enviado com sucesso:', result);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("❌ Erro na função send-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
