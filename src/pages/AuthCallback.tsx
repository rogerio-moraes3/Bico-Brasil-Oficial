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

                // PASSO 1: Processar PKCE flow
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
                    window.location.href
                );

                if (exchangeError) {
                    console.error('[AuthCallback] Erro ao trocar code:', exchangeError);
                    setError('Erro ao finalizar login');
                    return;
                }

                // PASSO 2: Obter sessão
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setError('Sessão não encontrada');
                    return;
                }

                console.log('[AuthCallback] Sessão criada, sincronizando usuário...');

                // PASSO 3: Chamar Edge Function para sincronizar usuário
                try {
                    const syncResponse = await fetch(
                        'https://pyelmqmhraczgptagvve.supabase.co/functions/v1/sync_user_profile',
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                access_token: session.access_token
                            })
                        }
                    );

                    console.log('[AuthCallback] Resposta da Edge Function:', syncResponse.status);

                    if (!syncResponse.ok) {
                        const syncError = await syncResponse.json().catch(() => ({ error: 'Erro desconhecido' }));
                        console.error('[AuthCallback] Erro ao sincronizar usuário:', syncError);
                        // NÃO bloquear o login se a Edge Function falhar
                        console.warn('[AuthCallback] Continuando login mesmo com erro na sincronização');
                    } else {
                        const syncResult = await syncResponse.json();
                        console.log('[AuthCallback] Usuário sincronizado com sucesso:', syncResult);
                    }
                } catch (syncError) {
                    console.error('[AuthCallback] Erro ao chamar Edge Function:', syncError);
                    // NÃO bloquear o login se a Edge Function falhar
                    console.warn('[AuthCallback] Continuando login mesmo com erro na Edge Function');
                }

                // PASSO 4: Redirecionar para /app
                console.log('[AuthCallback] Redirecionando para /app...');
                window.location.replace('/app');
            } catch (error: any) {
                console.error('[AuthCallback] Erro inesperado:', error);
                setError('Erro inesperado');
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
