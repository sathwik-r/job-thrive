import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import OnboardingPage from './onboarding';

export default function LoginPage() {
  const { signInWithGoogle, loading, error, signOut } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleGetStarted = () => {
    setShowOnboarding(false);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      // Error is already handled by the auth hook
    }
  };

  // Always show onboarding first for new users
  if (showOnboarding) {
    return <OnboardingPage onComplete={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-40 right-16 w-24 h-24 bg-white/5 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-md animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto glassmorphism rounded-3xl flex items-center justify-center animate-float">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l12-4-4 12m0 0L8 15m8 0V7M8 15l0-8"></path>
                </svg>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur-xl opacity-70"></div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Welcome to <span className="gradient-text-white">Job Thrive</span>
            </h1>
            <p className="text-white/80 text-lg mb-2">Your job referral marketplace</p>
            <p className="text-white/60 text-sm">Connect with Gmail to unlock opportunities</p>
          </div>

          {/* Login Card */}
          <div className="glassmorphism rounded-3xl p-8 backdrop-blur-xl border border-white/20 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-300/30 rounded-2xl flex items-center space-x-3 backdrop-blur-lg">
                <AlertCircle className="w-5 h-5 text-red-200" />
                <span className="text-red-100 text-sm font-medium">{error}</span>
              </div>
            )}
            
            {/* Main Login Button */}
            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-[var(--dark-gray)] font-semibold py-6 px-6 rounded-2xl text-lg flex items-center justify-center space-x-4 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 mb-4"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{loading ? 'Signing in...' : 'Continue with Gmail'}</span>
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60 font-medium">or for testing</span>
              </div>
            </div>
            
            {/* Demo Login Button for Testing */}
            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-2xl text-base border border-white/30 backdrop-blur-lg transition-all duration-300 transform hover:scale-105"
            >
              {loading ? 'Signing in...' : '🚀 Demo Login (Testing)'}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/50 text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            {/* Debug: Clear storage button for testing */}
            <button 
              onClick={signOut}
              className="text-white/30 hover:text-white/50 text-xs mt-4 underline"
            >
              Clear Storage (Dev Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
