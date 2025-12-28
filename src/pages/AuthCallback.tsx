import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('[AuthCallback] Processando callback OAuth...');

                // Usar getSession() que processa automaticamente hash e code
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('[AuthCallback] Erro ao obter sessão:', sessionError);
                    setError(sessionError.message);
                    setTimeout(() => navigate('/auth?mode=login'), 2000);
                    return;
                }

                if (session) {
                    console.log('[AuthCallback] Sessão criada com sucesso!', session.user.id);
                    // Limpar hash se existir
                    if (window.location.hash) {
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                    // Usar replace para evitar voltar ao callback
                    navigate('/app', { replace: true });
                } else {
                    console.log('[AuthCallback] Sem sessão, redirecionando para login');
                    navigate('/auth?mode=login');
                }
            } catch (error: any) {
                console.error('[AuthCallback] Erro no callback:', error);
                setError(error.message || 'Erro desconhecido');
                setTimeout(() => navigate('/auth?mode=login'), 2000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">
                    {error ? `Erro: ${error}` : 'Finalizando login...'}
                </p>
            </div>
        </div>
    );
}
