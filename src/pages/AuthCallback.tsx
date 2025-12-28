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
                // Verificar se há hash na URL (#access_token=...)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                if (accessToken && refreshToken) {
                    // Processar tokens do hash e criar sessão
                    console.log('[AuthCallback] Processando tokens do hash...');
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) {
                        console.error('[AuthCallback] Erro ao criar sessão:', error);
                        setError(error.message);
                        setTimeout(() => navigate('/auth?mode=login'), 2000);
                        return;
                    }

                    if (data.session) {
                        console.log('[AuthCallback] Sessão criada com sucesso!', data.session.user.id);
                        // Limpar hash da URL
                        window.history.replaceState(null, '', window.location.pathname);
                        // Aguardar um pouco para garantir que a sessão foi persistida
                        setTimeout(() => navigate('/app'), 500);
                        return;
                    }
                }

                // Se não há hash, tentar obter sessão existente
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('[AuthCallback] Erro ao obter sessão:', sessionError);
                    setError(sessionError.message);
                    setTimeout(() => navigate('/auth?mode=login'), 2000);
                    return;
                }

                if (session) {
                    console.log('[AuthCallback] Sessão existente encontrada');
                    navigate('/app');
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
