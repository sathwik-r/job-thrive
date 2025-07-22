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
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user && location !== "/login") {
        setLocation("/login");
      } else if (user && location === "/login") {
        setLocation("/dashboard");
      }
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center text-white">
          <div className="animate-float mb-4">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l12-4-4 12m0 0L8 15m8 0V7M8 15l0-8"></path>
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
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/job-search" component={JobSearchPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/referral-request/:jobId">
        {(params) => <ReferralRequestPage jobId={params.jobId} />}
      </Route>
      <Route path="/">
        {() => user ? <DashboardPage /> : <LoginPage />}
      </Route>
      <Route component={() => <div>404 Not Found</div>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
