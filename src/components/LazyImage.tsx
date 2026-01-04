// ========================================
// LAZY LOADING DE IMAGENS - OTIMIZAÇÃO
// ========================================
// Componente para carregar imagens de forma otimizada

import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

/**
 * Componente de imagem com lazy loading
 * - Só carrega quando está visível na tela
 * - Mostra placeholder enquanto carrega
 * - Melhora performance em listagens com muitas imagens
 * 
 * USO:
 * <LazyImage src="/foto.jpg" alt="Foto" className="w-full" />
 */
export const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E'
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Intersection Observer para detectar quando imagem entra na tela
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Imagem está visível, carregar
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Começar a carregar 50px antes de aparecer
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
    />
  );
};
