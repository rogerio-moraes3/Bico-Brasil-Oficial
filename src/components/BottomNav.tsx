import { Link, useLocation } from "react-router-dom";
import { Home, Briefcase, Search, User } from "lucide-react";
import { useUserMode } from "@/contexts/UserModeContext";

export const BottomNav = () => {
  const location = useLocation();
  const { mode } = useUserMode();

  const isActive = (path: string) => location.pathname === path;

  // Cor dinâmica baseada no modo
  const activeColor = mode === 'contractor'
    ? 'text-blue-500'
    : 'text-green-500';

  const indicatorColor = mode === 'contractor'
    ? 'bg-blue-500'
    : 'bg-green-500';

  // 4 itens fixos para navegação principal
  const navItems = [
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 shadow-lg">
      {/* Indicador de modo */}
      <div className={`h-1 ${indicatorColor} transition-colors duration-300`} />

      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 rounded-lg ${isActive(path)
                ? `${activeColor} scale-105`
                : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            <Icon className={`h-6 w-6 ${isActive(path) ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className={`text-xs font-medium ${isActive(path) ? 'font-semibold' : ''}`}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
