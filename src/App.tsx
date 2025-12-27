import { useEffect, useState } from "react";
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
import { MobileAppBanner } from "./components/MobileAppBanner";
import { BottomNav } from "./components/BottomNav";
import { NotificationPrompt } from "./components/NotificationPrompt";
import { AdminIcon } from "./components/AdminIcon";
import { SplashScreen } from "./components/SplashScreen";
import Index from "./pages/Index";
import SalesLandingPage from "./pages/SalesLandingPage";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import Auth from "./pages/Auth";
import RecoverByCPF from "./pages/RecoverByCPF";
import Admin from "./pages/Admin";
import AdminJobs from "./pages/AdminJobs";
import AdminServices from "./pages/AdminServices";
import AdminPayments from "./pages/AdminPayments";
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
import Analytics from "./pages/Analytics";
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
import Ranking from "./pages/Ranking";
import ProcurarBicos from "./pages/ProcurarBicos";
import DownloadPage from "./pages/Download";
import EditJob from "./pages/EditJob";
import EditService from "./pages/EditService";
import JobDetails from "./pages/JobDetails";
import PublicStats from "./pages/PublicStats";
import AuthCallback from "./pages/AuthCallback";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Limpar caches antigos na inicialização
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('bico-brasil-v') && !name.includes('v26')) {
            caches.delete(name);
          }
        });
      });
    }
  }, []);

  // Mostrar splash screen na primeira carga
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <UserModeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <MobileAppBanner />
            <NotificationPrompt />
            <AdminIcon />
            <AccessGuard>
              <Routes>
                <Route path="/" element={<SalesLandingPage />} />
                <Route path="/app" element={<Index />} />
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
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                <Route path="/payment-pending" element={<PaymentPending />} />
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
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
                <Route path="/premium" element={
                  <ProtectedRoute>
                    <Premium />
                  </ProtectedRoute>
                } />
                <Route path="/payment-history" element={
                  <ProtectedRoute>
                    <PaymentHistory />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={<About />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/search-workers" element={<SearchWorkers />} />
                <Route path="/offer-services" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <OfferServices />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/procurar-bicos" element={<ProcurarBicos />} />
                <Route path="/download" element={<DownloadPage />} />
                <Route path="/relacao-usuarios" element={<PublicStats />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AccessGuard>
            <BottomNav />
          </NotificationProvider>
        </AuthProvider>
      </UserModeProvider>
    </BrowserRouter>
  );
}

export default App;
