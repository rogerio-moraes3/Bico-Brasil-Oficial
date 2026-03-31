import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Briefcase, Search, User, ChevronLeft } from "lucide-react";
import { useUserMode } from "@/contexts/UserModeContext";
import { safeGoBack } from "@/lib/utils";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useUserMode();
  const [hidden, setHidden] = useState(false);

  // Simple hide-on-scroll: hide nav when scrolling down, show when scrolling up
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (y > lastY + 10) setHidden(true);
          else if (y < lastY - 10) setHidden(false);
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // Cor dinâmica baseada no modo
  const activeColor = 'text-primary';
  const indicatorColor = 'bg-primary';

  // 5 itens: Voltar + 4 itens fixos para navegação principal
  const navItems = [
    {
      path: "back",
      icon: ChevronLeft,
      label: "Voltar",
      isBack: true
    },
    {
      path: "/app",
      icon: Home,
      label: "Início"
    },
    {
      path: mode === 'contractor' ? "/search-workers" : "/procurar-bicos",
      icon: Search,
      label: "Buscar"
    },
    {
      path: "/jobs",
      icon: Briefcase,
      label: "Meus Bicos"
    },
    {
      path: "/profile",
      icon: User,
      label: "Perfil"
    },
  ];

  return (
    <nav
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-background/75 border-t border-slate-200/60 dark:border-border/50 z-50 shadow-[0_-12px_30px_-20px_hsl(var(--xp-primary-glow))] backdrop-blur-md transition-transform duration-300 ${hidden ? 'translate-y-full' : 'translate-y-0'}`}
    >
      {/* Gradient indicator line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, icon: Icon, label, isBack }) => {
          if (isBack) {
            return (
              <button
                key="back"
                onClick={() => safeGoBack(navigate)}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <Icon className="h-[22px] w-[22px] stroke-[1.5]" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 rounded-2xl ${isActive(path)
                  ? `${activeColor} scale-[1.04] bg-primary/10`
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
            >
              <Icon className={`h-[22px] w-[22px] ${isActive(path) ? 'stroke-2' : 'stroke-[1.5]'}`} />
              <span className={`text-[11px] font-medium ${isActive(path) ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
