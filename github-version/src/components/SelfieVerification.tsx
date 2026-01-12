import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SelfieVerification({ 
  open, 
  userId,
  onComplete 
}: { 
  open: boolean; 
  userId: string;
  onComplete: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      // Upload para storage
      const fileName = `${userId}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(fileName);

      // Atualizar perfil
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          verification_document: publicUrl,
          verification_status: 'pending'
        })
        .eq('auth_id', userId);

      if (updateError) throw updateError;

      toast({
        title: "✅ Selfie enviada!",
        description: "Sua foto está em análise. Você receberá uma notificação em breve."
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar selfie",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleGalleryUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        handleFileUpload(file);
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md"onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Verificação de Identidade</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para sua segurança e dos demais usuários, precisamos verificar sua identidade.
            Envie uma selfie para continuar usando o app.
          </p>

          {preview && (
            <img src={preview} alt="Preview" className="w-full rounded-lg" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleCameraCapture}
              disabled={loading}
              variant="outline"
              className="h-24 flex-col"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Camera className="h-6 w-6 mb-2" />
                  Tirar Foto
                </>
              )}
            </Button>

            <Button 
              onClick={handleGalleryUpload}
              disabled={loading}
              variant="outline"
              className="h-24 flex-col"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Upload className="h-6 w-6 mb-2" />
                  Galeria
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            ⚠️ Sem verificação, você não poderá acessar as funcionalidades do app
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
