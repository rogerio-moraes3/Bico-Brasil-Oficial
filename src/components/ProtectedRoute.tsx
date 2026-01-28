import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ADMIN_EMAILS = ['23rogeriomoraes@gmail.com', 'nando_petro@hotmail.com'];

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // No user -> redirect to login
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }

    // Admin bypass: never redirect admin users
    const email = (user.email || '').toLowerCase();
    const isAdminUser = ADMIN_EMAILS.includes(email);

    if (isAdminUser) {
      setIsAdmin(true);
      setProfileChecked(true);
      return;
    }

    // If this route explicitly requires admin
    if (requireAdmin) {
      if (!isAdminUser) {
        // Block access immediately
        alert('Acesso Negado');
        navigate('/', { replace: true });
        return;
      }
      setIsAdmin(true);
      return;
    }

    // For non-admin routes, just mark as checked
    if (!requireAdmin) {
      setIsAdmin(true);
      setProfileChecked(true);
    }
  }, [user, loading, requireAdmin, navigate]);

  // Show loading spinner while checking
  if (loading || !profileChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // No user after loading -> don't render
  if (!user) {
    return null;
  }

  // Require admin but not admin -> don't render
  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <div className="internal-theme min-h-screen">{children}</div>;
};
