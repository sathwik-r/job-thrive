import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireOnboarding = true }) => {
  const { user, loading, validateToken } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          setLocation('/login');
          return;
        }

        try {
          // Validate token with backend
          const isTokenValid = await validateToken();
          if (!isTokenValid) {
            setAuthError('Authentication expired. Please sign in again.');
            setTimeout(() => setLocation('/login'), 2000);
            return;
          }

          // Check onboarding if required
          if (requireOnboarding && !user.onboardingCompleted) {
            setLocation('/onboarding');
            return;
          }

          setIsValidating(false);
        } catch (error) {
          setAuthError('Authentication check failed. Please sign in again.');
          setTimeout(() => setLocation('/login'), 2000);
        }
      }
    };

    checkAuth();
  }, [user, loading, validateToken, requireOnboarding, setLocation]);

  // Set up periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!isValidating || !user) return;

    const interval = setInterval(async () => {
      try {
        const isTokenValid = await validateToken();
        if (!isTokenValid) {
          setLocation('/login');
        }
      } catch (error) {
        setLocation('/login');
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isValidating, user, validateToken, setLocation]);

  // Show error message if authentication failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center text-white">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-3xl flex items-center justify-center backdrop-blur-lg">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-lg opacity-90 mb-6">{authError}</p>
          <p className="text-sm opacity-75">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (loading || isValidating) {
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

  // If we get here, user is authenticated and meets all requirements
  return <>{children}</>;
};

export default AuthGuard;
