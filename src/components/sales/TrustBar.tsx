import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, ShieldCheck, Smartphone, Star, Users } from "lucide-react";

export const TrustBar = () => {
  const { data: liveStats } = useQuery({
    queryKey: ["trust-bar-stats"],
    queryFn: async () => {
      const [workersRes, servicesRes] = await Promise.all([
        supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .eq("type", "worker"),
        supabase
          .from("worker_services")
          .select("id", { count: "exact", head: true })
          .eq("active", true),
      ]);
      return {
        workers: workersRes.count ?? 0,
        services: servicesRes.count ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatCount = (n: number) => {
    if (n === 0) return "0";
    return n >= 1000 ? `+${(Math.floor(n / 100) * 100).toLocaleString("pt-BR")}` : `+${n}`;
  };

  const trustItems = [
    {
      icon: Rocket,
      label: liveStats ? formatCount(liveStats.services) : "+5.000",
      description: "Serviços Publicados",
    },
    {
      icon: ShieldCheck,
      label: "Verificados",
      description: "Profissionais com Documento",
    },
    {
      icon: Smartphone,
      label: "PWA Leve",
      description: "Tecnologia Moderna",
    },
    {
      icon: Star,
      label: "4.8/5",
      description: "Avaliação Média",
    },
    {
      icon: Users,
      label: liveStats ? formatCount(liveStats.workers) : "+2.000",
      description: "Profissionais Ativos",
    },
  ];

  return (
    <section className="py-14 bg-background border-y border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-10">
          A escolha inteligente de quem precisa resolver rápido
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-0 md:divide-x md:divide-border/50">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center px-4 py-2"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight">{item.label}</span>
              <span className="text-xs text-muted-foreground mt-1 leading-snug">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
