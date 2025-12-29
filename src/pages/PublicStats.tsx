import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Users, MapPin, Loader2 } from 'lucide-react';

export default function PublicStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalJobPostings: 0,
    totalCities: 0
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [servicesRes, jobsRes, citiesRes] = await Promise.all([
        supabase.from('worker_services').select('id', { count: 'exact', head: true }),
        supabase.from('job_postings').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('cities').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalServices: servicesRes.count || 0,
        totalJobPostings: jobsRes.count || 0,
        totalCities: citiesRes.count || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs />

          <h1 className="text-3xl md:text-4xl font-bold mb-4">Relação com Usuários</h1>
          <p className="text-muted-foreground mb-8">
            Informações públicas sobre a plataforma Bico Brasil
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Serviços Disponíveis</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalServices}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Profissionais oferecendo serviços
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ofertas de Trabalho</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalJobPostings}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vagas abertas para profissionais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cidades Atendidas</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalCities}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Regiões com cobertura ativa
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Sobre nossa Relação com Usuários</h2>
              <p className="text-muted-foreground mb-4">
                O Bico Brasil atua como uma plataforma de intermediação, conectando contratantes
                e prestadores de serviços para trabalhos manuais. Não intermediamos pagamentos
                nem somos responsáveis pela execução dos serviços.
              </p>
              <p className="text-muted-foreground mb-6">
                Para informações detalhadas ou dados administrativos, investidores podem entrar
                em contato pelo e-mail:
              </p>
              <a
                href="mailto:contato.bicobrasil@gmail.com"
                className="text-primary hover:underline font-medium text-lg"
              >
                contato.bicobrasil@gmail.com
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
