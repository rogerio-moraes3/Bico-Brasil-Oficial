import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Briefcase, Sparkles, ArrowRight, ShieldCheck, Zap, Globe, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCities } from "@/hooks/useCities";
import { supabase } from "@/integrations/supabase/client";

interface WorkerRotationCard {
  kind: "worker";
  id: string;
  name: string;
  photo: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
}

interface ContractorRotationCard {
  kind: "contractor";
  id: string;
  title: string;
  category: string | null;
  city: string | null;
  state: string | null;
}

type RotationCard = WorkerRotationCard | ContractorRotationCard;

// Mostrado enquanto os dados reais carregam e como ultimo recurso se nao
// houver nenhum Premium hoje — nunca deixa o mockup vazio.
const FALLBACK_CARDS: RotationCard[] = [
  { kind: "worker", id: "fallback-1", name: "Carlos M.", photo: null, category: "Elétrica", city: "São Paulo", state: "SP", rating: 4.9 },
  { kind: "worker", id: "fallback-2", name: "Ana P.", photo: null, category: "Limpeza", city: "Rio de Janeiro", state: "RJ", rating: 5.0 },
  { kind: "worker", id: "fallback-3", name: "João S.", photo: null, category: "Pintura", city: "Belo Horizonte", state: "MG", rating: 4.8 },
];

const ROTATION_WINDOW_SIZE = 3;
const ROTATION_INTERVAL_MS = 4500;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const SalesHeroSection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("Contratar");
  const [selectedCityId, setSelectedCityId] = useState("");
  const { cities } = useCities();

  const [rotationPool, setRotationPool] = useState<RotationCard[]>(FALLBACK_CARDS);
  const [windowIndex, setWindowIndex] = useState(0);

  // Rodizio de gente real Premium no mockup — puxa so das views publicas
  // (users_public / job_postings_public), nunca da tabela crua. Se nao
  // houver ninguem Premium ainda, mantem os cards de exemplo.
  useEffect(() => {
    let active = true;
    (async () => {
      const [workersRes, jobsRes] = await Promise.all([
        supabase
          .from("users_public")
          .select("id,name,profile_photo,category,city,state,rating_avg")
          .eq("type", "worker")
          .eq("plan_active", true)
          .limit(30),
        supabase
          .from("job_postings_public")
          .select("id,title,category,city,state")
          .limit(30),
      ]);

      const workerCards: RotationCard[] = (workersRes.data || []).map((w) => ({
        kind: "worker",
        id: w.id,
        name: w.name,
        photo: w.profile_photo,
        category: w.category,
        city: w.city,
        state: w.state,
        rating: w.rating_avg,
      }));
      const contractorCards: RotationCard[] = (jobsRes.data || []).map((j) => ({
        kind: "contractor",
        id: j.id,
        title: j.title,
        category: j.category,
        city: j.city,
        state: j.state,
      }));

      const combined = shuffle([...workerCards, ...contractorCards]);
      if (active && combined.length > 0) setRotationPool(combined);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (rotationPool.length <= ROTATION_WINDOW_SIZE) return;
    const totalWindows = Math.ceil(rotationPool.length / ROTATION_WINDOW_SIZE);
    const interval = setInterval(() => {
      setWindowIndex((i) => (i + 1) % totalWindows);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [rotationPool]);

  const visibleCards = rotationPool.slice(
    windowIndex * ROTATION_WINDOW_SIZE,
    windowIndex * ROTATION_WINDOW_SIZE + ROTATION_WINDOW_SIZE
  );

  const handleSearch = () => {
    if (searchType === "Trabalhar") {
      navigate("/auth?mode=signup");
      return;
    }
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (selectedCityId) params.set("city_id", selectedCityId);
    navigate(`/search-workers?${params.toString()}`);
  };

  return (
    <section className="w-full bg-[#080C14] overflow-x-hidden">
      <div className="relative w-full bg-[#0B0F17]">

        {/* HERO */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-24 pb-32 grid lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ willChange: 'opacity, transform' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-10 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              <span className="!text-blue-400">Contrate rápido • Encontre trabalho • Sem intermediários</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-[72px] font-black leading-[1.1] tracking-tight mb-8 text-white">
              Precisa <span className="!text-blue-400">contratar</span> alguém? Ou quer <span className="!text-blue-400">ganhar dinheiro</span> hoje?
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl !text-blue-100/70 mb-12 max-w-xl leading-relaxed">
              Encontre um profissional da sua cidade ou divulgue seus serviços para conseguir novos clientes. Tudo com contato direto, sem comissão e sem burocracia.
            </p>

            {/* Buttons */}
            <div className="flex gap-4 mb-12 flex-wrap">
              <button
                onClick={() => navigate("/app")}
                className="group relative flex items-center gap-2 bg-[#FF5C35] hover:bg-[#FF451A] text-slate-900 px-8 py-4 rounded-full font-bold text-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                Quero contratar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300"
              >
                Quero trabalhar
              </button>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { icon: Globe, text: "Contato direto pelo WhatsApp" },
                { icon: Zap, text: "Profissionais perto de você" },
                { icon: ShieldCheck, text: "Você fica com 100% do valor" }
              ].map((item) => (
                <span key={item.text} className="inline-flex items-center gap-2 text-xs font-medium !text-blue-100/50">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.text}
                </span>
              ))}
            </div>
          </motion.div>

{/* RIGHT - Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex flex-col items-center lg:items-end justify-center"
            style={{ willChange: 'opacity, transform' }}
          >
            {/* Texto Auxiliar Acima do Mockup */}
            <div className="flex flex-col items-center lg:items-end mb-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-4 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                <span className="!text-blue-400">Bico Brasil</span>
              </div>
              {/* SubHeadLine */}
              <h2 className="text-3xl lg:text-[36px] font-black leading-[1.1] tracking-tight text-white text-center lg:text-right max-w-[400px]">
                Veja como é <span className="!text-blue-400">simples</span> encontrar quem você precisa.
              </h2>
            </div>
            {/* Phone Container */}
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-[60px] group-hover:bg-blue-500/20 transition-colors duration-500" />
              
              {/* Phone Frame */}
              <div className="w-[280px] h-[560px] bg-[#0F172A] border-[8px] border-[#1E293B] rounded-[48px] shadow-2xl relative overflow-hidden">
                {/* Screen Content Simulation */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a2436] to-[#0B0F17]">
                  {/* Status Bar */}
                  <div className="h-10 flex justify-between px-8 items-center opacity-40">
                    <div className="w-10 h-3 bg-white rounded-full" />
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-white rounded-full" />
                      <div className="w-3 h-3 bg-white rounded-full opacity-50" />
                    </div>
                  </div>

                  {/* Header Placeholder */}
                  <div className="px-6 mt-4">
                    <div className="w-3/4 h-8 bg-white/20 rounded-lg mb-4" />
                    <div className="w-1/2 h-4 bg-white/10 rounded-lg" />
                  </div>

                  {/* Rodizio de gente real Premium (fallback: cards de exemplo) */}
                  <div className="mt-12 px-6 space-y-4 min-h-[280px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={windowIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        {visibleCards.map((card) => (
                          <div key={`${card.kind}-${card.id}`} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                            {card.kind === "worker" ? (
                              <>
                                <div className="flex items-center gap-3">
                                  {card.photo ? (
                                    <img
                                      src={card.photo}
                                      alt=""
                                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10 shrink-0">
                                      {card.name.charAt(0)}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <span className="text-white font-bold text-sm truncate block">{card.name.split(" ")[0]}</span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      {card.rating != null && (
                                        <>
                                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                          <span className="text-white/80 text-xs font-medium">{Number(card.rating).toFixed(1)}</span>
                                        </>
                                      )}
                                      {card.category && <span className="text-white/40 text-xs">• {card.category}</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 mt-2 pl-14">
                                  <MapPin className="w-3 h-3 text-white/40" />
                                  <span className="text-white/40 text-[11px]">
                                    {card.city}{card.state ? `, ${card.state}` : ""}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white ring-2 ring-white/10 shrink-0">
                                    <Briefcase className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-white font-bold text-sm truncate block">{card.title}</span>
                                    {card.category && (
                                      <span className="text-white/40 text-xs mt-0.5 block">Procura: {card.category}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 mt-2 pl-14">
                                  <MapPin className="w-3 h-3 text-white/40" />
                                  <span className="text-white/40 text-[11px]">
                                    {card.city}{card.state ? `, ${card.state}` : ""}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Floating Chat Bubbles */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-16 -left-12 bg-white text-[#0B1C2E] px-5 py-3 rounded-2xl rounded-bl-none text-sm font-bold shadow-2xl flex items-center gap-2 border-b-2 border-blue-100"
                  style={{ willChange: 'transform' }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Pedido enviado!
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-32 -right-8 bg-[#1E5EFF] text-white px-5 py-3 rounded-2xl rounded-br-none text-sm font-bold shadow-2xl border-b-2 border-blue-400"
                  style={{ willChange: 'transform' }}
                >
                  Resposta recebida
                </motion.div>
              </div>

              {/* Premium Badge Card */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="absolute -right-4 top-20 bg-[#0F172A]/90 backdrop-blur-xl p-5 rounded-[24px] border border-yellow-500/30 shadow-2xl max-w-[220px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 bg-yellow-500 text-[9px] font-black rounded text-black">PRO</div>
                  <span className="!text-yellow-400 text-xs font-bold uppercase tracking-widest">Premium</span>
                </div>
                <p className="!text-blue-100/90 text-sm leading-snug">Quer aparecer primeiro e conseguir mais clientes? Ative o Premium.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 -mt-20 pb-24 relative z-20">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] p-6 sm:p-8 lg:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-gray-100">

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
            <div className="max-w-2xl">
              <span className="inline-block text-blue-600 font-black text-xs tracking-widest uppercase mb-3">
                Busca Inteligente
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Ache quem você precisa. Perto de você, agora.
              </h2>
            </div>
            
            <button
              onClick={() => navigate("/search-workers")}
              className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
            >
              Ver todas as categorias <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Search Engine UI */}
          <div className="flex flex-col lg:flex-row gap-4 mb-10 bg-gray-50/50 p-2 rounded-[16px] border border-gray-600">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ex.: Frete, Pintura, Faxina..."
                className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium placeholder:text-gray-400 shadow-sm transition-all"
              />
            </div>

            <div className="lg:w-48 relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border-none appearance-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium shadow-sm"
              >
                <option value="">Cidade</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name} - {city.state}</option>
                ))}
              </select>
            </div>

            <div className="lg:w-48 relative">
              <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border-none appearance-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium shadow-sm"
              >
                <option>Contratar</option>
                <option>Trabalhar</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              Buscar
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Trabalhou, tá pago.",
                desc: "Sem enrolação: combinou, fez, recebeu.",
                icon: Zap,
                color: "bg-amber-50 text-amber-600"
              },
              {
                title: "Perto de você",
                desc: "A gente prioriza quem tá pertinho, pra ser mais rápido.",
                icon: MapPin,
                color: "bg-blue-50 text-blue-600"
              },
              {
                title: "Direto no ponto",
                desc: "Sem letra miúda, sem intermediário. Você fala com a pessoa certa.",
                icon: ShieldCheck,
                color: "bg-emerald-50 text-emerald-600"
              },
            ].map((feature) => (
              <div key={feature.title} className="group p-6 rounded-3xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all duration-300">
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

