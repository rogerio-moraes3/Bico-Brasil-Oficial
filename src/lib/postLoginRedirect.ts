// Guarda pra onde o usuário deve voltar depois de logar/cadastrar, quando o
// login foi disparado a partir de uma ação que exige conta (ex: tentar
// contatar um prestador estando deslogado). Sem isso, Auth.tsx sempre
// mandava pra /app, e a pessoa tinha que refazer a busca do zero.
//
// sessionStorage (não localStorage) de propósito: só deve valer pra essa
// aba/sessão de navegação, não deve sobreviver nem vazar entre sessões.
const REDIRECT_PATH_KEY = 'postLoginRedirectPath';
const AUTO_CONTACT_WORKER_ID_KEY = 'postLoginAutoContactWorkerId';

export function savePostLoginRedirect(path: string, autoContactWorkerId?: string) {
  try {
    sessionStorage.setItem(REDIRECT_PATH_KEY, path);
    if (autoContactWorkerId) {
      sessionStorage.setItem(AUTO_CONTACT_WORKER_ID_KEY, autoContactWorkerId);
    }
  } catch {
    // sessionStorage indisponível (modo privado restrito, etc.) — sem redirect salvo,
    // cai no fallback padrão (/app). Não é motivo pra travar o fluxo de login.
  }
}

// Lê e limpa o destino salvo — consumo único, pra não reusar num login futuro.
export function consumePostLoginRedirectPath(): string | null {
  try {
    const path = sessionStorage.getItem(REDIRECT_PATH_KEY);
    sessionStorage.removeItem(REDIRECT_PATH_KEY);
    return path;
  } catch {
    return null;
  }
}

// Separado do path de propósito: consumido em outro momento do fluxo (depois
// que a página de destino já montou), não junto do redirect em si.
export function consumeAutoContactWorkerId(): string | null {
  try {
    const workerId = sessionStorage.getItem(AUTO_CONTACT_WORKER_ID_KEY);
    sessionStorage.removeItem(AUTO_CONTACT_WORKER_ID_KEY);
    return workerId;
  } catch {
    return null;
  }
}
