import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Obter sessão após callback do OAuth
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Erro ao obter sessão:', error);
                    navigate('/auth?mode=login');
                    return;
                }

                if (session) {
                    // Usuário autenticado com sucesso
                    console.log('Login com Google bem-sucedido!');
                    navigate('/app');
                } else {
                    // Sem sessão, redirecionar para login
                    navigate('/auth?mode=login');
                }
            } catch (error) {
                console.error('Erro no callback:', error);
                navigate('/auth?mode=login');
            }
        };

        handleCallback();
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
