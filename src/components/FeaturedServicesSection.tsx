import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

export const FeaturedServicesSection = () => {
  const { data: featuredWorkers, isLoading } = useQuery({
    queryKey: ['featured-workers-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'worker')
        .eq('plan_active', true)
        .not('profile_photo', 'is', null)
        .order('rating_avg', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured workers:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <section className="py-16 bg-background relative z-10" aria-labelledby="featured-services-title">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2
            id="featured-services-title"
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            Profissionais em Destaque
          </h2>
          <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
            <Link to="/search-workers" className="flex items-center gap-2">
              Ver todos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            [...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mt-3" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
              </Card>
            ))
          ) : featuredWorkers && featuredWorkers.length > 0 ? (
            featuredWorkers.map((worker) => (
              <Card
                key={worker.id}
                className="bg-card-light dark:bg-card border-2 border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={worker.profile_photo || undefined} alt={worker.name || 'Profissional'} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(worker.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {worker.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {worker.category || 'Serviços gerais'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1" aria-label={`Avaliação: ${worker.rating_avg?.toFixed(1) || '0'} de 5 estrelas`}>
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                      <span className="text-sm font-medium text-foreground">
                        {worker.rating_avg?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({worker.rating_count || 0})
                      </span>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/worker/${worker.id}`}>
                        Ver perfil
                      </Link>
                    </Button>
                  </div>

                  {worker.city && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      📍 {worker.neighborhood ? `${worker.neighborhood}, ` : ''}{worker.city}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nenhum profissional cadastrado ainda.</p>
              <Button asChild className="mt-4">
                <Link to="/offer-services">Seja o primeiro!</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
