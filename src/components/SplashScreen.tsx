import { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
    /**
     * true quando o app ja esta montado e a sessao resolvida. A splash so sai
     * depois disso — antes, com dois setTimeout fixos (1500/1800ms), ela saia
     * no relogio e o app so COMECAVA a carregar ali, somando os dois tempos.
     * Agora o app carrega por tras e a splash e so uma cortina por cima.
     */
    ready: boolean;
    onComplete: () => void;
}

/** Tempo minimo na tela: abaixo disso a splash vira um piscar desagradavel. */
const MINIMO_MS = 400;
/** Teto de seguranca: se a prontidao nunca chegar, nao prende o usuario aqui. */
const TETO_MS = 2500;
/** Igual a duracao da transicao de opacidade do CSS abaixo. */
const FADE_MS = 300;

export const SplashScreen = ({ ready, onComplete }: SplashScreenProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [minimoCumprido, setMinimoCumprido] = useState(false);
    const [semMascote, setSemMascote] = useState(false);
    const saindo = useRef(false);

    useEffect(() => {
        const t = setTimeout(() => setMinimoCumprido(true), MINIMO_MS);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const sair = () => {
            if (saindo.current) return;
            saindo.current = true;
            setIsFadingOut(true);
            setTimeout(() => {
                setIsVisible(false);
                onComplete();
            }, FADE_MS);
        };

        if (ready && minimoCumprido) {
            sair();
            return;
        }

        const teto = setTimeout(sair, TETO_MS);
        return () => clearTimeout(teto);
    }, [ready, minimoCumprido, onComplete]);

    if (!isVisible) return null;

    return (
        <div
            // aria-hidden: o app ja esta montado por tras: para leitores de tela
            // o conteudo real e o que vale, a cortina visual nao deve ser lida.
            aria-hidden="true"
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 bg-[#0E1424] ${isFadingOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Container centralizado com espaçamento consistente */}
            <div className="flex flex-col items-center gap-6 px-4">
                {/* Logo/Mascote. Se a imagem falhar, entra um monograma no MESMO
                    tamanho: o `display:none` de antes deixava um buraco de
                    192x192px e empurrava o texto pra cima. */}
                <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                    {semMascote ? (
                        <div className="flex h-full w-full items-center justify-center rounded-3xl bg-white/[0.07] text-5xl md:text-6xl font-extrabold tracking-tight text-white/80">
                            BB
                        </div>
                    ) : (
                        <img
                            src="/worker-mascot.png"
                            alt=""
                            className="w-full h-full object-contain drop-shadow-2xl"
                            onError={() => setSemMascote(true)}
                        />
                    )}
                </div>

                {/* Título - BICO BRASIL */}
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide text-center leading-tight">
                    BICO BRASIL
                </h1>

                {/* Slogan - Trabalhou, Tá Pago! */}
                <p className="text-lg md:text-xl font-semibold text-primary tracking-wide text-center">
                    Trabalhou, Tá Pago!
                </p>

                {/* Loading dots. motion-reduce desliga o salto para quem pediu
                    menos animacao no sistema; os pontos continuam visiveis. */}
                <div className="flex gap-1.5 mt-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce motion-reduce:animate-none [animation-delay:0ms]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce motion-reduce:animate-none [animation-delay:150ms]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce motion-reduce:animate-none [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
};
