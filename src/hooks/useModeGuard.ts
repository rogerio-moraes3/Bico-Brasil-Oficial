import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MODE_ONLY_ROUTES, modeHome, useUserMode } from "@/contexts/UserModeContext";

/**
 * Tira a pessoa de uma tela que so faz sentido no outro modo, mandando pra
 * home do modo atual.
 *
 * Fica na propria tela (e nao so no ModeToggle) de proposito: alem da troca
 * de modo, cobre link direto, botao voltar e sessao retomada noutro
 * dispositivo, em que o modo salvo nao bate com a rota aberta.
 */
export const useModeGuard = () => {
  const { mode } = useUserMode();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const required = MODE_ONLY_ROUTES[location.pathname];
    if (required && required !== mode) {
      navigate(modeHome(mode), { replace: true });
    }
  }, [mode, location.pathname, navigate]);
};
