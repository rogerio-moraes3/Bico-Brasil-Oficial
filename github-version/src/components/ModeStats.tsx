import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserMode } from "@/contexts/UserModeContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, Briefcase, DollarSign, FileText } from "lucide-react";

export const ModeStats = () => {
    const { user } = useAuth();
    const { mode } = useUserMode();
    const [stats, setStats] = useState({
        jobsPublished: 0,
        earnings: 0,
        proposals: 0,
        completedJobs: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;

            if (mode === 'contractor') {
                // Estatísticas para Contratante
                const { data: jobs } = await supabase
                    .from('job_postings')
                    .select('id')
                    .eq('user_id', user.id);

                setStats(prev => ({
                    ...prev,
                    jobsPublished: jobs?.length || 0
                }));
            } else {
                // Estatísticas para Trabalhador
                const { data: userData } = await supabase
                    .from('users')
                    .select('jobs_done')
                    .eq('auth_id', user.id)
                    .maybeSingle();

                // Contar propostas (jobs aplicados)
                const { data: proposals } = await supabase
                    .from('job_applications')
                    .select('id')
                    .eq('worker_id', user.id);

                setStats(prev => ({
                    ...prev,
                    completedJobs: userData?.jobs_done || 0,
                    proposals: proposals?.length || 0
                }));
            }
        };

        loadStats();
    }, [user, mode]);

    if (mode === 'contractor') {
        return (
            <div className="grid grid-cols-2 gap-4 px-4 py-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Bicos Publicados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.jobsPublished}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Ativos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.jobsPublished}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Modo Trabalhador
    return (
        <div className="grid grid-cols-2 gap-4 px-4 py-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Bicos Feitos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {stats.completedJobs}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Propostas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {stats.proposals}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
