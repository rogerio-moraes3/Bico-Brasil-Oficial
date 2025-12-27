import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Upload, Image, FileText, X } from 'lucide-react';

interface MediaUploadProps {
  onUpload: (url: string, type: string) => void;
  bucket: 'chat-media' | 'verification-docs' | 'avatars';
}

export function MediaUpload({ onUpload, bucket }: MediaUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${user.id}/${fileName}`;

    // Validate file type
    const allowedTypes = bucket === 'avatars'
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      : bucket === 'chat-media' 
      ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']
      : ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: bucket === 'avatars'
          ? "Apenas imagens são permitidas"
          : bucket === 'chat-media' 
          ? "Apenas imagens e vídeos são permitidos" 
          : "Apenas imagens e PDFs são permitidos",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB for avatars/chat, 10MB for docs)
    const maxSize = (bucket === 'avatars' || bucket === 'chat-media') ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            owner_id: user.id
          }
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl, file.type);
      
      if (file.type.startsWith('image/')) {
        setPreview(publicUrl);
      }

      toast({
        title: "Upload concluído!",
        description: "Arquivo enviado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {preview && (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="max-w-xs rounded-lg" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => setPreview(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div>
        <input
          type="file"
          id="media-upload"
          className="hidden"
          onChange={handleFileSelect}
          accept={bucket === 'avatars' ? 'image/*' : bucket === 'chat-media' ? 'image/*,video/mp4' : 'image/*,application/pdf'}
          disabled={uploading}
        />
        <label htmlFor="media-upload">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            {uploading ? (
              'Enviando...'
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {bucket === 'avatars' ? 'Escolher foto' : bucket === 'chat-media' ? 'Anexar mídia' : 'Enviar documento'}
              </>
            )}
          </Button>
        </label>
      </div>
    </div>
  );
}
