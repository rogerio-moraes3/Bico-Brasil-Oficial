import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
      return;
    }

    if (user && requireAdmin && !checkingAdmin) {
      checkAdminStatus();
    } else if (user && !requireAdmin) {
      setIsAdmin(true);
    }
  }, [user, loading, requireAdmin, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;
    setCheckingAdmin(true);

    try {
      // 1. Primeiro buscar o user_id da tabela public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (userError) {
        console.error('[ProtectedRoute] Erro ao buscar usuário:', userError);
        navigate('/');
        setCheckingAdmin(false);
        return;
      }

      if (!userData) {
        navigate('/');
        setCheckingAdmin(false);
        return;
      }

      // 2. Buscar role com o user_id correto
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error('[ProtectedRoute] Erro ao verificar role:', roleError);
        navigate('/');
        setCheckingAdmin(false);
        return;
      }

      if (!roleData) {
        navigate('/');
      } else {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('[ProtectedRoute] Erro inesperado:', error);
      navigate('/');
    } finally {
      setCheckingAdmin(false);
    }
  };

  if (loading || (requireAdmin && isAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
};
