import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Briefcase, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
      value: stats?.workers !== undefined ? `${stats.workers}+` : "—",
      label: "Profissionais",
      color: "text-blue-400"
    },
    {
      icon: Briefcase,
      value: stats?.services !== undefined ? `${stats.services}+` : "—",
      label: "Serviços",
      color: "text-emerald-400"
    },
    {
      icon: MapPin,
      value: stats?.cities !== undefined ? stats.cities : "—",
      label: "Cidades",
      color: "text-purple-400"
    },
  ];

  return (
    <div className="w-full bg-[#080C14] border-y border-white/5 py-6 overflow-hidden relative group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-8 md:gap-12">
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Plataforma Ativa</span>
          </div>

          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 group/item"
            >
              <div className={`p-2.5 rounded-xl bg-white/[0.03] border border-white/5 group-hover/item:border-white/20 transition-all duration-300 ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tighter leading-none mb-1">
                  {item.value}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-100/30">
                  {item.label}
                </span>
              </div>
            </motion.div>
          ))}

          <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-blue-100/20 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Dados em Tempo Real</span>
          </div>
        </div>
      </div>
    </div>
  );
};

