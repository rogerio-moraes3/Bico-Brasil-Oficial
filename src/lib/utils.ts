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

/**
 * Extrai um numero de um texto de preco digitado livremente (ex: "R$ 150 por
 * diaria", "R$ 1.200,50", "40"). `parseFloat` sozinho retorna NaN pra
 * qualquer string que nao comece com um digito — e os proprios placeholders
 * dos campos de preco no app ("Ex: R$ 150 por diaria") convidam o usuario a
 * digitar exatamente esse formato, o que fazia o preco ser salvo como null
 * silenciosamente. Retorna null se nenhum numero puder ser extraido.
 */
export const parsePriceInput = (raw: string): number | null => {
  if (!raw) return null;
  const match = raw.match(/[\d.,]+/);
  if (!match) return null;
  let numStr = match[0];
  if (numStr.includes(',') && numStr.includes('.')) {
    numStr = numStr.replace(/\./g, '').replace(',', '.');
  } else if (numStr.includes(',')) {
    numStr = numStr.replace(',', '.');
  }
  const value = parseFloat(numStr);
  return Number.isFinite(value) ? value : null;
};
