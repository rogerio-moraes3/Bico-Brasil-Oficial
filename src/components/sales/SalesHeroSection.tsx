import { useNavigate } from "react-router-dom";
import { Search, MapPin, Briefcase, Sparkles, ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";

export const SalesHeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-[#080C14] overflow-hidden">
      <div className="relative w-full bg-gradient-to-br from-[#0B1C2E] via-[#0D1B35] to-[#1E5EFF]/20">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />

        {/* HERO */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-24 pb-32 grid lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* LEFT */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-8 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              <span>Contrate rápido · Encontre trabalho · Resolva hoje</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-[72px] font-black leading-[1.1] tracking-tight mb-8 text-white">
              O jeito mais <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">rápido</span> de resolver sua vida.
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-blue-100/70 mb-10 max-w-xl leading-relaxed">
              O Bico Brasil conecta quem precisa de uma solução agora a quem quer trabalhar perto, com foco local e contato sem intermediários.
            </p>

            {/* Buttons */}
            <div className="flex gap-4 mb-10 flex-wrap">
              <button
                onClick={() => navigate("/app")}
                className="group relative flex items-center gap-2 bg-[#FF5C35] hover:bg-[#FF451A] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_12px_40px_rgba(255,92,53,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                Buscar serviços
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="px-8 py-4 rounded-2xl font-bold text-lg text-white border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300"
              >
                Criar perfil
              </button>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Globe, text: "Busca por cidade" },
                { icon: Zap, text: "Perfis Verificados" },
                { icon: ShieldCheck, text: "Premium opcional" }
              ].map((item) => (
                <span key={item.text} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs font-medium text-blue-100/60 backdrop-blur-sm">
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
          >
            {/* Texto Auxiliar Acima do Mockup */}
            <div className="flex flex-col items-center lg:items-end mb-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-4 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                <span>Bico Brasil</span>
              </div>
              {/* SubHeadLine */}
              <h2 className="text-3xl lg:text-[36px] font-black leading-[1.1] tracking-tight text-white text-center lg:text-right max-w-[400px]">
                Peça um <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">serviço</span> ou Pegue um <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Trabalho</span>.
              </h2>
            </div>
            {/* Phone Container */}
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-[60px] group-hover:bg-blue-500/30 transition-colors duration-500" />
              
              {/* Phone Frame */}
              <div className="w-[280px] h-[560px] bg-[#0F172A] border-[8px] border-[#1E293B] rounded-[48px] shadow-2xl relative overflow-hidden rotate-2 group-hover:rotate-0 transition-transform duration-700">
                {/* Screen Content Simulation */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1E5EFF] to-[#0B1C2E]">
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

                  {/* List Placeholder */}
                  <div className="mt-12 px-6 space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <div className="w-full h-3 bg-white/20 rounded" />
                            <div className="w-2/3 h-2 bg-white/10 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Chat Bubbles */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-16 -left-12 bg-white text-[#0B1C2E] px-5 py-3 rounded-2xl rounded-bl-none text-sm font-bold shadow-2xl flex items-center gap-2 border-b-2 border-blue-100"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Pedido enviado!
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-32 -right-8 bg-[#1E5EFF] text-white px-5 py-3 rounded-2xl rounded-br-none text-sm font-bold shadow-2xl border-b-2 border-blue-400"
                >
                  Resposta recebida 🔥
                </motion.div>
              </div>

              {/* Premium Badge Card */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="absolute -right-4 top-20 bg-[#0F172A]/90 backdrop-blur-xl p-5 rounded-[24px] border border-yellow-500/30 shadow-2xl max-w-[220px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 bg-yellow-500 text-[9px] font-black rounded text-black">PRO</div>
                  <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Premium</span>
                </div>
                <p className="text-blue-100/90 text-sm leading-snug">Ganhe visibilidade máxima e apareça no topo das buscas.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 -mt-20 pb-24 relative z-20">
        <div className="bg-white rounded-[40px] p-10 lg:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-gray-100">

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
            <div className="max-w-2xl">
              <span className="inline-block text-blue-600 font-black text-xs tracking-widest uppercase mb-3">
                Busca Inteligente
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Encontre o profissional certo ou sua próxima oportunidade agora.
              </h2>
            </div>
            
            <button className="hidden lg:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Ver todas as categorias <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Search Engine UI */}
          <div className="flex flex-col lg:flex-row gap-4 mb-10 bg-gray-50/50 p-2 rounded-[16px] border border-gray-600">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                placeholder="Ex.: Frete, Pintura, Faxina..."
                className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium placeholder:text-gray-400 shadow-sm transition-all"
              />
            </div>

            <div className="lg:w-48 relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border-none appearance-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium shadow-sm">
                <option>Cidade</option>
                <option>São Paulo</option>
                <option>Rio de Janeiro</option>
              </select>
            </div>

            <div className="lg:w-48 relative">
              <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border-none appearance-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium shadow-sm">
                <option>Tipo</option>
                <option>Contratar</option>
                <option>Trabalhar</option>
              </select>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95">
              Buscar
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                title: "Trabalhou, tá pago.", 
                desc: "Jornada direta focada na conclusão do serviço sem burocracia.",
                icon: Zap,
                color: "bg-amber-50 text-amber-600"
              },
              { 
                title: "Leitura local", 
                desc: "Priorizamos quem está perto de você para agilizar o atendimento.",
                icon: MapPin,
                color: "bg-blue-50 text-blue-600"
              },
              { 
                title: "Contato mais claro", 
                desc: "Interface limpa e objetiva para fechar o bico sem ruídos.",
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

