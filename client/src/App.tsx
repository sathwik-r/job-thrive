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

function Router() {
  const { user, loading, validateToken } = useAuth();
  const [location, setLocation] = useLocation();

  // Global authentication check on app start
  useEffect(() => {
    const checkInitialAuth = async () => {
      if (!loading && user) {
        // Validate stored token on app start
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
        // Check if onboarding is completed
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
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center text-white">
          <div className="animate-float mb-4">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7l12-4-4 12m0 0L8 15m8 0V7M8 15l0-8"
                ></path>
              </svg>
            </div>
          </div>
          <p className="text-lg opacity-90">Loading...</p>
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
        {() => (
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        )}
      </Route>
      <Route path="/job-search">
        {() => (
          <AuthGuard>
            <JobSearchPage />
          </AuthGuard>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        )}
      </Route>
      <Route path="/profile-settings">
        {() => (
          <AuthGuard>
            <ProfileSettingsPage />
          </AuthGuard>
        )}
      </Route>
      <Route path="/analytics">
        {() => (
          <AuthGuard>
            <AnalyticsPage />
          </AuthGuard>
        )}
      </Route>
      <Route path="/referral-request/:jobId">
        {(params) => (
          <AuthGuard>
            <ReferralRequestPage jobId={params.jobId} />
          </AuthGuard>
        )}
      </Route>
      <Route path="/">
        {() => (
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        )}
      </Route>
      <Route path="/coaching" >
        {() => (
          <AuthGuard>
            <CoachingDashboard />
          </AuthGuard>
        )}
      </Route>
      <Route path="/post-login" component={PostLoginPage} />
      <Route component={() => <div>404 Not Found</div>} />
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
