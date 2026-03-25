import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, TrendingUp, Globe, Wallet, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Globe,
    text: "Seu perfil aparece no Google da sua cidade",
  },
  {
    icon: TrendingUp,
    text: "Página exclusiva para você enviar como portfólio",
  },
  {
    icon: Wallet,
    text: "Receba 100% do valor do serviço (não cobramos comissão)",
  },
];

export const ProviderSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Para Prestadores</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-[1.12] tracking-tight">
                Faça do seu talento a sua{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  renda principal
                </span>
              </h2>

              <p className="text-slate-300 mb-8 text-lg">
                Pare de gastar fortunas comprando "moedas" em apps que não dão retorno. 
                No Bico Brasil, você tem visibilidade real e contato direto com o cliente.
              </p>

              <ul className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-200">{benefit.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                onClick={() => navigate("/offer-services")}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 group"
              >
                QUERO COMEÇAR A FATURAR AGORA
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white/10 min-h-[120px] flex flex-col justify-center">
                <div className="text-4xl font-bold text-orange-400 mb-2">0%</div>
                <div className="text-sm text-slate-400">Comissão sobre serviços</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white/10 min-h-[120px] flex flex-col justify-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
                <div className="text-sm text-slate-400">Contato direto</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white/10 min-h-[120px] flex flex-col justify-center">
                <div className="text-4xl font-bold text-green-400 mb-2">24h</div>
                <div className="text-sm text-slate-400">Seu perfil no ar</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white/10 min-h-[120px] flex flex-col justify-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">SEO</div>
                <div className="text-sm text-slate-400">Otimizado p/ Google</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
