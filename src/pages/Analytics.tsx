import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, Phone, TrendingUp, Calendar } from 'lucide-react';

interface JobStats {
  id: string;
  title: string;
  views: number;
  contacts: number;
  created_at: string;
}

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<JobStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;

      // Get user's jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, created_at')
        .eq('contractor_id', userData.id);

      if (!jobs) return;

      // Get stats for each job
      const jobStats = await Promise.all(
        jobs.map(async (job) => {
          const { count: viewCount } = await supabase
            .from('job_views')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);

          const { count: contactCount } = await supabase
            .from('job_contacts')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);

          return {
            id: job.id,
            title: job.title,
            views: viewCount || 0,
            contacts: contactCount || 0,
            created_at: job.created_at
          };
        })
      );

      setStats(jobStats);
      setTotalViews(jobStats.reduce((sum, job) => sum + job.views, 0));
      setTotalContacts(jobStats.reduce((sum, job) => sum + job.contacts, 0));
    } catch (error) {
      toast({
        title: "Erro ao carregar analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  const conversionRate = totalViews > 0 ? ((totalContacts / totalViews) * 100).toFixed(1) : '0';

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-muted/30 py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Breadcrumbs />

          <h1 className="text-3xl font-bold mb-6 mt-6">Analytics</h1>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Visualizações
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalViews}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Contatos
                </CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalContacts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Conversão
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{conversionRate}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas por Trabalho</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não publicou nenhum trabalho</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <h3 className="font-semibold mb-2">{job.title}</h3>
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{job.views} visualizações</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{job.contacts} contatos</span>
                        </div>
                        {job.views > 0 && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {((job.contacts / job.views) * 100).toFixed(1)}% conversão
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Publicado em {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
