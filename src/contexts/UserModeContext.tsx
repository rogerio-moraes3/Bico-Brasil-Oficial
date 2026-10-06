import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

import type { UserMode } from "@/lib/userMode";

const CHAVE_MODO = "userMode";
const CHAVE_ESCOLHEU = "userModeChosen";

// localStorage pode lancar (aba anonima, cookies bloqueados) — nunca deixar
// isso derrubar o app.
const lerModoSalvo = (): UserMode | null => {
  try {
    const v = localStorage.getItem(CHAVE_MODO);
    return v === "contractor" || v === "professional" ? v : null;
  } catch {
    return null;
  }
};

const lerEscolheu = (): boolean => {
  try {
    return localStorage.getItem(CHAVE_ESCOLHEU) === "1";
  } catch {
    return false;
  }
};

const gravarEscolha = (modo: UserMode) => {
  try {
    localStorage.setItem(CHAVE_MODO, modo);
    localStorage.setItem(CHAVE_ESCOLHEU, "1");
  } catch {
    /* sem localStorage a escolha vale so para esta navegacao */
  }
};

interface UserModeContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
  toggleMode: () => void;
  /**
   * false enquanto ainda nao se sabe o modo de verdade — sessao carregando ou
   * last_mode em viagem. Quem pinta a tela com a cor do ambiente deve esperar
   * isso virar true, senao mostra azul e troca pra verde na frente do usuario.
   */
  isModeResolved: boolean;
  /**
   * true so quando a pessoa escolheu o ambiente explicitamente (pelo portao,
   * pelo chip ou pelo perfil). Nao confundir com "mode tem valor": mode SEMPRE
   * tem valor, porque precisa de um default pra renderizar.
   */
  hasChosenMode: boolean;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export const UserModeProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();

  const [mode, setModeState] = useState<UserMode>(() => lerModoSalvo() ?? "contractor");
  const [hasChosenMode, setHasChosenMode] = useState<boolean>(() => lerEscolheu());
  const [isModeResolved, setIsModeResolved] = useState(false);

  // Carrega o modo da conta. NAO grava nada: a escrita acontece so em
  // setMode(). O efeito antigo tinha [mode, user] como dependencia e por isso
  // disparava na montagem, carimbando last_mode='contractor' em quem apenas
  // abriu o app — foi o que deixou 100% da base com o mesmo valor e destruiu
  // o sinal de "ainda nao escolheu".
  useEffect(() => {
    if (authLoading) return; // ainda nao se sabe se ha sessao

    if (!user) {
      // Visitante: o localStorage e a unica fonte, e ja foi lido na inicializacao.
      setIsModeResolved(true);
      return;
    }

    let cancelado = false;

    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("last_mode")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (cancelado) return;

      if (!error && data?.last_mode) {
        const salvo = data.last_mode as UserMode;
        setModeState(salvo);
        setHasChosenMode(true);
        gravarEscolha(salvo);
      }

      setIsModeResolved(true);
    })();

    return () => {
      cancelado = true;
    };
  }, [user, authLoading]);

  // Troca de ambiente. Sem setTimeout: a transicao e do CSS de quem renderiza,
  // nao um atraso artificial de ~450ms no JS.
  const setMode = useCallback(
    (novo: UserMode) => {
      setModeState(novo);
      setHasChosenMode(true);
      gravarEscolha(novo);

      if (user) {
        void supabase
          .from("users")
          .update({ last_mode: novo })
          .eq("auth_id", user.id)
          .then(({ error }) => {
            if (error) console.error("Falha ao salvar o ambiente escolhido:", error);
          });
      }
    },
    [user]
  );

  const toggleMode = useCallback(() => {
    setMode(mode === "contractor" ? "professional" : "contractor");
  }, [mode, setMode]);

  return (
    <UserModeContext.Provider value={{ mode, setMode, toggleMode, isModeResolved, hasChosenMode }}>
      {children}
    </UserModeContext.Provider>
  );
};

export const useUserMode = () => {
  const context = useContext(UserModeContext);
  if (!context) {
    throw new Error("useUserMode must be used within UserModeProvider");
  }
  return context;
};
