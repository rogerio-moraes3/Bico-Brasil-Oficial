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
    // Set up auth state listener FIRST (prevents missing auth events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('[AuthContext] Iniciando signup para:', email);
      
      // O trigger handle_new_user() no banco de dados criará o perfil automaticamente
      // Passamos os dados via user_metadata para o trigger usar
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: userData.name,
            name: userData.name,
            phone: userData.phone || '',
            city_id: userData.city_id || null,
            neighborhood: userData.neighborhood || '',
            type: userData.type || 'contractor',
            category: userData.category || null,
            subcategory: userData.subcategory || null,
            description: userData.description || null,
            price: userData.price || null,
            cpf: userData.cpf || null,
            avatar_url: userData.profile_photo || null
          }
        }
      });

      if (error) throw error;

      console.log('[AuthContext] Signup realizado com sucesso. Trigger criará o perfil.');
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
