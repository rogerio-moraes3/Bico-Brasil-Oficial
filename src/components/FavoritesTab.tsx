import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Star, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

interface Worker {
  id: string;
  name: string;
  category: string;
  rating_avg: number;
  rating_count: number;
  price: string;
  neighborhood: string;
}

export function FavoritesTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    const { data: favData } = await supabase
      .from('favorites')
      .select(`
        worker_id,
        users!favorites_worker_id_fkey (
          id,
          name,
          category,
          rating_avg,
          rating_count,
          price,
          neighborhood
        )
      `)
      .eq('user_id', user.id);

    if (favData) {
      const workers = favData.map(fav => fav.users).filter(Boolean) as Worker[];
      setFavorites(workers);
    }
    setLoading(false);
  };

  const removeFavorite = async (workerId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('worker_id', workerId);

    if (error) {
      toast({
        title: "Erro ao remover favorito",
        variant: "destructive"
      });
    } else {
      setFavorites(prev => prev.filter(w => w.id !== workerId));
      toast({
        title: "Removido dos favoritos"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Você ainda não tem profissionais favoritos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {favorites.map((worker) => {
        const initials = worker.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
        
        return (
          <Card 
            key={worker.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('button')) {
                window.location.href = `/worker/${worker.id}`;
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{worker.name}</h3>
                      <p className="text-sm text-muted-foreground">{worker.category}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFavorite(worker.id)}
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {worker.rating_avg > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {worker.rating_avg.toFixed(1)} ({worker.rating_count})
                      </Badge>
                    )}
                    {worker.price && (
                      <Badge variant="secondary">{worker.price}</Badge>
                    )}
                    {worker.neighborhood && (
                      <Badge variant="outline">{worker.neighborhood}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
