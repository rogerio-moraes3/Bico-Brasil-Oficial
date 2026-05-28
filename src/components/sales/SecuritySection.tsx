import { ShieldCheck, Star, Headphones, FileCheck, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { 
    icon: FileCheck, 
    title: "Identidade Verificada", 
    desc: "Validamos documentos oficiais para garantir que você está lidando com pessoas reais.", 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/10" 
  },
  { 
    icon: Star, 
    title: "Avaliações Reais", 
    desc: "Sistema de reputação transparente baseado em experiências reais da nossa comunidade.", 
    color: "text-amber-400", 
    bg: "bg-amber-500/10" 
  },
  { 
    icon: Lock, 
    title: "Dados Protegidos", 
    desc: "Seus dados estão seguros conforme a LGPD.", 
    color: "text-blue-400", 
    bg: "bg-blue-500/10" 
  },
  { 
    icon: Headphones, 
    title: "Suporte Humano", 
    desc: "Nada de robôs. Nossa equipe está pronta para ajudar você em qualquer situação.", 
    color: "text-purple-400", 
    bg: "bg-purple-500/10" 
  },
];

export const SecuritySection = () => {
  return (
    <section className="py-24 md:py-32 bg-[#080C14] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-8">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Sua segurança é o nosso <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">compromisso real.</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed">
            Criamos um ambiente onde a confiança é a base de cada bico. Tecnologia e verificação humana trabalhando juntas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <feat.icon className={`w-6 h-6 ${feat.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{feat.title}</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-[40px] bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-1">Busque pelo Selo de Verificado</h4>
              <p className="text-zinc-400 text-sm md:text-base font-medium">Priorize profissionais com identidade validada para uma experiência 100% segura.</p>
            </div>
          </div>
          <button 
          onClick={() => window.location.href = "/privacy"}
          className="whitespace-nowrap px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-white transition-all">
            Saiba mais sobre segurança
          </button>
        </div>
      </div>
    </section>
  );
};

