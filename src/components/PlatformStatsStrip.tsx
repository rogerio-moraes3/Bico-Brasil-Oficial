import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Briefcase, MapPin } from "lucide-react";

export const PlatformStatsStrip = () => {
  const { data: stats } = useQuery({
    queryKey: ["platform-stats-strip"],
    queryFn: async () => {
      const [workersRes, servicesRes, citiesRes] = await Promise.all([
        supabase
          .from("users")
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

  const items = [
    {
      icon: Users,
      value: stats?.workers !== undefined ? stats.workers : "—",
      label: "trabalhadores",
    },
    {
      icon: Briefcase,
      value: stats?.services !== undefined ? stats.services : "—",
      label: "serviços publicados",
    },
    {
      icon: MapPin,
      value: stats?.cities !== undefined ? stats.cities : "—",
      label: "cidades",
    },
  ];

  return (
    <div className="w-full bg-[#f1f5f9] dark:bg-background py-2 px-4 shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-2">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-xs text-[#9ca3af] dark:text-muted-foreground font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="hidden sm:inline">Ao vivo</span>
        </div>

        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-[#9ca3af] dark:text-muted-foreground">
            <item.icon className="w-3.5 h-3.5 text-[#9ca3af] dark:text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="font-medium text-xs text-[#111827] dark:text-foreground">{item.value}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
