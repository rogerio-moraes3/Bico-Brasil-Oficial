import { useState } from "react";
import { Search, MessageCircle, ArrowRight, Zap, CheckCircle2, UserPlus, Target, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const clientSteps = [
  {
    icon: Search,
    title: "Busque o que precisa",
    description: "Digite o serviço ou problema. Encontramos quem resolve perto de você em segundos.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "Escolha o Perfil",
    description: "Veja avaliações, fotos e o selo de verificação. Escolha com total segurança.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: MessageCircle,
    title: "Feche pelo WhatsApp",
    description: "Contato direto e imediato. Sem taxas ocultas, sem intermediários. Você decide.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

const workerSteps = [
  {
    icon: UserPlus,
    title: "Crie seu Perfil",
    description: "Mostre suas habilidades, fotos de trabalhos e conquiste o selo de verificado.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Target,
    title: "Apareça nas Buscas",
    description: "Seja encontrado por clientes na sua cidade no exato momento que eles precisam.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Wallet,
    title: "Fature 100%",
    description: "Negocie direto, sem comissões. O dinheiro do seu trabalho é inteiramente seu.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
];

export const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<"client" | "worker">("client");

  const steps = activeTab === "client" ? clientSteps : workerSteps;

  return (
    <section className="py-24 md:py-32 bg-[#080C14] overflow-hidden relative border-t border-white/5">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 mb-6 backdrop-blur-sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>Fluxo de Trabalho</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            Como funciona o <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Bico Brasil?</span>
          </h2>

          {/* Toggle Switch Moderno */}
          <div className="flex justify-center mt-10">
            <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-2 backdrop-blur-xl">
              <button
                onClick={() => setActiveTab("client")}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "client" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                QUERO CONTRATAR
              </button>
              <button
                onClick={() => setActiveTab("worker")}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "worker" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                QUERO TRABALHAR
              </button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative group bg-white/[0.02] border border-white/5 rounded-[40px] p-10 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                        <step.icon className={`w-8 h-8 ${step.color}`} />
                      </div>
                      <span className="text-6xl font-black text-white/[0.03] group-hover:text-white/5 transition-colors select-none tracking-tighter">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-20 flex flex-col items-center gap-4">
          <button 
          onClick={() => window.location.href = "/app"}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95">
            {activeTab === "client" ? "Começar a Contratar" : "Começar a Trabalhar"}
          </button>
          <span className="text-zinc-500 font-medium">Rápido, fácil e sem intermediários.</span>
        </div>
      </div>
    </section>
  );
};
