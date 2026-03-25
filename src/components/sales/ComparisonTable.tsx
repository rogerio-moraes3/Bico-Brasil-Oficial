import { Check, X, Zap } from "lucide-react";

const comparisons = [
  {
    feature: "Instalação",
    bicoBrasil: "Instantânea (PWA) - Não ocupa memória",
    others: "Precisa baixar (100MB+) ou lento",
  },
  {
    feature: "Negociação",
    bicoBrasil: "Direta no WhatsApp - Sem intermediários",
    others: "Chat travado ou taxas escondidas",
  },
  {
    feature: "Segurança",
    bicoBrasil: "Perfis Verificados com Documento",
    others: "Perfis falsos e golpes comuns",
  },
  {
    feature: "Custo",
    bicoBrasil: "Justo (Planos acessíveis)",
    others: "Comissões de até 30% sobre o serviço",
  },
  {
    feature: "Contato",
    bicoBrasil: "Direto com o profissional",
    others: "Intermediado pela plataforma",
  },
];

export const ComparisonTable = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Comparativo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Por que somos melhores que os outros apps?
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Comparamos o Bico Brasil com GetNinjas, Facebook e OLX
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto rounded-2xl border border-border shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left bg-muted font-semibold text-foreground text-sm">
                  Recurso
                </th>
                <th className="p-4 text-center bg-primary text-primary-foreground font-semibold text-sm">
                  Bico Brasil
                </th>
                <th className="p-4 text-center bg-muted font-semibold text-muted-foreground text-sm">
                  Apps Comuns
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 font-medium text-foreground text-sm">
                    {row.feature}
                  </td>
                  <td className="p-4 bg-primary/5">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm text-foreground text-center">{row.bicoBrasil}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground text-center">{row.others}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
