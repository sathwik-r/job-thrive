import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/logo';
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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-40 right-16 w-24 h-24 bg-white/5 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-md animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-white/[0.03] rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo Section */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative mb-6 inline-block">
              <div className="w-20 h-20 mx-auto glassmorphism rounded-2xl flex items-center justify-center animate-float shadow-lg shadow-white/5">
                <Logo variant="white" size={64} showText={false} />
              </div>
              <div className="absolute -inset-3 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur-xl opacity-60 -z-10" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight leading-tight">
              Welcome to <span className="gradient-text-white">Job Thrive</span>
            </h1>
            <p className="text-white/75 text-base font-medium mb-1">Your shortcut to better jobs</p>
            <p className="text-white/50 text-sm font-normal">Connect with Gmail to unlock opportunities</p>
            <p className="text-white/60 text-sm font-normal mt-3 max-w-sm mx-auto leading-relaxed">
              Get real employee referrals, unlock hidden opportunities, and gain personal guidance from professionals working at your target companies.
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            className="glassmorphism rounded-3xl p-8 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 bg-red-500/15 border border-red-300/20 rounded-xl flex items-center space-x-3 backdrop-blur-lg">
                    <AlertCircle className="w-4 h-4 text-red-200 flex-shrink-0" />
                    <span className="text-red-100 text-sm font-medium flex-1">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Login Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 text-[var(--dark-gray)] font-semibold py-6 px-6 rounded-2xl text-base flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 border-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{loading ? 'Signing in...' : 'Continue with Gmail'}</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-white/50 text-xs leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-white/70 hover:text-white transition-colors duration-200 underline underline-offset-2">
                Terms & Conditions
              </a>
              ,{' '}
              <a href="/privacy" className="text-white/70 hover:text-white transition-colors duration-200 underline underline-offset-2">
                Privacy Policy
              </a>
              , and{' '}
              <a href="/refund" className="text-white/70 hover:text-white transition-colors duration-200 underline underline-offset-2">
                Refund Policy
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
