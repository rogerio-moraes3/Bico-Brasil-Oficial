import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NavigateFunction } from "react-router-dom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Navegação segura para voltar - evita 404 quando não há histórico
 * Se não houver histórico suficiente, redireciona para o fallback
 */
export const safeGoBack = (navigate: NavigateFunction, fallbackPath = '/') => {
  if (window.history.length > 2) {
    navigate(-1);
  } else {
    navigate(fallbackPath);
  }
};

/**
 * Formata um valor em reais no padrão brasileiro (vírgula decimal).
 * `.toFixed(2)` sozinho sempre usa ponto, independente do locale — não usar
 * direto em texto voltado ao usuário.
 */
export const formatBRL = (amount: number) =>
  amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
