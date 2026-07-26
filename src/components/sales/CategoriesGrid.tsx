import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Laptop, Truck, Wrench, Paintbrush, Zap, Droplets, TreePine, ChefHat, ArrowRight, Clock, ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";

const scenarios = [
  { 
    title: "Minha pia entupiu agora", 
    category: "Hidráulica", 
    slug: "hidraulica",
    icon: Droplets,
    iconColor: "text-blue-400"
  },
  { 
    title: "Preciso de um frete hoje", 
    category: "Transporte", 
    slug: "transporte-apoio",
    icon: Truck,
    iconColor: "text-orange-400"
  },
  { 
    title: "A luz da sala parou", 
    category: "Elétrica", 
    slug: "eletrica",
    icon: Zap,
    iconColor: "text-yellow-400"
  },
  { 
    title: "Faxina pesada urgente", 
    category: "Limpeza", 
    slug: "limpeza-organizacao",
    icon: Sparkles,
    iconColor: "text-cyan-400"
  },
  { 
    title: "Montar móveis novos", 
    category: "Manutenção", 
    slug: "manutencao-domestica",
    icon: Wrench,
    iconColor: "text-rose-400"
  },
  { 
    title: "Pintar uma parede", 
    category: "Pintura", 
    slug: "pintura",
    icon: Paintbrush,
    iconColor: "text-amber-400"
  },
];

export const CategoriesGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 bg-[#080C14] relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-6 backdrop-blur-sm">
              <Clock className="w-3 h-3" />
              <span className="!text-blue-400">PARA CONTRATANTES</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
              O que você precisa <br />
              <span className="!text-blue-400">resolver hoje?</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed max-w-xl">
              Não procure só por nomes — procure por quem resolve. A gente te conecta com quem pode cuidar do seu problema agora.
            </p>
          </div>
          
          <button
            onClick={() => navigate("/app")}
            className="group flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold transition-all"
          >
            Ver todas as categorias
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              style={{ willChange: 'opacity, transform' }}
              onClick={() => navigate(`/app?category=${item.slug}`)}
              className="group relative text-left p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
            >
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 border border-white/5`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform">
                  "{item.title}"
                </h3>
                
                <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <span className="!text-zinc-500 group-hover:!text-zinc-300 text-xs font-bold uppercase tracking-widest transition-colors">{item.category}</span>
                  <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                  <span className="!text-zinc-500 group-hover:!text-zinc-300 text-xs transition-colors">Encontrar profissional</span>
                </div>
              </div>

              {/* Decorative Corner Icon */}
              <ArrowRight className="absolute bottom-8 right-8 w-6 h-6 text-white/5 group-hover:text-white/20 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="!text-zinc-300 text-sm font-bold">Perfis Verificados</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              <span className="!text-zinc-300 text-sm font-bold">Aprovado pela Comunidade</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

