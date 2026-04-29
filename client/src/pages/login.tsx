import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0C0C0C' }}>
      {/* Ambient Glow Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: '#A3E635', opacity: 0.04 }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: '#A3E635', opacity: 0.03 }}
        />
        <div
          className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ background: '#818CF8', opacity: 0.03 }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo & Branding */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex justify-center mb-4">
              <Logo size={48} showText={false} />
            </div>

            <h1
              className="mb-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: '28px',
                color: '#F5F5F5',
                letterSpacing: '-0.02em',
              }}
            >
              jobthrive
            </h1>

            <p
              className="text-sm"
              style={{ color: '#525252', fontFamily: 'Inter, sans-serif' }}
            >
              land your dream role, faster
            </p>

            {/* Feature Pills */}
            <motion.div
              className="flex items-center justify-center gap-3 mt-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(109, 91, 247, 0.12)',
                  color: '#A3E635',
                  border: '1px solid rgba(109, 91, 247, 0.2)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Referrals
              </span>
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(29, 185, 84, 0.12)',
                  color: '#A3E635',
                  border: '1px solid rgba(29, 185, 84, 0.2)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Coaching
              </span>
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(255, 114, 98, 0.12)',
                  color: '#FB923C',
                  border: '1px solid rgba(255, 114, 98, 0.2)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Earn Rs.499+
              </span>
            </motion.div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#1C1C1C',
              border: '1px solid #1F1F1F',
            }}
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
                  <div
                    className="p-3.5 rounded-xl flex items-center space-x-3"
                    style={{
                      backgroundColor: 'rgba(255, 114, 98, 0.1)',
                      border: '1px solid rgba(255, 114, 98, 0.2)',
                    }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#FB923C' }} />
                    <span className="text-sm font-medium flex-1" style={{ color: '#FB923C' }}>
                      {error}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign-In Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full font-semibold py-6 px-6 rounded-xl text-base flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg border-0 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#F5F5F5',
                  color: '#0C0C0C',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <p className="text-xs mb-3" style={{ color: '#525252', fontFamily: 'Inter, sans-serif' }}>
              Trusted by 500+ professionals
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {['Google', 'Microsoft', 'Amazon', 'Meta'].map((company) => (
                <span
                  key={company}
                  className="px-3 py-1 rounded-full text-[11px] font-medium"
                  style={{
                    backgroundColor: '#141414',
                    color: '#A3A3A3',
                    border: '1px solid #1F1F1F',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {company}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-xs" style={{ color: '#3F3F3F', fontFamily: 'Inter, sans-serif' }}>
              <a href="/terms" className="hover:underline transition-colors duration-200" style={{ color: '#3F3F3F' }}>
                Terms
              </a>
              {' \u00B7 '}
              <a href="/privacy" className="hover:underline transition-colors duration-200" style={{ color: '#3F3F3F' }}>
                Privacy
              </a>
              {' \u00B7 '}
              <a href="/refund" className="hover:underline transition-colors duration-200" style={{ color: '#3F3F3F' }}>
                Refund
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
