import { useEffect, useState } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // Após 1.7 segundos, iniciar fade-out
        const fadeTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 1700);

        // Após 2 segundos, chamar onComplete
        const completeTimer = setTimeout(() => {
            setIsVisible(false);
            onComplete();
        }, 2000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A1A2F] transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Container centralizado */}
            <div className="flex flex-col items-center gap-8">

                {/* Título Superior - BICO BRASIL */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide text-center">
                    BICO BRASIL
                </h1>

                {/* Bonequinho Trabalhador */}
                <div className="w-60 h-60 md:w-96 md:h-96 flex items-center justify-center">
                    <img
                        src="/worker-mascot.png"
                        alt="Trabalhador Bico Brasil"
                        className="w-full h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                            // Fallback se imagem não carregar
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>

                {/* Slogan Inferior - TRABALHOU, TÁ PAGO! */}
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary tracking-wide px-4 text-center">
                    TRABALHOU, TÁ PAGO!
                </p>
            </div>
        </div>
    );
};
