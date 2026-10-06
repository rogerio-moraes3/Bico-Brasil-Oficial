import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowRight, Briefcase, Search } from "lucide-react";
import { useUserMode } from "@/contexts/UserModeContext";
import { modeHome, type UserMode } from "@/lib/userMode";

type Ambiente = {
  value: UserMode;
  titulo: string;
  descricao: string;
  cta: string;
  icone: typeof Briefcase;
  // Tonalidade de fundo, nao cor chapada: a cor do ambiente aparece no icone,
  // no CTA e no halo — o bloco em si fica quase branco.
  fundo: string;
  halo: string;
  acento: string;
  botao: string;
};

const AMBIENTES: Ambiente[] = [
  {
    value: "professional",
    titulo: "Quero trabalhar",
    descricao: "Encontre bicos, oportunidades e clientes na sua cidade.",
    cta: "Entrar para trabalhar",
    icone: Briefcase,
    fundo: "bg-bico-work/[0.07] hover:bg-bico-work/[0.12]",
    halo: "bg-bico-work/20",
    acento: "text-bico-work",
    botao: "bg-bico-work hover:bg-bico-work-hover",
  },
  {
    value: "contractor",
    titulo: "Quero contratar",
    descricao: "Encontre profissionais ou publique uma vaga.",
    cta: "Entrar para contratar",
    icone: Search,
    fundo: "bg-bico-accent/[0.07] hover:bg-bico-accent/[0.12]",
    halo: "bg-bico-accent/20",
    acento: "text-bico-accent",
    botao: "bg-bico-accent hover:bg-bico-accent-hover",
  },
];

/**
 * Portao interno (pos-login). Momento a parte: tela cheia, sem header de
 * navegacao por cima.
 *
 * Nao e a landing publica "/" — aquela e marketing para quem nao tem conta.
 * Aqui a pessoa ja entrou e so precisa responder "trabalhar ou contratar?".
 */
export default function EscolherAmbiente() {
  const navigate = useNavigate();
  const { setMode } = useUserMode();
  const [lembrar, setLembrar] = useState(true);

  const escolher = (modo: UserMode) => {
    // setMode ja grava localStorage + userModeChosen + last_mode na conta.
    // Sem "lembrar", a escolha vale so para esta navegacao: aplica o modo em
    // memoria e limpa o flag, para o portao voltar a aparecer no proximo acesso.
    setMode(modo);
    if (!lembrar) {
      try {
        localStorage.removeItem("userModeChosen");
      } catch {
        /* sem localStorage nao ha o que limpar */
      }
    }
    navigate(modeHome(modo), { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Escolha seu ambiente | Bico Brasil</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-dvh bg-background flex flex-col">
        <div className="px-6 pt-10 pb-6 text-center sm:pt-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Bico Brasil
          </p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            O que você quer fazer?
          </h1>
        </div>

        {/* Dois blocos dividindo a tela: lado a lado no desktop, empilhados no
            mobile. O bloco inteiro e o alvo de clique, nao so o botao. */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 pb-4 sm:px-6 sm:pb-6">
          {AMBIENTES.map(({ value, titulo, descricao, cta, icone: Icone, fundo, halo, acento, botao }) => (
            <button
              key={value}
              type="button"
              onClick={() => escolher(value)}
              className={`group relative overflow-hidden rounded-3xl ${fundo} flex flex-col items-start justify-center text-left gap-5 p-8 sm:p-12 min-h-[240px] lg:min-h-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground/20`}
            >
              <div
                className={`pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl ${halo}`}
                aria-hidden="true"
              />

              <Icone className={`h-9 w-9 ${acento}`} aria-hidden="true" />

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  {titulo}
                </h2>
                <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-sm leading-relaxed">
                  {descricao}
                </p>
              </div>

              <span
                className={`relative mt-1 inline-flex items-center gap-2 rounded-xl ${botao} px-6 py-3.5 text-base font-bold text-white transition-colors duration-200`}
              >
                {cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>

        <div className="px-6 pb-10 flex justify-center">
          <label className="inline-flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={e => setLembrar(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
            />
            Lembrar minha escolha e não perguntar de novo
          </label>
        </div>
      </main>
    </>
  );
}
