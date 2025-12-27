/**
 * Validação de credenciais do Mercado Pago
 * Detecta se token é TEST ou PROD e valida status da conta
 */

export interface MercadoPagoValidation {
  ok: boolean;
  mode: "test" | "production" | "unknown";
  reason: string;
  badge: "success" | "warning" | "error";
  icon: string;
}

export async function validateMercadoPagoToken(
  accessToken?: string
): Promise<MercadoPagoValidation> {
  if (!accessToken) {
    return {
      ok: false,
      mode: "unknown",
      reason: "Token do Mercado Pago não configurado. Configure MERCADOPAGO_ACCESS_TOKEN.",
      badge: "error",
      icon: "⚠️",
    };
  }

  const isTest = accessToken.startsWith("TEST-");
  const isProd = accessToken.startsWith("APP_USR-");

  // Token de teste sempre é permitido (sandbox)
  if (isTest) {
    return {
      ok: true,
      mode: "test",
      reason: "Modo TESTE ativo - pagamentos em sandbox (não são reais).",
      badge: "warning",
      icon: "🟡",
    };
  }

  // Se não é nem test nem prod, formato inválido
  if (!isProd) {
    return {
      ok: false,
      mode: "unknown",
      reason: "Token inválido. Use TEST-... (teste) ou APP_USR-... (produção).",
      badge: "error",
      icon: "🔴",
    };
  }

  // Token de produção - verificar se conta está ativa
  try {
    const res = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        mode: "production",
        reason:
          "Credenciais de PRODUÇÃO não ativadas. Complete a verificação da sua conta no Mercado Pago (documento, selfie, comprovante) ou use credenciais de TESTE.",
        badge: "error",
        icon: "🔴",
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        mode: "production",
        reason: `Erro ao validar credenciais: ${res.status} ${res.statusText}`,
        badge: "error",
        icon: "🔴",
      };
    }

    const data = await res.json();

    if (data.error) {
      return {
        ok: false,
        mode: "production",
        reason: data.error.message || "Erro desconhecido na validação.",
        badge: "error",
        icon: "🔴",
      };
    }

    return {
      ok: true,
      mode: "production",
      reason: "Modo PRODUÇÃO ativo - pagamentos reais habilitados.",
      badge: "success",
      icon: "🟢",
    };
  } catch (err) {
    return {
      ok: false,
      mode: "production",
      reason: `Falha na comunicação com Mercado Pago: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      badge: "error",
      icon: "🔴",
    };
  }
}
