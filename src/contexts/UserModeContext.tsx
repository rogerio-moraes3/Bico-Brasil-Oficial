import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type UserMode = "contractor" | "professional";

interface UserModeContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
  toggleMode: () => void;
  isTransitioning: boolean;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export const UserModeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Inicializar com valor do localStorage ou padrão 'contractor'
  const [mode, setModeState] = useState<UserMode>(() => {
    const savedMode = localStorage.getItem('userMode');
    return (savedMode === 'contractor' || savedMode === 'professional')
      ? savedMode
      : 'contractor';
  });

  // Carregar modo do Supabase quando usuário logar
  useEffect(() => {
    const loadModeFromSupabase = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('last_mode')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (!error && data?.last_mode) {
        setModeState(data.last_mode as UserMode);
        localStorage.setItem('userMode', data.last_mode);
      }
    };

    loadModeFromSupabase();
  }, [user]);

  // Salvar no localStorage e Supabase sempre que mudar
  useEffect(() => {
    localStorage.setItem('userMode', mode);

    // Salvar no Supabase se usuário estiver logado
    const saveModeToSupabase = async () => {
      if (!user) return;

      await supabase
        .from('users')
        .update({ last_mode: mode })
        .eq('auth_id', user.id);
    };

    saveModeToSupabase();
  }, [mode, user]);

  const setMode = (newMode: UserMode) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setModeState(newMode);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 150);
  };

  const toggleMode = () => {
    const newMode = mode === 'contractor' ? 'professional' : 'contractor';
    setMode(newMode);
  };

  return (
    <UserModeContext.Provider value={{ mode, setMode, toggleMode, isTransitioning }}>
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
