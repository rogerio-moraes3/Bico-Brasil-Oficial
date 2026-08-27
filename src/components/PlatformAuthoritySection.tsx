import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { MapPin, Users, Briefcase, ArrowRight, Globe, Loader2 } from "lucide-react";

type PillarKey = "cities" | "workers" | "services";

const MODAL_TITLES: Record<PillarKey, string> = {
  cities: "Cidades atendidas",
  workers: "Categorias de profissionais",
  services: "Serviços publicados recentemente",
};

const formatCount = (n: number) => {
  if (n === 0) return "—";
  if (n >= 1000) return `+${(Math.floor(n / 100) * 100).toLocaleString("pt-BR")}`;
  return `+${n}`;
};

export const PlatformAuthoritySection = () => {
  const { data: stats } = useQuery({
    queryKey: ["authority-stats"],
    queryFn: async () => {
      const [workersRes, servicesRes, citiesRes] = await Promise.all([
        supabase
          .from("users_public")
          .select("id", { count: "exact", head: true })
          .eq("type", "worker"),
        supabase
          .from("worker_services")
          .select("id", { count: "exact", head: true })
          .eq("active", true),
        supabase
          .from("cities")
          .select("id", { count: "exact", head: true })
          .eq("active", true),
      ]);
      return {
        workers: workersRes.count ?? 0,
        services: servicesRes.count ?? 0,
        cities: citiesRes.count ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const [activeModal, setActiveModal] = useState<PillarKey | null>(null);

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["authority-list", activeModal],
    queryFn: async (): Promise<string[]> => {
      if (activeModal === "cities") {
        const { data } = await supabase.from("cities").select("name, state").eq("active", true).order("name");
        return (data ?? []).map((c) => `${c.name} - ${c.state}`);
      }
      if (activeModal === "workers") {
        const { data } = await supabase.from("categories").select("name").order("name");
        return (data ?? []).map((c) => c.name);
      }
      if (activeModal === "services") {
        const { data } = await supabase
          .from("worker_services")
          .select("title, category:categories(name)")
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(200);
        return (data ?? []).map((s: any) => (s.category?.name ? `${s.title} — ${s.category.name}` : s.title));
      }
      return [];
    },
    enabled: activeModal !== null,
  });

  const pillars: { key: PillarKey; icon: typeof MapPin; value: string; label: string; description: string }[] = [
    {
      key: "cities",
      icon: MapPin,
      value: stats ? formatCount(stats.cities) : "—",
      label: "Cidades Atendidas",
      description: "Presente em todo o território nacional",
    },
    {
      key: "workers",
      icon: Users,
      value: stats ? formatCount(stats.workers) : "—",
      label: "Profissionais Ativos",
      description: "Trabalhadores verificados e prontos",
    },
    {
      key: "services",
      icon: Briefcase,
      value: stats ? formatCount(stats.services) : "—",
      label: "Serviços Publicados",
      description: "Oportunidades disponíveis agora",
    },
  ];

  return (
    <section
      className="relative py-16 overflow-hidden bg-foreground dark:bg-card"
      aria-labelledby="authority-title"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[280px] h-[280px] rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-3.5 py-1.5 mb-4">
              <Globe className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Marketplace Nacional
              </span>
            </div>
            <h2
              id="authority-title"
              className="text-3xl md:text-4xl font-bold text-background dark:text-foreground tracking-tight leading-[1.12]"
            >
              O Brasil que trabalha<br />
              <span className="text-primary">está aqui.</span>
            </h2>
          </div>

          <p className="text-background/70 dark:text-muted-foreground text-sm max-w-xs leading-relaxed">
            De Manaus a Porto Alegre, conectamos quem precisa de serviços a quem precisa de trabalho.
          </p>
        </div>

        {/* Pillar stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {pillars.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveModal(p.key)}
              className="text-left w-full bg-background/5 dark:bg-muted/30 border border-background/10 dark:border-border rounded-2xl p-6 stagger-fade hover:border-primary/40 hover:bg-background/10 dark:hover:bg-muted/50 transition-colors cursor-pointer"
              style={{ ["--stagger-delay" as string]: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-background dark:text-foreground tracking-tight mb-1">
                {p.value}
              </p>
              <p className="text-sm font-semibold text-background/80 dark:text-foreground mb-1">
                {p.label}
              </p>
              <p className="text-xs text-background/50 dark:text-muted-foreground">
                {p.description}
              </p>
            </button>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-xl font-bold group shadow-lg shadow-primary/30"
          >
            <Link to="/search-workers" className="flex items-center gap-2">
              Buscar Profissionais
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-xl font-semibold border-background/20 dark:border-border text-background dark:text-foreground hover:bg-background/10 dark:hover:bg-muted transition-colors duration-200"
          >
            <Link to="/offer-services">
              Cadastrar como Profissional
            </Link>
          </Button>
        </div>
      </div>

      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{activeModal ? MODAL_TITLES[activeModal] : ""}</DialogTitle>
            <DialogDescription>
              {listLoading ? "Carregando..." : `${listData?.length ?? 0} no total`}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 -mx-1 px-1">
            {listLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ul className="space-y-1">
                {(listData ?? []).map((item, i) => (
                  <li key={i} className="text-sm py-1.5 px-2 rounded-lg hover:bg-muted">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
