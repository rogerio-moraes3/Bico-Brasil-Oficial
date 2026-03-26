import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star, ArrowRight, BadgeCheck, MapPin, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

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
    staleTime: 5 * 60 * 1000,
  });

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <section className="py-14 bg-muted/20 relative z-10" aria-labelledby="featured-services-title">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              Trabalhadores
            </p>
            <h2
              id="featured-services-title"
              className="text-2xl md:text-3xl font-bold text-foreground tracking-tight"
            >
              Profissionais em Destaque
            </h2>
          </div>
          <Button variant="ghost" asChild className="text-primary hover:text-primary/80 shrink-0 px-2">
            <Link to="/search-workers" className="flex items-center gap-1.5 text-sm">
              Ver todos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
                <Card key={i} className="bg-card border border-border rounded-2xl shadow-sm">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full mt-4" />
                  <Skeleton className="h-3 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))
          ) : featuredWorkers && featuredWorkers.length > 0 ? (
            featuredWorkers.map((worker) => (
              <Card
                key={worker.id}
                className="bg-card border border-border/80 rounded-2xl hover:border-primary/40 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                        <AvatarImage src={worker.profile_photo || undefined} alt={worker.name || 'Profissional'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                          {getInitials(worker.name)}
                        </AvatarFallback>
                      </Avatar>
                      {worker.verified && (
                        <BadgeCheck
                          className="absolute -bottom-1 -right-1 w-5 h-5 text-primary drop-shadow-sm"
                          aria-label="Perfil verificado"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate text-base leading-tight">
                        {worker.name}
                      </h3>
                      {worker.category && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 font-medium">
                            {worker.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-1"
                      aria-label={`Avaliação: ${worker.rating_avg?.toFixed(1) || '0'} de 5 estrelas`}
                    >
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                      <span className="text-base font-semibold text-foreground">
                        {worker.rating_avg?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({worker.rating_count || 0})
                      </span>
                    </div>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-9 px-3 text-xs font-semibold rounded-xl group-hover:border-primary/50 group-hover:text-primary transition-colors duration-200"
                      >
                      <Link to={`/worker/${worker.id}`}>
                        Ver perfil
                      </Link>
                    </Button>
                  </div>

                  {worker.city && (
                    <p className="mt-2.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                      {worker.neighborhood ? `${worker.neighborhood}, ` : ''}{worker.city}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-primary/50" aria-hidden="true" />
              </div>
              <p className="text-foreground font-semibold mb-1">Nenhum profissional em destaque ainda.</p>
              <p className="text-sm text-muted-foreground mb-5">Seja o primeiro a aparecer aqui!</p>
              <Button asChild>
                <Link to="/offer-services">Cadastrar meu perfil</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
