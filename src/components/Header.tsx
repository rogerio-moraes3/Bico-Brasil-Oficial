import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, ArrowLeft, User as UserIcon, Download, Bell, ChevronRight, Home, CreditCard, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "./ThemeToggle";
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
import { Separator } from "./ui/separator";
import { BeforeInstallPromptEvent, getDeferredPwaPrompt, setDeferredPwaPrompt, clearDeferredPwaPrompt } from "@/lib/pwaPrompt";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { mode, setMode } = useUserMode();
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Show back button on internal routes (public paths excluded) or when there is a history stack
  const publicPaths = ['/', '/landing', '/auth', '/install', '/install-app', '/download', '/pre-launch', '/prelaunch'];
  const hasHistory = typeof window !== 'undefined' && window.history && window.history.length > 1;
  const showBackButton = hasHistory || !publicPaths.some(p => location.pathname.startsWith(p));

  // PWA Install Detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const updateDisplayMode = () => {
      setShowInstallButton(!mediaQuery.matches);
      if (mediaQuery.matches) {
        setDeferredPrompt(null);
        clearDeferredPwaPrompt();
      }
    };
    updateDisplayMode();

    // Listen to custom event from App.tsx instead of beforeinstallprompt
    const handlePwaPromptAvailable = () => {
      const prompt = getDeferredPwaPrompt();
      if (prompt && !window.matchMedia('(display-mode: standalone)').matches) {
        setDeferredPrompt(prompt);
        setShowInstallButton(true);
      }
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
      clearDeferredPwaPrompt();
    };

    window.addEventListener('pwa-prompt-available', handlePwaPromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', updateDisplayMode);

    // Check if prompt is already available
    const existingPrompt = getDeferredPwaPrompt();
    if (existingPrompt && !mediaQuery.matches) {
      setDeferredPrompt(existingPrompt);
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('pwa-prompt-available', handlePwaPromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', updateDisplayMode);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      // Fallback: navigate to install page
      navigate('/install-app');
      setOpen(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
    clearDeferredPwaPrompt(); // Clear global
    setOpen(false);
  };

const navItems = [
    { path: "/", label: "Início", icon: Home },
    { path: "/premium", label: "Planos", icon: CreditCard },
  ];

  const saasNavLinks = [
    { path: "/", label: "Home" },
    { path: "/procurar-bicos", label: "Procurar bicos" },
    { path: "/premium", label: "Premium" },
    { path: "/about", label: "Sobre" },
    { path: "/FAQ", label: "Ajuda" },
    { path: "/contact", label: "Contato" },
  ];

  const isPublicLanding = publicPaths.some(p => location.pathname.startsWith(p));

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

<header className="sticky top-0 z-50 w-full mx-auto h-24 bg-gradient-to-r from-[#0B1F3A] to-[#0F2A4D] text-white border-b border-white/10 shadow-sm backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
  <div className="container mx-auto h-24 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => safeGoBack(navigate)}
                aria-label="Voltar"
                className="text-[var(--nav-link)] shrink-0 h-11 w-11 min-h-[44px] rounded-full flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            <Link to={user ? "/app" : "/"} className="flex items-center gap-2 flex-shrink-0 z-50 hover:opacity-90 transition-opacity">
              <img src={logo} alt="Bico Brasil" className="h-9 w-9 md:h-16 md:w-16 shrink-0 rounded-2xl shadow-sm" />
              <div className="flex flex-col justify-center">
                <span className="text-[25px] font-bold leading-tight whitespace-nowrap text-white">
                  Bico Brasil
                </span>
                <span className="sr-only sm:not-sr-only text-xs text-zinc-400 leading-tight font-bold whitespace-nowrap uppercase tracking-wider">
                  Trabalhou, Tá Pago.
                </span>
                <span className="sr-only sm:not-sr-only text-xs text-zinc-400 leading-tight font-bold whitespace-nowrap uppercase tracking-wider">
                  Contratou, Tá feito.
                </span>
              </div>
            </Link>
          </div>

          {isPublicLanding && (
            <nav className="hidden md:flex items-center gap-8 mx-auto">
              {saasNavLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "text-lg font-medium text-white/80 hover:text-white hover:opacity-90 hover:underline decoration-white/30 underline-offset-4 transition-all duration-300 py-1",
                    location.pathname === path && "font-semibold text-white underline decoration-white underline-offset-4"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
          { !isPublicLanding && (
            <nav className="hidden md:flex items-center gap-2 z-40 ml-4">
              <Link
                to="/app"
                className={cn(
                  "relative text-[13px] font-bold transition-all duration-300 px-4 py-2 rounded-full",
                  location.pathname === '/' || location.pathname === '/app'
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                Início
              </Link>
              <Link
                to="/premium"
                className={cn(
                  "relative text-[13px] font-bold transition-all duration-300 px-4 py-2 rounded-full",
                  location.pathname === '/premium'
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                Planos
              </Link>
              <Link
                to="/download"
                className="relative text-[13px] font-bold transition-all duration-300 px-4 py-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden lg:inline">Baixar App</span>
              </Link>
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-1">
            <ThemeToggle className="hover:bg-white/10 rounded-lg transition-colors" />
            {/* Notification Bell */}
            {user && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-11 w-11 min-h-[44px] rounded-full transition-colors">
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
                  <Button variant="ghost" size="sm" className="gap-2 hidden md:flex rounded-full border border-white/10 h-9 px-2.5 hover:bg-white/5 transition-colors text-white">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={
                          user?.user_metadata?.avatar_url ||
                          user?.user_metadata?.picture
                        }
                      />  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline text-sm font-medium">{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserIcon className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isPublicLanding ? (
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => navigate('/auth')}
                  className="text-[15px] font-bold text-white/80 hover:text-white hover:opacity-90 transition-colors px-4 py-2"
                >
                  Entrar
                </button>
                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                  className="text-[15px] font-bold bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-10"
                >
                  Criar conta
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3 ml-2">
                <button
                  onClick={() => navigate('/auth')}
                  className="hidden md:flex text-[13px] font-bold text-white/80 hover:text-white transition-colors"
                >
                  Entrar
                </button>
                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                  size="sm"
                  className="hidden md:flex text-[13px] font-bold px-6 h-9 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-white hover:bg-zinc-200 text-black border border-transparent"
                >
                  Criar conta grátis
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu de navegação" className="h-11 w-11 min-h-[44px] flex items-center justify-center rounded-full transition-colors">
                  <Menu className="md:hidden h-10 w-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0B1F3A] text-white border-white/10">
                <div className="flex flex-col h-full">
                  {/* Header do Menu */}
                  {user && (
                    <div className="flex items-center gap-3 p-4 border-b border-border">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs bg-[#0B1F3A] text-white border-white/10 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Menu Items - ListGroup Style */}
                  <nav className="flex-1 overflow-y-auto py-2">
                    {user ? (
                      <div className="space-y-1 px-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 h-12 px-3"
                          onClick={() => handleNavClick('/profile')}
                        >
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="flex-1 text-left">Meu Perfil</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Button>

                        {navItems.map((item) => (
                          <Button
                            key={item.path}
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 px-3"
                            onClick={() => handleNavClick(item.path)}
                          >
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        ))}

                        <Separator className="my-2" />

                        {showInstallButton && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 px-3"
                            onClick={handleInstallApp}
                          >
                            <Download className="h-5 w-5 text-muted-foreground" />
                            <span className="flex-1 text-left">Instalar App</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}

                        <Separator className="my-2" />

                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 h-12 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            signOut();
                            setOpen(false);
                          }}
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="flex-1 text-left">Sair</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1 px-2">
                        {navItems.map((item) => (
                          <Button
                            key={item.path}
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 px-3"
                            onClick={() => handleNavClick(item.path)}
                          >
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        ))}

                        {showInstallButton && (
                          <>
                            <Separator className="my-2" />
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 h-12 px-3"
                              onClick={handleInstallApp}
                            >
                              <Download className="h-5 w-5 text-muted-foreground" />
                              <span className="flex-1 text-left">Instalar App</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </>
                        )}

                        <Separator className="my-2" />

                        <Button
                          variant="default"
                          className="w-full justify-center h-12 mx-2"
                          onClick={() => handleNavClick('/auth?mode=login')}
                        >
                          Entrar / Cadastrar
                        </Button>
                      </div>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};
