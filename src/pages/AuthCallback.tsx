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
                console.log('[AuthCallback] Processando callback PKCE...');

                // Processar PKCE flow com exchangeCodeForSession
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);

                if (exchangeError) {
                    console.error('[AuthCallback] Erro ao trocar code por sessão:', exchangeError);
                    setError('Erro ao finalizar login');
                    return;
                }

                console.log('[AuthCallback] Sessão PKCE criada com sucesso!');

                // Redirecionar para /app
                window.location.replace('/app');
            } catch (error: any) {
                console.error('[AuthCallback] Erro inesperado:', error);
                setError('Erro inesperado ao processar login');
            }
        };

        handleCallback();
    }, [navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/auth?mode=login')}
                        className="text-blue-600 hover:underline"
                    >
                        Voltar para login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Finalizando login...</p>
            </div>
        </div>
    );
}
