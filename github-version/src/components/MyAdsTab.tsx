import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Briefcase, Wrench, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  neighborhood?: string;
  urgent: boolean;
  city?: { name: string };
  category?: { name: string };
}

interface WorkerService {
  id: string;
  title: string;
  description: string;
  active: boolean;
  created_at: string;
  price?: number;
  category?: { name: string };
}

export function MyAdsTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [workerServices, setWorkerServices] = useState<WorkerService[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'job' | 'service'; id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserAds();
    }
  }, [user]);

  const loadUserAds = async () => {
    if (!user) return;

    try {
      // Buscar o user_id do perfil
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) {
        setLoading(false);
        return;
      }

      // Buscar job_postings do usuário
      const { data: jobs, error: jobsError } = await supabase
        .from('job_postings')
        .select(`
          id, title, description, status, created_at, neighborhood, urgent,
          city:cities(name),
          category:categories(name)
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Erro ao carregar job_postings:', jobsError);
      } else {
        setJobPostings(jobs || []);
      }

      // Buscar worker_services do usuário
      const { data: services, error: servicesError } = await supabase
        .from('worker_services')
        .select(`
          id, title, description, active, created_at, price,
          category:categories(name)
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (servicesError) {
        console.error('Erro ao carregar worker_services:', servicesError);
      } else {
        setWorkerServices(services || []);
      }

    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
      toast({
        title: "Erro ao carregar anúncios",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    setDeleting(true);
    try {
      if (deleteDialog.type === 'job') {
        const { error } = await supabase
          .from('job_postings')
          .update({ status: 'closed' })
          .eq('id', deleteDialog.id);

        if (error) throw error;

        setJobPostings(prev => prev.filter(j => j.id !== deleteDialog.id));
        toast({
          title: "Trabalho excluído",
          description: "Seu anúncio foi removido com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('worker_services')
          .update({ active: false })
          .eq('id', deleteDialog.id);

        if (error) throw error;

        setWorkerServices(prev => prev.filter(s => s.id !== deleteDialog.id));
        toast({
          title: "Serviço excluído",
          description: "Seu serviço foi removido com sucesso."
        });
      }
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
      setDeleteDialog(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Anúncios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasNoAds = jobPostings.length === 0 && workerServices.length === 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Meus Anúncios</CardTitle>
        </CardHeader>
        <CardContent>
          {hasNoAds ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Você ainda não criou nenhum anúncio.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/post-job')} variant="default">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Publicar Trabalho
                </Button>
                <Button onClick={() => navigate('/offer-services')} variant="outline">
                  <Wrench className="h-4 w-4 mr-2" />
                  Oferecer Serviço
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Trabalhos Publicados */}
              {jobPostings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Trabalhos Publicados ({jobPostings.length})
                  </h3>
                  <div className="space-y-3">
                    {jobPostings.map((job) => (
                      <div 
                        key={job.id} 
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-medium truncate">{job.title}</h4>
                              {job.urgent && (
                                <Badge variant="destructive" className="text-xs">Urgente</Badge>
                              )}
                              <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                                {job.status === 'open' ? 'Aberto' : job.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {job.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {job.category?.name && (
                                <span>{job.category.name}</span>
                              )}
                              {job.city?.name && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.city.name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(job.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => navigate(`/edit-job/${job.id}`)}
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setDeleteDialog({ open: true, type: 'job', id: job.id })}
                              title="Excluir"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Serviços Oferecidos */}
              {workerServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-green-600" />
                    Serviços Oferecidos ({workerServices.length})
                  </h3>
                  <div className="space-y-3">
                    {workerServices.map((service) => (
                      <div 
                        key={service.id} 
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-medium truncate">{service.title}</h4>
                              <Badge variant={service.active ? 'default' : 'secondary'} className="text-xs">
                                {service.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {service.category?.name && (
                                <span>{service.category.name}</span>
                              )}
                              {service.price && (
                                <span className="font-medium text-primary">
                                  R$ {service.price.toFixed(2)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(service.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => navigate(`/edit-service/${service.id}`)}
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setDeleteDialog({ open: true, type: 'service', id: service.id })}
                              title="Excluir"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este {deleteDialog?.type === 'job' ? 'trabalho' : 'serviço'}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
