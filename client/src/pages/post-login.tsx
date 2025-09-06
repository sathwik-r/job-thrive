import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth, type AuthData } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

const PostLoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setAuthData, setLoading: setGlobalAuthLoading } = useAuth();


  useEffect(() => {
    // Prevent multiple executions of the callback
    if (window.location.search.includes('processed=true')) {
      setLoading(false);
      return;
    }

    const handleCognitoCallback = async () => {
      try {
        setGlobalAuthLoading(true);
        // Extract the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          setError('Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        if (!code) {
          setError('No authorization code received from Cognito.');
          setLoading(false);
          return;
        }

        // Mark URL as processed to prevent re-execution
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('processed', 'true');
        window.history.replaceState({}, document.title, newUrl.toString());

        // Send code to backend for secure token exchange
        const response = await apiRequest('POST', '/api/auth/cognito-callback', {
          code,
          redirectUri: window.location.origin + '/post-login'
        });
        
        const authData: AuthData = await response.json();

        // Store user and auth data
        setAuthData(authData);
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Simple redirect based on onboarding status
        if (!authData.user.onboardingCompleted) {
          setLocation('/onboarding');
        } else {
          setLocation('/dashboard');
        }
        
      } catch (error) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
      } finally {
        setGlobalAuthLoading(false);
      }
    };

    handleCognitoCallback();
  }, []); // Empty dependency array to run only once

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center text-white">
          <div className="animate-float mb-4">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <p className="text-lg opacity-90">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
          <p className="text-lg opacity-90 mb-6">{error}</p>
          <button
            onClick={() => setLocation('/login')}
            className="bg-white text-purple-600 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null; // This should never render as we redirect on success
};

export default PostLoginPage;