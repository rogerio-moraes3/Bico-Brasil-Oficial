import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAccessControl } from '@/hooks/useAccessControl';
import { WhatsAppContactButton } from '@/components/WhatsAppContactButton';
import { UpgradeModal } from '@/components/UpgradeModal';
import { MapPin, Calendar, Edit, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { canViewContacts, remainingFreeViews } = useAccessControl();

  useEffect(() => {
    loadJob();
  }, [id, user]);

  const loadJob = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          city:cities(name, state),
          category:categories(name),
          user:users(id, name, phone, profile_photo)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);

      // Check if user is owner
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        setIsOwner(userData?.id === data.user_id);
      }
    } catch (error) {
      console.error('Erro ao carregar trabalho:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os detalhes do trabalho.",
        variant: "destructive"
      });
      navigate('/procurar-bicos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/edit-job/${job.id}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('job_postings')
        .update({ status: 'cancelled' })
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: "Anúncio excluído",
        description: "Seu anúncio foi removido com sucesso."
      });

      navigate('/procurar-bicos');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleWhatsApp = () => {
    if (job?.user?.phone) {
      const phone = job.user.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Não especificada';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header />
      
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  {job.title}
                  {job.urgent && <Badge variant="destructive">Urgente</Badge>}
                </CardTitle>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contratante */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={job.user?.profile_photo} />
                <AvatarFallback>{job.user?.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{job.user?.name || "Contratante"}</div>
                <div className="text-sm text-muted-foreground">
                  {job.city?.name}, {job.city?.state}
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-sm whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Categoria */}
            {job.category?.name && (
              <div>
                <h3 className="font-semibold mb-2">Categoria</h3>
                <p className="text-sm">{job.category.name}</p>
              </div>
            )}

            {job.custom_category && (
              <div>
                <h3 className="font-semibold mb-2">Categoria Personalizada</h3>
                <p className="text-sm">{job.custom_category}</p>
              </div>
            )}

            {/* Local */}
            <div>
              <h3 className="font-semibold mb-2">Local</h3>
              <p className="text-sm flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.city?.name} - {job.neighborhood || 'Bairro não especificado'}
              </p>
            </div>

            {/* Data */}
            {job.date_time && (
              <div>
                <h3 className="font-semibold mb-2">Data para Iniciar</h3>
                <p className="text-sm flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(job.date_time)}
                </p>
              </div>
            )}

            {/* Contato via WhatsApp */}
            {job.user?.phone && !isOwner && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Contato</h3>
                <WhatsAppContactButton
                  phone={job.user.phone}
                  workerName={job.user.name || 'Contratante'}
                  canViewContact={canViewContacts}
                  remainingViews={remainingFreeViews}
                  onUpgradeClick={() => setShowUpgradeModal(true)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        remainingViews={remainingFreeViews}
      />
    </div>
  );
}
