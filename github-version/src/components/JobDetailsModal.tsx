import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MapPin, Calendar, MessageCircle, Phone, Lock, Crown, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { WhatsAppContactButton } from "@/components/WhatsAppContactButton";
import { useAccessControl } from "@/hooks/useAccessControl";

interface JobDetailsModalProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canViewContacts: boolean;
  isOwner?: boolean;
}

export const JobDetailsModal = ({ job, open, onOpenChange, canViewContacts, isOwner = false }: JobDetailsModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { remainingFreeViews } = useAccessControl();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  console.log('📞 JobDetailsModal recebeu:', {
    jobId: job?.id,
    jobTitle: job?.title,
    user: job?.user,
    phone: job?.user?.phone
  });

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

  const handleWhatsApp = () => {
    if (job.user?.phone) {
      const phone = job.user.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
  };

  const handleCall = () => {
    if (job.user?.phone) {
      window.location.href = `tel:${job.user.phone}`;
    }
  };

  const handleEdit = () => {
    onOpenChange(false);
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

      onOpenChange(false);
      window.location.reload();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {job.title}
              {job.urgent && <Badge variant="destructive">Urgente</Badge>}
            </DialogTitle>
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
        </DialogHeader>
        
        {/* Informações do contratante */}
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={job.user?.profile_photo} />
            <AvatarFallback>{job.user?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">
              {canViewContacts ? job.user?.name : "Contratante"}
            </div>
            <div className="text-sm text-muted-foreground">
              {job.city?.name}, {job.city?.state}
            </div>
          </div>
        </div>
        
        {/* Detalhes do trabalho */}
        <div className="space-y-4">
          <div>
            <Label>Descrição Completa</Label>
            <p className="text-sm mt-1 whitespace-pre-wrap">{job.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {job.category?.name && (
              <div>
                <Label>Categoria</Label>
                <p className="text-sm mt-1">{job.category.name}</p>
              </div>
            )}
          </div>
          
          <div>
            <Label>Local</Label>
            <p className="text-sm mt-1 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.city?.name} - {job.neighborhood}
            </p>
          </div>
          
          {job.date_time && (
            <div>
              <Label>Data para Iniciar</Label>
              <p className="text-sm mt-1 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(job.date_time)}
              </p>
            </div>
          )}
        </div>
        
        {/* Contato - FREEMIUM HABILITADO */}
        <div className="border-t pt-4">
          <Label>Contato</Label>
          {job.user?.phone ? (
            <div className="mt-2">
              <WhatsAppContactButton
                phone={job.user.phone}
                workerName={job.user?.name || 'Contratante'}
                canViewContact={canViewContacts}
                remainingViews={remainingFreeViews}
                onUpgradeClick={() => navigate('/premium')}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Telefone não disponível
            </p>
          )}
        </div>
      </DialogContent>

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
    </Dialog>
  );
};
