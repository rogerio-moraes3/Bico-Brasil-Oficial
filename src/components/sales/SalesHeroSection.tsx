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

      const real = shuffle([...workerCards, ...contractorCards]);
      // Enquanto o volume real de Premium for baixo, completa com os cards
      // de exemplo (nunca duplica o mesmo real) so pra nao deixar a tela do
      // celular com 1 card sozinho e um vazio grande embaixo — o real
      // sempre aparece primeiro, em destaque.
      const combined = real.length >= ROTATION_WINDOW_SIZE
        ? real
        : [...real, ...FALLBACK_CARDS].slice(0, Math.max(ROTATION_WINDOW_SIZE, real.length));
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
  const totalWindows = Math.max(1, Math.ceil(rotationPool.length / ROTATION_WINDOW_SIZE));

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
      <div className="bico-showcase relative w-full bg-bico-showcase overflow-hidden">

        {/* Ambient glow */}
        <div className="absolute -top-[260px] -right-[220px] w-[900px] h-[900px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(40,110,255,0.55) 0%, rgba(40,110,255,0.12) 45%, rgba(40,110,255,0) 72%)' }} />
        <div className="absolute -bottom-[320px] right-[120px] w-[640px] h-[640px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(70,150,255,0.30) 0%, rgba(70,150,255,0) 70%)' }} />
        {/* Glossy sweep */}
        <div className="absolute top-0 -left-[10%] w-[70%] h-full pointer-events-none" style={{ background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0) 58%)', transform: 'skewX(-14deg)' }} />

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
            <div className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-semibold tracking-wider uppercase rounded-full mb-10" style={{ border: '1px solid var(--bico-accent-blue-border)', background: 'var(--bico-accent-blue-soft)' }}>
              <Sparkles className="w-3 h-3 text-bico-accent-hover" />
              <span className="text-[#9FB6EE]">Contrate rápido • Encontre trabalho • Sem intermediários</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-[64px] font-extrabold leading-[1.12] tracking-tight mb-8 text-bico-heading">
              Precisa <span className="text-bico-accent">contratar</span> alguém?<br />
              Ou quer <span className="text-bico-accent">ganhar dinheiro</span> hoje?
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-bico-muted mb-12 max-w-xl leading-relaxed font-normal">
              Encontre um profissional da sua cidade ou divulgue seus serviços para conseguir novos clientes. Tudo com contato direto, sem comissão e sem burocracia.
            </p>

            {/* Buttons */}
            <div className="flex gap-4 mb-12 flex-wrap">
              <button
                onClick={() => navigate("/app")}
                className="group relative flex items-center gap-2 bg-bico-orange hover:bg-bico-orange-hover text-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-[0_8px_24px_rgba(255,92,53,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                Quero contratar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="px-8 py-4 rounded-xl font-bold text-lg text-bico-heading border-1.5 border-white/[0.18] bg-transparent hover:bg-white/5 transition-all duration-300"
              >
                Quero trabalhar
              </button>
            </div>

            {/* Pills */}
            <div className="flex flex-col gap-3">
              {[
                { icon: Globe, text: "Contato direto pelo WhatsApp" },
                { icon: Zap, text: "Profissionais perto de você" },
                { icon: ShieldCheck, text: "Você fica com 100% do valor" }
              ].map((item) => (
                <span key={item.text} className="inline-flex items-center gap-2.5 text-sm font-medium text-bico-muted">
                  <item.icon className="w-4 h-4 text-bico-accent" />
                  {item.text}
                </span>
              ))}
            </div>
          </motion.div>

          {/* RIGHT - Celular realista */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end items-center"
            style={{ willChange: 'opacity, transform' }}
          >
            <div className="relative">
              {/* grounding shadow */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[260px] h-9 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 72%)', filter: 'blur(2px)' }} />

              {/* Outer metallic frame */}
              <div
                className="relative w-[300px] sm:w-[340px] h-[600px] sm:h-[680px] rounded-[46px] p-[9px]"
                style={{
                  background: 'linear-gradient(160deg, #40444E 0%, #1B1D22 22%, #0E0F12 55%, #2E313A 88%, #4A4E58 100%)',
                  boxShadow: '0 50px 90px -24px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 1px 1px rgba(255,255,255,0.35)',
                }}
              >
                {/* side buttons */}
                <div className="absolute -left-[2px] top-[190px] w-1 h-[34px] rounded-l-sm" style={{ background: 'linear-gradient(90deg,#4A4E58,#1B1D22)' }} />
                <div className="absolute -left-[2px] top-[236px] w-1 h-[56px] rounded-l-sm" style={{ background: 'linear-gradient(90deg,#4A4E58,#1B1D22)' }} />
                <div className="absolute -right-[2px] top-[210px] w-1 h-[70px] rounded-r-sm" style={{ background: 'linear-gradient(270deg,#4A4E58,#1B1D22)' }} />

                {/* Screen */}
                <div className="relative w-full h-full rounded-[38px] bg-[#0F1422] overflow-hidden border border-white/10">
                  {/* glossy sheen */}
                  <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 14%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 78%, rgba(255,255,255,0.08) 92%, rgba(255,255,255,0.18) 100%)' }} />
                  <div className="absolute top-0 -left-[20%] w-[55%] h-full z-20 pointer-events-none" style={{ background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0) 62%)', transform: 'skewX(-12deg)' }} />

                  {/* notch */}
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-full z-30" />

                  {/* App header */}
                  <div className="relative z-10 pt-[52px] px-5 pb-4 flex items-center justify-between">
                    <span className="text-[15px] font-extrabold text-bico-heading tracking-tight">Bico Brasil</span>
                    <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center">
                      <Search className="w-3.5 h-3.5 text-bico-muted" />
                    </div>
                  </div>

                  {/* Premium callout */}
                  <div className="relative z-10 mx-5 mb-4 p-3.5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,193,61,0.14), rgba(255,106,61,0.10))', border: '1px solid rgba(255,193,61,0.28)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-black tracking-wide text-[#0A0F1E] bg-[#FFC13D] px-1.5 py-0.5 rounded">PRO</span>
                      <span className="text-xs font-bold text-bico-heading">Premium</span>
                    </div>
                    <span className="text-xs text-[#C7CCDA] leading-snug font-medium block">Quer aparecer primeiro e conseguir mais clientes? Ative o Premium.</span>
                  </div>

                  {/* Rodizio de gente real Premium (fallback: cards de exemplo) */}
                  <div className="relative z-10 px-5 flex flex-col gap-2.5 min-h-[220px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={windowIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-2.5"
                      >
                        {visibleCards.map((card, idx) => (
                          <div
                            key={`${card.kind}-${card.id}`}
                            className="relative flex items-center gap-3 p-3 rounded-2xl bg-white/[0.045]"
                            style={{ border: idx === 0 ? '1px solid var(--bico-accent-blue-border)' : '1px solid rgba(255,255,255,0.06)' }}
                          >
                            {idx === 0 && (
                              <span className="absolute -top-[7px] right-2.5 text-[8px] font-black tracking-wide text-[#0A0F1E] bg-bico-accent px-1.5 py-0.5 rounded uppercase">
                                Anúncio
                              </span>
                            )}
                            {card.kind === "worker" ? (
                              <>
                                {card.photo ? (
                                  <img src={card.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: 'linear-gradient(135deg,#5B8DEF,#3B6EF6)' }}>
                                    {card.name.charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="block text-[13px] font-bold text-bico-heading truncate">{card.name.split(" ")[0]}</span>
                                  <span className="block text-[11px] text-[#8B93A7] font-medium truncate">
                                    {card.rating != null && `★ ${Number(card.rating).toFixed(1)} · `}
                                    {card.category}{card.city ? ` · ${card.city}` : ""}{card.state ? `, ${card.state}` : ""}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg,#FF9F5B,#FF6A3D)' }}>
                                  <Briefcase className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block text-[13px] font-bold text-bico-heading truncate">{card.title}</span>
                                  <span className="block text-[11px] text-[#8B93A7] font-medium truncate">
                                    {card.category}{card.city ? ` · ${card.city}` : ""}{card.state ? `, ${card.state}` : ""}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>

                    {/* Indicador de carrossel do rodizio */}
                    {totalWindows > 1 && (
                      <div className="flex justify-center gap-1.5 pb-4">
                        {Array.from({ length: totalWindows }).map((_, i) => (
                          <div
                            key={i}
                            className={i === windowIndex ? "w-4 h-1 rounded-full bg-bico-accent" : "w-1 h-1 rounded-full bg-white/20"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Bubbles — posicao estatica (sem animacao continua de posicao).
                  Uma animacao de loop em top/bottom/transform passa a maior parte
                  do tempo em valores fracionarios de pixel, o que faz o navegador
                  reanti-alias o texto a cada frame e produz um efeito de "ghosting"
                  perceptivel num balao branco com texto escuro. O carrossel de
                  cards (Nando/Carlos/Ana) continua animando normalmente — só estes
                  dois balões ficaram estáticos. */}
              <div className="hidden sm:flex absolute top-16 -left-10 bg-white text-[#0B1C2E] px-5 py-3 rounded-2xl rounded-bl-none text-sm font-bold shadow-2xl items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Novo prestador!
              </div>

              <div
                className="hidden sm:block absolute bottom-24 -right-6 text-white px-5 py-3 rounded-2xl rounded-br-none text-sm font-bold shadow-2xl"
                style={{ background: '#3B6EF6' }}
              >
                Resposta recebida
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="bico-showcase max-w-7xl mx-auto px-6 lg:px-16 -mt-20 pb-24 relative z-20">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] p-6 sm:p-8 lg:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border-4 border-bico-lime">

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

          {/* Search Engine UI — Cidade/Contratar/Buscar com a mesma altura (h-16) */}
          <div className="flex flex-col lg:flex-row gap-4 mb-10 bg-gray-50/50 p-2 rounded-[16px] border border-gray-600">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ex.: Frete, Pintura, Faxina..."
                className="w-full h-16 pl-14 pr-6 bg-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium placeholder:text-gray-400 shadow-sm transition-all"
              />
            </div>

            <div className="lg:w-48 relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full h-16 pl-14 pr-6 bg-bico-orange rounded-2xl border-none appearance-none focus:ring-2 focus:ring-blue-500/20 text-white font-medium shadow-sm"
              >
                <option value="">Cidade</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name} - {city.state}</option>
                ))}
              </select>
            </div>

            <div className="lg:w-48 relative">
              <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-900 pointer-events-none" />
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full h-16 pl-14 pr-6 bg-bico-lime rounded-2xl border-none appearance-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-medium shadow-sm"
              >
                <option>Contratar</option>
                <option>Trabalhar</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="h-16 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
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

