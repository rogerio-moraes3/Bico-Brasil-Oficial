import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ShareButtons } from '@/components/ShareButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Briefcase, Users, Eye, MessageCircle, Star, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopJob {
  id: string;
  title: string;
  description: string;
  contractor_name: string;
  contractor_photo?: string;
  views_count: number;
  contacts_count: number;
  popularity_score: number;
  urgent: boolean;
  created_at: string;
}

interface TopWorker {
  id: string;
  name: string;
  profile_photo?: string;
  category?: string;
  subcategory?: string;
  rating_avg: number;
  rating_count: number;
  jobs_done: number;
  completed_jobs: number;
  verified: boolean;
  destaque_expires_at?: string;
}

interface TopContractor {
  id: string;
  name: string;
  profile_photo?: string;
  total_job_postings: number;
  total_jobs: number;
  completed_jobs: number;
  activity_score: number;
  last_usage_at: string;
}

export default function Ranking() {
  const navigate = useNavigate();
  const [topJobs, setTopJobs] = useState<TopJob[]>([]);
  const [topWorkers, setTopWorkers] = useState<TopWorker[]>([]);
  const [topContractors, setTopContractors] = useState<TopContractor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTopJobs = async () => {
    const { data, error } = await supabase
      .from('ranking_top_jobs')
      .select('*')
      .limit(20);

    if (!error && data) {
      setTopJobs(data);
    }
  };

  const loadTopWorkers = async () => {
    const { data, error } = await supabase
      .from('ranking_top_workers')
      .select('*')
      .limit(20);

    if (!error && data) {
      setTopWorkers(data);
    }
  };

  const loadTopContractors = async () => {
    const { data, error } = await supabase
      .from('ranking_top_contractors')
      .select('*')
      .limit(20);

    if (!error && data) {
      setTopContractors(data);
    }
  };

  useEffect(() => {
    Promise.all([
      loadTopJobs(),
      loadTopWorkers(),
      loadTopContractors()
    ]).finally(() => setLoading(false));

    const jobsChannel = supabase
      .channel('ranking-jobs-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_postings'
      }, () => loadTopJobs())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_views'
      }, () => loadTopJobs())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_contacts'
      }, () => loadTopJobs())
      .subscribe();

    const workersChannel = supabase
      .channel('ranking-workers-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jobs'
      }, () => loadTopWorkers())
      .subscribe();

    const contractorsChannel = supabase
      .channel('ranking-contractors-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_postings'
      }, () => loadTopContractors())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jobs'
      }, () => loadTopContractors())
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(workersChannel);
      supabase.removeChannel(contractorsChannel);
    };
  }, []);

  const getMedalColor = (index: number) => {
    if (index === 0) return 'bg-yellow-500 text-white';
    if (index === 1) return 'bg-gray-400 text-white';
    if (index === 2) return 'bg-amber-700 text-white';
    return 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando rankings...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-8 animate-fade-in max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Rankings em Tempo Real</h1>
          </div>
          <p className="text-muted-foreground mb-4">
            Veja quem está fazendo a diferença na plataforma
          </p>
          <ShareButtons
            text="Confira os melhores profissionais e contratantes do Bico Brasil!"
            url="https://bicobrasil.com.br/ranking"
            className="justify-center"
          />
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 rounded-2xl border border-border bg-card shadow-sm">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Oportunidades</span>
              <span className="sm:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Prestadores</span>
              <span className="sm:hidden">Top</span>
            </TabsTrigger>
            <TabsTrigger value="contractors" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Contratantes</span>
              <span className="sm:hidden">Ativos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-5">
            {topJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma oportunidade encontrada</p>
              </div>
            ) : (
                topJobs.map((job, index) => (
                  <Card key={job.id} className="hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer animate-fade-in rounded-2xl border border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${getMedalColor(index)}`}>
                        {index + 1}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-grow">
                            <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {job.description}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={job.contractor_photo} />
                                <AvatarFallback>{job.contractor_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{job.contractor_name}</span>
                            </div>
                          </div>
                          {job.urgent && (
                            <Badge variant="destructive">Urgente</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {job.views_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {job.contacts_count}
                          </div>
                          <div className="flex items-center gap-1 text-primary font-semibold">
                            <TrendingUp className="h-4 w-4" />
                            {job.popularity_score} pts
                          </div>
                        </div>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="workers" className="space-y-5">
            {topWorkers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum prestador encontrado</p>
              </div>
            ) : (
              topWorkers.map((worker, index) => (
                <Card
                  key={worker.id}
                  className="hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer animate-fade-in rounded-2xl border border-border"
                  onClick={() => navigate(`/worker/${worker.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${getMedalColor(index)}`}>
                        {index + 1}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={worker.profile_photo} />
                              <AvatarFallback>{worker.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{worker.name}</h3>
                                {worker.verified && (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {worker.category} {worker.subcategory && `• ${worker.subcategory}`}
                              </p>
                            </div>
                          </div>
                          {worker.destaque_expires_at && new Date(worker.destaque_expires_at) > new Date() && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600">Destaque</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-primary">
                              {worker.completed_jobs}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Concluídos
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                              <span className="text-2xl font-bold">
                                {worker.rating_avg && typeof worker.rating_avg === 'number' && !isNaN(worker.rating_avg) ? worker.rating_avg.toFixed(1) : '0.0'}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ({worker.rating_count})
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {worker.jobs_done}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Jobs
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="contractors" className="space-y-5">
            {topContractors.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum contratante encontrado</p>
              </div>
            ) : (
              topContractors.map((contractor, index) => (
                <Card key={contractor.id} className="hover:shadow-lg transition-all hover:scale-[1.01] animate-fade-in rounded-2xl border border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${getMedalColor(index)}`}>
                        {index + 1}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={contractor.profile_photo} />
                            <AvatarFallback>{contractor.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{contractor.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Ativo recentemente
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {contractor.total_job_postings}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Vagas
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {contractor.completed_jobs}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Concluídas
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {contractor.activity_score}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Pts
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
