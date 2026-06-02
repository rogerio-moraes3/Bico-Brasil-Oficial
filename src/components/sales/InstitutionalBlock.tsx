import { MapPin, Ban, ShieldCheck } from "lucide-react";

export const InstitutionalBlock = () => {
  return (
    <section className="bg-white dark:bg-[#0A0A0A] py-24 md:py-32 relative overflow-hidden border-t border-slate-200/50 dark:border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent dark:from-blue-500/10" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
              Renda Local e Imediata, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                Sem Leilão de Preços.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              Criamos o Bico Brasil para eliminar comissões abusivas e intermediários desnecessários. Conexão direta entre quem precisa e quem sabe fazer.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Renda Local</h3>
                <p className="text-slate-600 dark:text-slate-400">Encontre serviços próximos a você, aumentando as chances de fechamento sem gastos longos de deslocamento.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <Ban className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sem Leilão</h3>
                <p className="text-slate-600 dark:text-slate-400">Contato direto pelo WhatsApp. Não vendemos seus dados para profissionais brigarem por preço.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Perfis Verificados</h3>
                <p className="text-slate-600 dark:text-slate-400">Avaliações reais e validação de documentos para garantir segurança de ambos os lados.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
