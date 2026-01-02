import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, ArrowLeft, User as UserIcon, Download, Bell } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "./ThemeToggle";
import { CitySelector } from "./CitySelector";
import { PWAInstallButton } from "./PWAInstallButton";
import { FreePostsBadge } from "./FreePostsBadge";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { cn, safeGoBack } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { NotificationsPanel } from "./NotificationsPanel";
import { useUserMode } from "@/contexts/UserModeContext";
import { ModeToggle } from "./ModeToggle";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { mode, setMode } = useUserMode();
  const [open, setOpen] = useState(false);
  const showBackButton = location.pathname !== "/" && location.pathname !== "/landing";

  const navItems = [
    { path: "/", label: "Início" },
    { path: "/premium", label: "Planos" },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Ir para conteúdo principal
      </a>

      <header className="sticky top-0 z-50 w-full border-b border-[#0A1A2F]/20 bg-[#0A1A2F] text-white">
        <div className="container flex h-16 items-center justify-between px-2 md:px-4">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => safeGoBack(navigate)}
                className="md:hidden text-primary shadow-md font-bold shrink-0"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            )}

            <Link to="/app" className="flex items-center gap-2 flex-shrink-0 z-50 hover:opacity-90 transition-opacity">
              <img src={logo} alt="Bico Brasil" className="h-8 w-8 md:h-10 md:w-10 shrink-0" />
              <div className="flex flex-col justify-center">
                <span className="text-sm md:text-base font-bold leading-tight whitespace-nowrap text-white">
                  Bico Brasil
                </span>
                <span className="text-[8px] md:text-[9px] text-white/60 leading-tight font-medium whitespace-nowrap uppercase tracking-wider">
                  Trabalhou, Tá Pago.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 z-40">
            <Link
              to="/app"
              className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-white/80 whitespace-nowrap ${location.pathname === '/' || location.pathname === '/app' ? 'text-primary' : 'text-white/90'
                }`}
            >
              Início
            </Link>
            <Link
              to="/premium"
              className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-white/80 whitespace-nowrap ${location.pathname === '/premium' ? 'text-primary' : 'text-white/90'
                }`}
            >
              Planos
            </Link>
            <Link
              to="/download"
              className="text-sm font-medium transition-colors hover:text-white/80 flex items-center gap-1 text-white/90"
            >
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">Baixar App</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {/* Badge de Publicações Grátis */}
            {user && (
              <FreePostsBadge />
            )}

            {/* Mode Toggle (Contratar/Trabalhar) */}
            <div className="hidden lg:block ml-4">
              <ModeToggle />
            </div>

            <PWAInstallButton />
            <ThemeToggle />

            {/* Notification Bell */}
            {user && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[95vw] sm:w-[540px] p-0">
                  <NotificationsPanel />
                </SheetContent>
              </Sheet>
            )}

            {/* User Menu or Login Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hidden md:flex">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={
                        user.user_metadata?.profile_photo ||
                        user.user_metadata?.picture ||
                        user.user_metadata?.avatar_url
                      } />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserIcon className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/post-job')}>
                    Publicar Trabalho
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" variant="default" className="hidden md:flex">
                <Link to="/auth?mode=login">Entrar</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu de navegação">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  <div className="px-2 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Modo de Uso</p>
                    <ModeToggle />
                  </div>
                  {user && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{getUserDisplayName()}</p>
                        <p className="text-xs text-muted-foreground break-words whitespace-normal">{user.email}</p>
                      </div>
                    </div>
                  )}
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavClick(item.path)}
                    >
                      {item.label}
                    </Button>
                  ))}
                  {user ? (
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                    >
                      Sair
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="justify-start"
                      onClick={() => handleNavClick('/auth?mode=login')}
                    >
                      Entrar / Cadastrar
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>



      <CitySelector />
    </>
  );
};
