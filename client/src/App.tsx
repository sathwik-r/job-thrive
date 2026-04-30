import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import JobSearchPage from "@/pages/job-search";
import ReferralRequestPage from "@/pages/referral-request";
import ProfilePage from "@/pages/profile";
import AnalyticsPage from "@/pages/analytics";
import PostLoginOnboarding from "@/pages/post-login-onboarding";
import PostLoginPage from "@/pages/post-login";
import ProfileSettingsPage from "@/pages/profile-settings";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import AuthGuard from "@/components/auth-guard";
import { AuthProvider } from "@/hooks/use-auth";
import CoachingDashboard from "./pages/coaching-dashboard";
import TermsPage from "./pages/terms";
import PrivacyPage from "./pages/privacy";
import RefundPage from "./pages/refund";
import Logo from "./components/logo";

function Router() {
  const { user, loading, validateToken } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkInitialAuth = async () => {
      if (!loading && user) {
        const isTokenValid = await validateToken();
        if (!isTokenValid) {
          setLocation('/login');
        }
      }
    };
    checkInitialAuth();
  }, [loading, user, validateToken, setLocation]);

  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["/login", "/post-login", "/terms", "/privacy", "/refund"];
      if (!user && !publicRoutes.includes(location)) {
        setLocation("/login");
      } else if (user && location === "/login") {
        if (!user.onboardingCompleted) {
          setLocation("/onboarding");
        } else {
          setLocation("/dashboard");
        }
      }
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0C0C' }}>
        <div className="text-center">
          <Logo size={40} showText={false} className="justify-center mb-4 animate-float" />
          <p className="text-sm font-medium" style={{ color: '#525252' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/refund" component={RefundPage} />
      <Route path="/onboarding">
        {() =>
          user ? (
            <PostLoginOnboarding onComplete={() => setLocation("/dashboard")} />
          ) : (
            <LoginPage />
          )
        }
      </Route>
      <Route path="/dashboard">
        {() => (<AuthGuard><DashboardPage /></AuthGuard>)}
      </Route>
      <Route path="/job-search">
        {() => (<AuthGuard><JobSearchPage /></AuthGuard>)}
      </Route>
      <Route path="/profile">
        {() => (<AuthGuard><ProfilePage /></AuthGuard>)}
      </Route>
      <Route path="/profile-settings">
        {() => (<AuthGuard><ProfileSettingsPage /></AuthGuard>)}
      </Route>
      <Route path="/analytics">
        {() => (<AuthGuard><AnalyticsPage /></AuthGuard>)}
      </Route>
      <Route path="/referral-request/:jobId">
        {(params) => (<AuthGuard><ReferralRequestPage jobId={params.jobId} /></AuthGuard>)}
      </Route>
      <Route path="/">
        {() => (<AuthGuard><DashboardPage /></AuthGuard>)}
      </Route>
      <Route path="/coaching">
        {() => (<AuthGuard><CoachingDashboard /></AuthGuard>)}
      </Route>
      <Route path="/post-login" component={PostLoginPage} />
      <Route component={() => (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0C0C' }}>
          <div className="text-center">
            <p className="text-6xl font-black mb-2" style={{ color: '#F5F5F5' }}>404</p>
            <p className="text-sm" style={{ color: '#525252' }}>Page not found</p>
          </div>
        </div>
      )} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
