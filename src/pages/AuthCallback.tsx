import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const finalizeAuth = async () => {
            try {
                console.log('[AuthCallback] Processando callback OAuth...');

                // 🔴 CHAVE: getSessionFromUrl processa o hash e persiste a sessão
                const { data, error } = await supabase.auth.getSessionFromUrl({
                    storeSession: true,
                });

                if (error) {
                    console.error('[AuthCallback] Erro no callback:', error);
                    navigate("/auth?error=oauth");
                    return;
                }

                if (data?.session) {
                    console.log('[AuthCallback] Sessão criada com sucesso!', data.session.user.id);

                    // 🔴 LIMPA O HASH DA URL (mata o loop)
                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );

                    navigate("/app", { replace: true });
                    return;
                }

                console.log('[AuthCallback] Sem sessão, redirecionando para login');
                navigate("/auth?error=no_session");
            } catch (error: any) {
                console.error('[AuthCallback] Erro inesperado:', error);
                navigate("/auth?error=unexpected");
            }
        };

        finalizeAuth();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Finalizando login...</p>
            </div>
        </div>
    );
}
