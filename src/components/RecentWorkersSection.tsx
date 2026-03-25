import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

export const RecentWorkersSection = () => {
  const { data: recentWorkers, isLoading } = useQuery({
    queryKey: ["recent-workers-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, profile_photo, category, city, verified")
        .eq("type", "worker")
        .not("profile_photo", "is", null)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching recent workers:", error);
        throw error;
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Don't render if no data after loading
  if (!isLoading && (!recentWorkers || recentWorkers.length === 0)) return null;

  return (
    <section className="py-16 bg-background relative z-10" aria-labelledby="recent-workers-title">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              Novidades
            </p>
            <h2
              id="recent-workers-title"
              className="text-2xl md:text-3xl font-bold text-foreground tracking-tight"
            >
              Novos no Bico Brasil
            </h2>
          </div>
          <Button variant="ghost" asChild className="text-primary hover:text-primary/80 shrink-0">
            <Link to="/search-workers" className="flex items-center gap-1.5 text-sm">
              Ver todos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Horizontal scroll strip */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-40 snap-start rounded-2xl border border-border bg-card p-4 flex flex-col items-center gap-2"
                >
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            : recentWorkers!.map((worker, i) => (
                <Link
                  key={worker.id}
                  to={`/worker/${worker.id}`}
                  className="group shrink-0 w-40 snap-start rounded-2xl border border-border bg-card p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:shadow-[0_4px_20px_-4px_hsl(var(--xp-primary)/0.15)] hover:-translate-y-0.5 transition-all duration-200 stagger-fade"
                  style={{ ["--stagger-delay" as string]: `${i * 40}ms` }}
                  aria-label={`Ver perfil de ${worker.name}`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={worker.profile_photo || undefined}
                        alt={worker.name || "Profissional"}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {getInitials(worker.name)}
                      </AvatarFallback>
                    </Avatar>
                    {worker.verified && (
                      <BadgeCheck
                        className="absolute -bottom-1 -right-1 w-4 h-4 text-primary drop-shadow-sm"
                        aria-label="Verificado"
                      />
                    )}
                  </div>

                  <p className="text-xs font-semibold text-foreground text-center truncate w-full">
                    {worker.name}
                  </p>

                  {worker.category && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0 h-4 font-medium max-w-full truncate"
                    >
                      {worker.category}
                    </Badge>
                  )}

                  {worker.city && (
                    <p className="text-[10px] text-muted-foreground text-center truncate w-full">
                      {worker.city}
                    </p>
                  )}
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};
