import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProfileGuardProps {
    children: React.ReactNode;
}

/**
 * ProfileGuard - Gatekeeper Component (GetNinjas Style)
 * Blocks access if user profile is incomplete (is_profile_complete === false)
 * Forces user to complete profile before accessing protected features
 */
export const ProfileGuard = ({ children }: ProfileGuardProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkProfileStatus();
    }, [user]);

    const checkProfileStatus = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_profile_complete')
                .eq('auth_id', user.id)
                .single();

            if (error) {
                console.error('Error checking profile status:', error);
                // Se houver erro, assumir que perfil está incompleto por segurança
                setIsProfileComplete(false);
            } else {
                setIsProfileComplete(data?.is_profile_complete ?? false);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setIsProfileComplete(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProfile = () => {
        navigate('/complete-profile');
    };

    // Se não há usuário logado, permitir acesso (guard não se aplica)
    if (!user) {
        return <>{children}</>;
    }

    // Enquanto carrega, não mostrar nada (evitar flash)
    if (loading) {
        return null;
    }

    // Se perfil está completo, permitir acesso
    if (isProfileComplete) {
        return <>{children}</>;
    }

    // Perfil incompleto: mostrar modal bloqueador (não pode fechar)
    return (
        <>
            {/* Modal Bloqueador - Estilo GetNinjas */}
            <Dialog open={true} onOpenChange={() => { }}>
                <DialogContent
                    className="sm:max-w-md"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-full">
                                <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">
                            Complete seu Perfil
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Para continuar usando o Bico Brasil, você precisa completar seu perfil com algumas informações essenciais.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 my-4">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">Adicione suas habilidades e experiências</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">Defina sua disponibilidade</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">Aumente suas chances de conseguir trabalhos</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleCompleteProfile}
                            className="w-full"
                            size="lg"
                        >
                            Completar Perfil Agora
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Leva apenas 2 minutos
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Renderizar children com overlay blur (visual feedback) */}
            <div className="filter blur-sm pointer-events-none select-none" aria-hidden="true">
                {children}
            </div>
        </>
    );
};
