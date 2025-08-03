import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';

const PostLoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (!code) {
          setError('No authorization code received');
          return;
        }

        console.log('Processing Google OAuth callback with code:', code);
        
      
        await fetch('/auth/google/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })  // this is the code from the URL
        });

        // if (response.redirected) {
        //   // If server redirects, follow it
        //   window.location.href = response.url;
        //   return;
        // }

        // if (!response.ok) {
        //   throw new Error(`Authentication failed: ${response.status}`);
        // }

        // If successful, redirect to dashboard or onboarding
        setLocation('/dashboard');
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [setLocation]);

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
          <p className="text-lg opacity-90 mb-4">{error}</p>
          <button 
            onClick={() => setLocation('/login')}
            className="px-6 py-2 bg-white/20 rounded-xl backdrop-blur-lg hover:bg-white/30 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="text-center text-white">
        <p className="text-lg opacity-90">Redirecting...</p>
      </div>  
    </div>
  );
};

export default PostLoginPage;