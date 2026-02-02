import { useEffect, useState } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // After 1.2 seconds, start fade-out (faster for better UX)
        const fadeTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 1200);

        // After 1.5 seconds, call onComplete (faster)
        const completeTimer = setTimeout(() => {
            setIsVisible(false);
            onComplete();
        }, 1500);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'
                }`}
            style={{ backgroundColor: '#0E1424' }}
        >
            {/* Container centralizado com espaçamento consistente */}
            <div className="flex flex-col items-center gap-5 px-4">
                {/* Logo/Mascote */}
                <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                    <img
                        src="/worker-mascot.png"
                        alt="Bico Brasil"
                        className="w-full h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>

                {/* Título - BICO BRASIL */}
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide text-center leading-tight">
                    BICO BRASIL
                </h1>

                {/* Slogan - Trabalhou, Tá Pago! */}
                <p className="text-base md:text-lg font-semibold text-primary tracking-wide text-center">
                    Trabalhou, Tá Pago!
                </p>
            </div>
        </div>
    );
};
