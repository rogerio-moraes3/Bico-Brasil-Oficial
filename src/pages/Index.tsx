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
  const acentoTexto = contratar ? "text-bico-accent" : "text-bico-work";
  const acentoBotao = contratar
    ? "bg-bico-accent hover:bg-bico-accent-hover"
    : "bg-bico-work hover:bg-bico-work-hover";

  return (
    <>
      <Helmet>
        <title>Bico Brasil</title>
        <meta name="description" content={`Bico Brasil — ambiente ${ambiente.rotulo}`} />
      </Helmet>

      <div className="flex min-h-dvh flex-col bg-background">
        <Header />

        <main id="main-content" className={`flex-1 ${ambiente.fundo}`}>
          <ProfileCompletionWidget />

          <section className="mx-auto w-full max-w-3xl px-5 pb-12 pt-10 sm:pt-14">
            {/* Badge do ambiente: diz em 1 segundo onde a pessoa esta. */}
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${ambiente.pontinho}`} aria-hidden="true" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Ambiente · {ambiente.rotulo}
              </span>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">{saudacao}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {ambiente.titulo}
            </h1>

            {/* Duas acoes, sem caixa em volta de cada uma: separadas por uma
                unica linha. Menos borda, mais tipografia. */}
            <div className="mt-10 divide-y divide-border/50 border-y border-border/50">
              {ambiente.acoes.map(({ icone: Icone, titulo, descricao, cta, destino }) => (
                <button
                  key={destino}
                  type="button"
                  onClick={() => navigate(destino)}
                  className="group flex w-full items-start gap-4 py-7 text-left transition-opacity hover:opacity-80"
                >
                  <Icone className={`mt-0.5 h-6 w-6 shrink-0 ${acentoTexto}`} aria-hidden="true" />
                  <span className="flex-1">
                    <span className="block text-lg font-bold text-foreground sm:text-xl">{titulo}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {descricao}
                    </span>
                    <span
                      className={`mt-4 inline-flex items-center gap-1.5 rounded-lg ${acentoBotao} px-4 py-2 text-sm font-bold text-white transition-colors`}
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

            {/* Categorias: atalho de busca de profissional, entao so existem no
                ambiente CONTRATAR. Antes apareciam pra todo mundo, inclusive
                pra quem esta procurando bico. Mesmo destino de sempre. */}
            {contratar && (
              <nav className="mt-10" aria-label="Categorias populares">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Categorias populares
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORIAS.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => navigate(`/search-workers?q=${encodeURIComponent(cat)}`)}
                      className="rounded-full bg-foreground/[0.04] px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.08]"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </nav>
            )}
          </section>

          {/* Conteudo de apoio, um por ambiente: quem contrata ve
              profissionais, quem trabalha ve quem esta chegando na praca. */}
          {contratar ? <FeaturedServicesSection /> : <RecentWorkersSection />}

          {/* Prova social institucional — vale para os dois, nao e um dos CTAs. */}
          <PlatformAuthoritySection />
        </main>

        <Footer />
      </div>
    </>
  );
}
