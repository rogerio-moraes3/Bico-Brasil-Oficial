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
  fundo: string;
};

// Ordem de leitura: CONTRATAR (azul) a esquerda, TRABALHAR (verde) a direita.
// Cada metade e preenchida com a cor solida da marca e recebe um degrade
// escuro muito suave por cima: sem ele, texto branco sobre bico-accent fica em
// 3.2:1 e sobre bico-work em 2.6:1, os dois reprovados em AA. Com o degrade
// (nunca abaixo de 30% de preto onde ha texto) ficam em 5.9:1 e 4.9:1, e a
// leitura de "azul solido / verde solido" se mantem.
const AMBIENTES: Ambiente[] = [
  {
    value: "contractor",
    titulo: "Quero contratar",
    descricao: "Encontre profissionais ou publique uma vaga.",
    cta: "Entrar para contratar",
    icone: Search,
    fundo: "bg-bico-accent",
  },
  {
    value: "professional",
    titulo: "Quero trabalhar",
    descricao: "Encontre bicos, oportunidades e clientes na sua cidade.",
    cta: "Entrar para trabalhar",
    icone: Briefcase,
    fundo: "bg-bico-work",
  },
];

/**
 * Portao interno (pos-login). Momento a parte: tela cheia, sem header e sem
 * BottomNav (ver BottomNav.tsx).
 *
 * Painel cheio dividindo a tela ao meio — cada metade vai ate a borda, sem
 * card e sem canto arredondado, e o bloco inteiro e o alvo de clique. No
 * mobile as metades empilham.
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

      <main className="relative min-h-dvh">
        <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
          {AMBIENTES.map(({ value, titulo, descricao, cta, icone: Icone, fundo }) => (
            <button
              key={value}
              type="button"
              onClick={() => escolher(value)}
              className={`group relative ${fundo} flex min-h-[50dvh] flex-col items-center justify-center gap-5 px-8 pb-24 pt-24 text-center lg:py-16 transition-[filter] duration-200 hover:brightness-[1.06] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/50 lg:min-h-dvh`}
            >
              {/* Degrade de legibilidade — ver comentario em AMBIENTES. */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/34 to-black/42"
                aria-hidden="true"
              />

              <div className="relative flex flex-col items-center gap-5">
                <Icone className="h-10 w-10 text-white" strokeWidth={1.75} aria-hidden="true" />

                <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  {titulo}
                </h2>

                <p className="max-w-xs text-base leading-relaxed text-white sm:text-lg">
                  {descricao}
                </p>

                <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-white underline-offset-4 group-hover:underline sm:text-base">
                  {cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Titulo sobre a divisa, como uma etiqueta — nao pertence a nenhum dos
            dois lados. pointer-events-none pra nao roubar o clique do painel. */}
        <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center px-4 sm:top-8">
          <h1 className="rounded-full bg-[#0B1C2E] px-6 py-3 text-xl font-extrabold tracking-tight text-white shadow-lg sm:px-8 sm:text-2xl">
            O que você quer fazer?
          </h1>
        </div>

        {/* Checkbox adaptado ao painel: a mesma etiqueta escura, para ficar
            legivel por cima de qualquer uma das duas metades. */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center px-4 sm:bottom-8">
          <label className="inline-flex cursor-pointer select-none items-center gap-2.5 rounded-full bg-[#0B1C2E] px-5 py-2.5 text-sm text-white/90 shadow-lg">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={e => setLembrar(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-white/30 accent-white"
            />
            Lembrar minha escolha e não perguntar de novo
          </label>
        </div>
      </main>
    </>
  );
}
