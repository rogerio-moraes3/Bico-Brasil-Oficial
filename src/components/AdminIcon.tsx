import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AdminIcon() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Verificar se usuário tem role de admin na tabela user_roles
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        // Verificar também na tabela colaboradores_autorizados
        const { data: colaboradorData } = await supabase
          .from('colaboradores_autorizados')
          .select('email')
          .ilike('email', user.email || '')
          .maybeSingle();

        setIsAdmin(!!roleData || !!colaboradorData);
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || !isAdmin) return null;

  return (
    <Link
      to="/admin"
      className="fixed right-4 md:bottom-6 bottom-[calc(5rem+env(safe-area-inset-bottom))] bg-primary text-primary-foreground md:p-3 p-2 rounded-xl shadow-lg hover:bg-primary/90 transition-all z-[60]"
      title="Painel Administrativo"
    >
      <BarChart3 size={22} />
    </Link>
  );
}
