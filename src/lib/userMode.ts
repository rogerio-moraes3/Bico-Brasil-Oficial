export type UserMode = "contractor" | "professional";

// Destino "home" de cada modo — a mesma regra que o botao Buscar do BottomNav
// ja usava. Fica aqui pra existir um lugar so que sabe disso.
export const modeHome = (mode: UserMode) =>
  mode === "contractor" ? "/search-workers" : "/procurar-bicos";

// Telas que so fazem sentido num modo. Serve tanto pra troca de modo quanto
// pra quem chega por link direto ou botao voltar.
export const MODE_ONLY_ROUTES: Record<string, UserMode> = {
  "/post-job": "contractor",
  "/offer-services": "professional",
};
