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
import Index from "./pages/Index";
import SalesLandingPage from "./pages/SalesLandingPage";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import Auth from "./pages/Auth";
import RecoverByCPF from "./pages/RecoverByCPF";
const Admin = lazy(() => import("./pages/Admin"));
const AdminJobs = lazy(() => import("./pages/AdminJobs"));
const AdminServices = lazy(() => import("./pages/AdminServices"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
import Profile from "./pages/Profile";
import PreLaunchLanding from "./pages/PreLaunchLanding";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentPending from "./pages/PaymentPending";
import Messages from "./pages/Messages";
const Analytics = lazy(() => import("./pages/Analytics"));
import WorkerProfile from "./pages/WorkerProfile";
import Appointments from "./pages/Appointments";
import InstallApp from "./pages/InstallApp";
import Premium from "./pages/Premium";
import CompleteProfile from "./pages/CompleteProfile";
import PaymentHistory from "./pages/PaymentHistory";
import About from "./pages/About";
import FAQPage from "./pages/FAQ";
import SearchWorkers from "./pages/SearchWorkers";
import OfferServices from "./pages/OfferServices";
import WantToWork from "./pages/WantToWork";
import WantSomeone from "./pages/WantSomeone";
import Ranking from "./pages/Ranking";
import ProcurarBicos from "./pages/ProcurarBicos";
import DownloadPage from "./pages/Download";
import EditJob from "./pages/EditJob";
import EditService from "./pages/EditService";
import JobDetails from "./pages/JobDetails";
import PublicStats from "./pages/PublicStats";
import AuthCallback from "./pages/AuthCallback";

function App() {
  const [showSplash, setShowSplash] = useState(() => {
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
                  <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<div className="p-8 text-center">Carregando painel administrativo...</div>}><Admin /></Suspense></ProtectedRoute>} />
                  <Route path="/admin/jobs" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<div className="p-8 text-center">Carregando Jobs...</div>}><AdminJobs /></Suspense></ProtectedRoute>} />
                  <Route path="/admin/services" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<div className="p-8 text-center">Carregando serviços administrativos...</div>}><AdminServices /></Suspense></ProtectedRoute>} />
                  <Route path="/admin/payments" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<div className="p-8 text-center">Carregando pagamentos...</div>}><AdminPayments /></Suspense></ProtectedRoute>} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-failed" element={<PaymentFailed />} />
                  <Route path="/payment-pending" element={<PaymentPending />} />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <ProfileCompletionGuard>
                        <Suspense fallback={<div className="p-8 text-center">Carregando analytics...</div>}>
                          <Analytics />
                        </Suspense>
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
