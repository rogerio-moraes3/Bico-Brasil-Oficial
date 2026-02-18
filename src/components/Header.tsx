import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, ArrowLeft, User as UserIcon, Download, Bell, ChevronRight, Home, CreditCard, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "./ThemeToggle";
import { CitySelector } from "./CitySelector";
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
        clearDeferredPwaPrompt(); // Clear global
      }
    };
    updateDisplayMode();

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPwaPrompt(e); // Save globally
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
      clearDeferredPwaPrompt(); // Clear global
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleInstalled);
    mediaQuery.addEventListener('change', updateDisplayMode);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleInstalled);
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

      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 text-foreground backdrop-blur-xl shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container flex h-16 items-center justify-between px-2 md:px-4">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => safeGoBack(navigate)}
                aria-label="Voltar"
                className="text-[var(--nav-link)] shadow-md font-bold shrink-0 h-11 w-11 rounded-full flex items-center justify-center bg-card/70 backdrop-blur"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            )}

            <Link to={user ? "/app" : "/"} className="flex items-center gap-2 flex-shrink-0 z-50 hover:opacity-90 transition-opacity">
              <img src={logo} alt="Bico Brasil" className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-2xl shadow-sm" />
              <div className="flex flex-col justify-center">
                <span className="text-base md:text-lg font-bold leading-tight whitespace-nowrap text-foreground">
                  Bico Brasil
                </span>
                <span className="text-xs text-muted-foreground leading-tight font-medium whitespace-nowrap uppercase tracking-wider">
                  Trabalhou, Tá Pago.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 z-40">
            <Link
              to="/app"
              className={`text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:text-[var(--nav-link-hover)] whitespace-nowrap ${location.pathname === '/' || location.pathname === '/app'
                ? 'text-[var(--nav-link-hover)] dark:text-primary'
                : 'text-[var(--nav-link)]'
                }`}
            >
              Início
            </Link>
            <Link
              to="/premium"
              className={`text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:text-[var(--nav-link-hover)] whitespace-nowrap ${location.pathname === '/premium'
                ? 'text-[var(--nav-link-hover)] dark:text-primary'
                : 'text-[var(--nav-link)]'
                }`}
            >
              Planos
            </Link>
            <Link
              to="/download"
              className="text-sm font-medium transition-colors hover:text-[var(--nav-link-hover)] flex items-center gap-2 text-[var(--nav-link)]"
            >
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">Baixar App</span>
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-2 bg-card/70 border border-border/60 rounded-full px-2 py-1 shadow-sm backdrop-blur">
              <ThemeToggle />
            </div>
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
            </div>
            {/* Badge de Publicações Grátis */}
            {user && (
              <FreePostsBadge />
            )}

            {/* Notification Bell */}
            {user && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-full bg-card/70 backdrop-blur shadow-sm">
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
                  <Button variant="ghost" size="sm" className="gap-2 hidden md:flex rounded-full bg-card/70 backdrop-blur shadow-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={
                          user?.user_metadata?.avatar_url ||
                          user?.user_metadata?.picture
                        }
                      />  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{getUserDisplayName()}</span>
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
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                  size="sm"
                  className="hidden md:flex text-xs font-semibold uppercase tracking-[0.2em] bg-card/80 hover:bg-muted border border-border text-foreground"
                >
                  Cadastre-se
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  size="sm"
                  className="hidden md:flex text-xs font-semibold uppercase tracking-[0.2em] bg-card/80 hover:bg-muted border border-border text-foreground"
                >
                  Entrar
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu de navegação" className="h-11 w-11 flex items-center justify-center rounded-full bg-card/70 backdrop-blur shadow-sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] p-0">
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
                        <p className="text-xs text-muted-foreground truncate">
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



      {!(location.pathname.startsWith('/procurar-bicos') || location.pathname.startsWith('/search-workers')) && <CitySelector />}
    </>
  );
};
