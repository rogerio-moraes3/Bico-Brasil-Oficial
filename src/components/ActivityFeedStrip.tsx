import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";

// Curated static activity messages — marketplace feel, no backend needed
const ACTIVITIES = [
  { name: "João V.", action: "publicou serviço de Pintura", city: "São Paulo" },
  { name: "Carla M.", action: "contratou eletricista", city: "Campinas" },
  { name: "Roberto S.", action: "publicou serviço de Faxina", city: "Rio de Janeiro" },
  { name: "Ana P.", action: "encontrou pedreiro", city: "Belo Horizonte" },
  { name: "Marcos L.", action: "publicou serviço de Jardinagem", city: "Curitiba" },
  { name: "Fernanda G.", action: "contratou diarista", city: "Porto Alegre" },
  { name: "Diego R.", action: "publicou serviço de Instalação", city: "Fortaleza" },
  { name: "Priscila N.", action: "contratou pintor", city: "Manaus" },
  { name: "Thiago C.", action: "publicou serviço de Encanamento", city: "Salvador" },
  { name: "Juliana O.", action: "encontrou ajudante de mudança", city: "Recife" },
];

const VISIBLE = 2; // items shown at once
const INTERVAL_MS = 3800;

export const ActivityFeedStrip = () => {
  const [offset, setOffset] = useState(0);
  const [fading, setFading] = useState(false);

  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      fadeTimeoutRef.current = setTimeout(() => {
        setOffset((prev) => (prev + 1) % ACTIVITIES.length);
        setFading(false);
      }, 300);
    }, INTERVAL_MS);
    return () => {
      clearInterval(timer);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  const visible = Array.from({ length: VISIBLE }, (_, i) => {
    const idx = (offset + i) % ACTIVITIES.length;
    return { ...ACTIVITIES[idx], key: idx };
  });

  return (
    <div
      className="w-full border-b border-border/50 bg-background py-2 px-4 overflow-hidden"
      aria-label="Atividade recente na plataforma"
    >
      <div className="container mx-auto flex items-center gap-3">
        {/* Label */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary shrink-0">
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline uppercase tracking-[0.18em]">Agora</span>
        </div>

        {/* Feed items */}
        <div
          className="flex flex-wrap gap-x-4 gap-y-0.5 overflow-hidden"
          style={{ transition: "opacity 300ms ease", opacity: fading ? 0 : 1 }}
          aria-live="polite"
          aria-atomic="true"
        >
          {visible.map((item, i) => (
            <span key={`${item.key}-${i}`} className="text-xs text-muted-foreground whitespace-nowrap">
              <span className="font-semibold text-foreground">{item.name}</span>{" "}
              {item.action}{" "}
              <span className="text-primary font-medium">em {item.city}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
