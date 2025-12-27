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
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Container centralizado com fade-in */}
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">

                {/* Título Superior - BICO BRASIL */}
                <h1 className="text-4xl font-bold text-[#10B981] tracking-wide">
                    BICO BRASIL
                </h1>

                {/* Bonequinho Trabalhador */}
                <div className="w-64 h-64 flex items-center justify-center">
                    {/* Imagem do bonequinho trabalhador */}
                    <img
                        src="/uploaded_image_0_1766799557829.png"
                        alt="Trabalhador Bico Brasil"
                        className="w-full h-full object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Slogan Inferior - TRABALHOU, TÁ PAGO! */}
                <p className="text-4xl font-bold text-[#10B981] tracking-wide">
                    TRABALHOU, TÁ PAGO!
                </p>
            </div>

            {/* Loading indicator sutil */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
};
