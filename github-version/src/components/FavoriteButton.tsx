import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  workerId: string;
}

export function FavoriteButton({ workerId }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, [user, workerId]);

  const checkFavorite = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('worker_id', workerId)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar profissionais",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remove favorite
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('worker_id', workerId);

        setIsFavorite(false);
        toast({
          title: "Removido dos favoritos"
        });
      } else {
        // Add favorite
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, worker_id: workerId });

        setIsFavorite(true);
        toast({
          title: "Adicionado aos favoritos!"
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar favoritos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={loading}
      className="hover:bg-transparent"
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        }`}
      />
    </Button>
  );
}
