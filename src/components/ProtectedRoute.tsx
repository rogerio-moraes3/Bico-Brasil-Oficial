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
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!data) {
      navigate('/');
    } else {
      setIsAdmin(true);
    }
    setCheckingAdmin(false);
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
