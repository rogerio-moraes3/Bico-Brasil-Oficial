import { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // PRIMEIRO: obter sessão existente
      const { data: { session }, error } = await supabase.auth.getSession();

      if (mounted) {
        if (error) console.error('[AuthContext] Erro ao obter sessão:', error);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('[AuthContext] Sessão inicial:', session?.user?.id || 'nenhuma');
      }
    };

    init();

    // DEPOIS: configurar listener para mudanças futuras
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      // Atualizar foto do Google se o perfil já existe mas não tem foto
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          try {
            const { data: existingProfile } = await supabase
              .from('users')
              .select('id, profile_photo')
              .eq('auth_id', session.user.id)
              .maybeSingle();

            // Apenas atualizar foto do Google se perfil existe mas não tem foto
            if (existingProfile && !existingProfile.profile_photo) {
              const googleAvatar = session.user.user_metadata?.picture || session.user.user_metadata?.avatar_url;
              if (googleAvatar) {
                await supabase
                  .from('users')
                  .update({ profile_photo: googleAvatar })
                  .eq('auth_id', session.user.id);
                console.log('[AuthContext] Foto do Google atualizada');
              }
            }
          } catch (error) {
            console.error('[AuthContext] Erro ao atualizar foto:', error);
          }
        }, 500);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('[AuthContext] Iniciando signup para:', email);

      // Enviar dados do usuário via options.data
      // Dados já vêm sanitizados do Auth.tsx
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userData.name,
            cpf: userData.cpf,
            phone: userData.phone,
            city_id: userData.city_id
          }
        }
      });

      if (error) throw error;

      console.log('[AuthContext] Signup realizado com sucesso');
      return { error: null };
    } catch (error: any) {
      console.error('[AuthContext] SignUp error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Limpar estado local PRIMEIRO para evitar tela preta
      setUser(null);
      setSession(null);
      // Depois limpar no Supabase
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
