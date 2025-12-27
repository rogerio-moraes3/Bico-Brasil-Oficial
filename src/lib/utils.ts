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
