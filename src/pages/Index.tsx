import { Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowRight, Briefcase, Megaphone, Search, UserPlus } from "lucide-react";
import { useUserMode } from "@/contexts/UserModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedServicesSection } from "@/components/FeaturedServicesSection";
import { PlatformAuthoritySection } from "@/components/PlatformAuthoritySection";
import { RecentWorkersSection } from "@/components/RecentWorkersSection";
import { ProfileCompletionWidget } from "@/components/ProfileCompletionWidget";

const CATEGORIAS = ["Pedreiro", "Diarista", "Eletricista", "Jardineiro", "Pintor", "Serviços Gerais", "Outros"];

export default function Index() {
  const navigate = useNavigate();
  const { mode, isModeResolved, hasChosenMode } = useUserMode();
  const { user } = useAuth();

  // Enquanto o modo nao resolveu, nao pinta nada: evita mostrar a tela de um
  // ambiente e trocar para o outro na frente do usuario.
  if (!isModeResolved) {
    return <div className="min-h-dvh bg-background" aria-busy="true" />;
  }

  // Quem ainda nao escolheu ambiente vai para o portao. Nao faz sentido ter o
  // hero de escolha aqui E um portao separado — o portao e a escolha.
  if (!hasChosenMode) {
    return <Navigate to="/escolher-ambiente" replace />;
  }

  const contratar = mode === "contractor";

  const saudacao = (() => {
    const bruto = user?.user_metadata?.name?.split(" ")[0] || user?.email?.split("@")[0];
    const nome = bruto && bruto.length > 0 ? bruto : null;
    const h = new Date().getHours();
    const periodo = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    return nome ? `${periodo}, ${nome}` : periodo;
  })();

  // Um ambiente, duas acoes. Nada de misturar os dois publicos na mesma tela:
  // quem esta em CONTRATAR nao ve acao de TRABALHAR e vice-versa.
  const ambiente = contratar
    ? {
        rotulo: "Contratar",
        titulo: "O que você precisa resolver?",
        pontinho: "bg-bico-accent",
        fundo: "bg-bico-accent/[0.05]",
        // Alimentam --bb-env / --bb-env-soft: o selo circular, a barrinha de
        // titulo e o halo do hero saem todos daqui. Cores da marca.
        cor: "#5B8DEF",
        corSuave: "rgba(91, 141, 239, 0.30)",
        acoes: [
          {
            icone: Search,
            titulo: "Encontrar um profissional",
            descricao: "Busque quem já faz esse serviço perto de você.",
            cta: "Buscar profissionais",
            destino: "/search-workers",
          },
          {
            icone: Megaphone,
            titulo: "Publicar uma vaga",
            descricao: "Descreva o que precisa e deixe os profissionais virem até você.",
            cta: "Publicar vaga",
            destino: "/post-job",
          },
        ],
      }
    : {
        rotulo: "Trabalhar",
        titulo: "O que você quer fazer?",
        pontinho: "bg-bico-work",
        fundo: "bg-bico-work/[0.05]",
        cor: "#12B886",
        corSuave: "rgba(18, 184, 134, 0.30)",
        acoes: [
          {
            icone: Briefcase,
            titulo: "Encontrar um bico",
            descricao: "Veja as oportunidades abertas na sua cidade.",
            cta: "Encontrar bicos",
            destino: "/procurar-bicos",
          },
          {
            icone: UserPlus,
            titulo: "Oferecer meu serviço",
            descricao: "Apareça nas buscas de quem está contratando.",
            cta: "Oferecer meu serviço",
            destino: "/offer-services",
          },
        ],
      };

  // Cor do ambiente so na tonalizacao de fundo do main e nos elementos de
  // acao — nunca a tela inteira pintada. O wrapper mantem bg-background
  // opaco: sem ele a tonalizacao de 5% e translucida e deixa passar o fundo
  // escuro do body, jogando texto escuro sobre fundo escuro.
  const acentoBotao = contratar
    ? "bg-bico-accent hover:bg-bico-accent-hover"
    : "bg-bico-work hover:bg-bico-work-hover";

  return (
    <>
      <Helmet>
        <title>Bico Brasil</title>
        <meta name="description" content={`Bico Brasil — ambiente ${ambiente.rotulo}`} />
      </Helmet>

      <div
        className="flex min-h-dvh flex-col bg-background"
        style={{ ["--bb-env" as string]: ambiente.cor, ["--bb-env-soft" as string]: ambiente.corSuave }}
      >
        <Header />

        <main id="main-content" className="flex-1">
          <ProfileCompletionWidget />

          {/* HERO — gradiente escuro com halo da cor do ambiente por cima,
              nunca cor chapada. bb-on-dark: qualquer foco aqui dentro usa o
              anel claro do Lote C. */}
          <section className="bb-hero bb-on-dark">
            <div
              className="bb-hero-glow -right-24 -top-40 h-[28rem] w-[28rem] sm:-right-10"
              aria-hidden="true"
            />

            <div className="bb-container relative py-14 sm:py-20">
              <div className="bb-measure">
                {/* Badge do ambiente: diz em 1 segundo onde a pessoa esta. */}
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${ambiente.pontinho}`} aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                    Ambiente · {ambiente.rotulo}
                  </span>
                </div>

                <p className="mt-7 text-sm text-white/70">{saudacao}</p>
                <h1 className="bb-h1 mt-1.5 text-white">{ambiente.titulo}</h1>
              </div>
            </div>
          </section>

          {/* Conteudo: tonalizacao de 5% do ambiente, sobre o fundo opaco do
              wrapper (sem ele o texto escuro cai em cima do body escuro). */}
          <div className={ambiente.fundo}>
            <section className="bb-container py-14 sm:py-20">
              <div className="bb-measure">
                {/* Duas acoes, sem caixa em volta de cada uma: separadas por
                    uma unica linha. Menos borda, mais tipografia. */}
                <div className="divide-y divide-border/50 border-y border-border/50">
                  {ambiente.acoes.map(({ icone: Icone, titulo, descricao, cta, destino }) => (
                    <button
                      key={destino}
                      type="button"
                      onClick={() => navigate(destino)}
                      className="group flex w-full items-start gap-4 py-8 text-left sm:gap-5 sm:py-10"
                    >
                      {/* Selo circular solido, icone branco dentro. */}
                      <span className="bb-badge-icon" aria-hidden="true">
                        <Icone className="h-6 w-6" strokeWidth={1.9} />
                      </span>

                      <span className="flex-1">
                        <span className="block text-lg font-bold text-foreground sm:text-xl">
                          {titulo}
                        </span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                          {descricao}
                        </span>
                        <span
                          className={`bb-cta mt-5 inline-flex items-center gap-2 ${acentoBotao} px-5 py-2.5 text-sm font-bold text-white group-hover:-translate-y-0.5`}
                        >
                          {cta}
                          <ArrowRight
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                {/* Categorias: atalho de busca de profissional, entao so
                    existem no ambiente CONTRATAR. Mesmo destino de sempre. */}
                {contratar && (
                  <nav className="mt-14" aria-label="Categorias populares">
                    <p className="bb-title-rule text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Categorias populares
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2.5">
                      {CATEGORIAS.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => navigate(`/search-workers?q=${encodeURIComponent(cat)}`)}
                          className="rounded-full bg-foreground/[0.04] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.08]"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </nav>
                )}
              </div>
            </section>

            {/* Conteudo de apoio, um por ambiente: quem contrata ve
                profissionais, quem trabalha ve quem esta chegando na praca. */}
            {contratar ? <FeaturedServicesSection /> : <RecentWorkersSection />}

            {/* Prova social institucional — vale para os dois, nao e um dos CTAs. */}
            <PlatformAuthoritySection />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
