import React, { useEffect, useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { UserModeProvider } from "./contexts/UserModeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProfileCompletionGuard } from "./components/ProfileCompletionGuard";
import { AccessGuard } from "./components/AccessGuard";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { ServiceWorkerUpdatePrompt } from "./components/ServiceWorkerUpdatePrompt";
import { MobileAppBanner } from "./components/MobileAppBanner";
import { BottomNav } from "./components/BottomNav";
import { NotificationPrompt } from "./components/NotificationPrompt";
import { AdminIcon } from "./components/AdminIcon";
import { SplashScreen } from "./components/SplashScreen";
import { Gatekeeper } from "./components/Gatekeeper";
import { BeforeInstallPromptEvent, setDeferredPwaPrompt } from "@/lib/pwaPrompt";
// Todas as páginas são lazy-loaded (code splitting por rota) — o bundle
// principal estava em 1,2MB (346KB gzip) com só 5 rotas divididas; isso
// reduz o chunk inicial e adia o download de cada página pro momento em
// que ela é realmente visitada.
const Index = lazy(() => import("./pages/Index"));
const SalesLandingPage = lazy(() => import("./pages/SalesLandingPage"));
const Home = lazy(() => import("./pages/Home"));
const Jobs = lazy(() => import("./pages/Jobs"));
const PostJob = lazy(() => import("./pages/PostJob"));
const Auth = lazy(() => import("./pages/Auth"));
const RecoverByCPF = lazy(() => import("./pages/RecoverByCPF"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminJobs = lazy(() => import("./pages/AdminJobs"));
const AdminServices = lazy(() => import("./pages/AdminServices"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const Profile = lazy(() => import("./pages/Profile"));
const PreLaunchLanding = lazy(() => import("./pages/PreLaunchLanding"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const PaymentPending = lazy(() => import("./pages/PaymentPending"));
const Messages = lazy(() => import("./pages/Messages"));
const Analytics = lazy(() => import("./pages/Analytics"));
const WorkerProfile = lazy(() => import("./pages/WorkerProfile"));
const Appointments = lazy(() => import("./pages/Appointments"));
const InstallApp = lazy(() => import("./pages/InstallApp"));
const Premium = lazy(() => import("./pages/Premium"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const About = lazy(() => import("./pages/About"));
const FAQPage = lazy(() => import("./pages/FAQ"));
const SearchWorkers = lazy(() => import("./pages/SearchWorkers"));
const OfferServices = lazy(() => import("./pages/OfferServices"));
const WantToWork = lazy(() => import("./pages/WantToWork"));
const WantSomeone = lazy(() => import("./pages/WantSomeone"));
const Ranking = lazy(() => import("./pages/Ranking"));
const ProcurarBicos = lazy(() => import("./pages/ProcurarBicos"));
const DownloadPage = lazy(() => import("./pages/Download"));
const EditJob = lazy(() => import("./pages/EditJob"));
const EditService = lazy(() => import("./pages/EditService"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const PublicStats = lazy(() => import("./pages/PublicStats"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Em modo standalone (PWA instalado), o sistema já mostra sua própria
    // splash nativa a partir do manifest.json antes do app carregar — exibir
    // essa splash React de novo em seguida criava duas splashes em sequência,
    // com artes diferentes. Pulamos direto para o app quando já é standalone.
    const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return false;
    // Mostrar splash apenas se não foi exibido nesta sessão
    return !sessionStorage.getItem('splashShown');
  });

  useEffect(() => {
    // CENTRAL PWA CAPTURE: Handle beforeinstallprompt at app level to prevent conflicts
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent default behavior
      e.preventDefault();
      console.log('✅ [APP LEVEL] beforeinstallprompt captured - stored globally');
      
      // Store globally for all components to access
      setDeferredPwaPrompt(e);
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
    };

    // Listen for app install
    const handleAppInstalled = () => {
      console.log('✅ App installed successfully');
      setDeferredPwaPrompt(null);
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    };

    // Register listeners at app level ONLY (before components mount)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    // CRITICAL FIX: Detect auth errors from URL to prevent login loops
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error === 'server_error' || errorDescription) {
      // Remove error params from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      // Show user-friendly message
      import('@/hooks/use-toast').then(({ useToast }) => {
        const { toast } = useToast();
        toast({
          title: "Erro de autenticação",
          description: "Houve um problema ao fazer login. Por favor, tente novamente.",
          variant: "destructive"
        });
      });
    }
  }, []);

  // Mostrar splash screen apenas uma vez por sessão
  if (showSplash) {
    return <SplashScreen onComplete={() => {
      sessionStorage.setItem('splashShown', 'true');
      setShowSplash(false);
    }} />;
  }

  return (
    <BrowserRouter>
      <UserModeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Gatekeeper />
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <ServiceWorkerUpdatePrompt />
            <MobileAppBanner />
            <NotificationPrompt />
            <AdminIcon />
            <div className="main-safe-bottom">
              <AccessGuard>
                <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  <Route path="/" element={<SalesLandingPage />} />
                  <Route path="/app" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/intro" element={<SalesLandingPage />} />
                  <Route path="/landing" element={<PreLaunchLanding />} />
                  <Route path="/jobs" element={
                    <ProfileCompletionGuard>
                      <Jobs />
                    </ProfileCompletionGuard>
                  } />
                  <Route path="/post-job" element={
                    <ProtectedRoute>
                      <ProfileCompletionGuard>
                        <PostJob />
                      </ProfileCompletionGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/cadastro" element={<Auth />} />
                  <Route path="/recover-cpf" element={<RecoverByCPF />} />
                  <Route path="/edit-job/:id" element={
                    <ProtectedRoute>
                      <ProfileCompletionGuard>
                        <EditJob />
                      </ProfileCompletionGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/edit-service/:id" element={
                    <ProtectedRoute>
                      <ProfileCompletionGuard>
                        <EditService />
                      </ProfileCompletionGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/jobs/:id" element={
                    <ProfileCompletionGuard>
                      <JobDetails />
                    </ProfileCompletionGuard>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                  <Route path="/complete-profile" element={
                    <ProtectedRoute>
                      <CompleteProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfileCompletionGuard>
                        <Profile />
                      </ProfileCompletionGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
                  <Route path="/admin/jobs" element={<ProtectedRoute requireAdmin={true}><AdminJobs /></ProtectedRoute>} />
                  <Route path="/admin/services" element={<ProtectedRoute requireAdmin={true}><AdminServices /></ProtectedRoute>} />
                  <Route path="/admin/payments" element={<ProtectedRoute requireAdmin={true}><AdminPayments /></ProtectedRoute>} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-failed" element={<PaymentFailed />} />
                  <Route path="/payment-pending" element={<PaymentPending />} />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <ProfileCompletionGuard>
                        <Analytics />
                      </ProfileCompletionGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/worker/:id" element={<WorkerProfile />} />
                  <Route path="/user/:id" element={<WorkerProfile />} />
                  <Route path="/profile/:id" element={<WorkerProfile />} />
                  <Route path="/appointments" element={
                    <ProtectedRoute>
                      <ProfileCompletionGuard>
                        <Appointments />
                      </ProfileCompletionGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/install-app" element={<InstallApp />} />
                  <Route path="/premium" element={<Premium />} />
                  <Route path="/payment-history" element={
                    <ProtectedRoute>
                      <PaymentHistory />
                    </ProtectedRoute>
                  } />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/search-workers" element={<ProtectedRoute><SearchWorkers /></ProtectedRoute>} />
                  <Route path="/offer-services" element={
                    <ProtectedRoute>
                      <ProfileCompletionGuard>
                        <OfferServices />
                      </ProfileCompletionGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/want-to-work" element={<ProtectedRoute><WantToWork /></ProtectedRoute>} />
                  <Route path="/want-someone" element={<ProtectedRoute><WantSomeone /></ProtectedRoute>} />
                  <Route path="/ranking" element={<Ranking />} />
                  <Route path="/procurar-bicos" element={<ProcurarBicos />} />
                  <Route path="/download" element={<DownloadPage />} />
                  <Route path="/relacao-usuarios" element={<PublicStats />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </AccessGuard>
            </div>
            <BottomNav />
          </NotificationProvider>
        </AuthProvider>
      </UserModeProvider>
    </BrowserRouter >
  );
}

export default App;
