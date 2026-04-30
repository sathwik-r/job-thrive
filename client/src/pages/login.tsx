import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, ArrowUpRight, Zap, Shield, Clock } from 'lucide-react';
import Logo from '@/components/logo';
import { motion, AnimatePresence } from 'framer-motion';

const recentReferrals = [
  { name: "Priya S.", company: "Google", role: "SDE-2", time: "2h ago" },
  { name: "Amit K.", company: "Microsoft", role: "PM", time: "4h ago" },
  { name: "Sneha R.", company: "Amazon", role: "Data Scientist", time: "5h ago" },
  { name: "Rahul J.", company: "Flipkart", role: "Backend Dev", time: "8h ago" },
  { name: "Neha M.", company: "Swiggy", role: "Frontend Dev", time: "12h ago" },
  { name: "Vikram P.", company: "Razorpay", role: "DevOps", time: "1d ago" },
  { name: "Ananya D.", company: "Atlassian", role: "SRE", time: "1d ago" },
  { name: "Karthik S.", company: "Adobe", role: "Designer", time: "2d ago" },
];

const companies = [
  { name: "Google", logo: "https://logo.clearbit.com/google.com" },
  { name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com" },
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com" },
  { name: "Meta", logo: "https://logo.clearbit.com/meta.com" },
  { name: "Flipkart", logo: "https://logo.clearbit.com/flipkart.com" },
  { name: "Atlassian", logo: "https://logo.clearbit.com/atlassian.com" },
  { name: "Adobe", logo: "https://logo.clearbit.com/adobe.com" },
  { name: "Stripe", logo: "https://logo.clearbit.com/stripe.com" },
];

export default function LoginPage() {
  const { signInWithGoogle, loading, error } = useAuth();
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTickerIndex((p) => (p + 1) % recentReferrals.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
    try { await signInWithGoogle(); } catch (err) { /* handled */ }
  };

  const current = recentReferrals[tickerIndex];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative" style={{ background: '#0C0C0C' }}>
      {/* ── Subtle grid background ────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(163,230,53,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* ── Ambient glows ─────────────────────── */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.04) 0%, transparent 70%)' }} />

      {/* ── Left: Hero (60%) ──────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0 relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-xl">
          <Logo size={36} showText={false} className="mb-10" />

          <h1 className="text-4xl lg:text-[52px] font-black tracking-tight leading-[1.08] mb-5" style={{ color: '#F5F5F5' }}>
            Skip the queue.<br />
            <span style={{ color: '#A3E635' }}>Get referred directly.</span>
          </h1>

          <p className="text-base lg:text-lg leading-relaxed mb-8 max-w-md" style={{ color: '#A3A3A3' }}>
            Real employees at top companies refer you for <span className="font-bold" style={{ color: '#F5F5F5' }}>just Rs.499</span>.
            No cold applications. No waiting. Just results.
          </p>

          {/* Value props */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {[
              { icon: Zap, text: "Matched in 24 hours", color: '#A3E635' },
              { icon: Shield, text: "Refund guaranteed", color: '#818CF8' },
              { icon: Clock, text: "500+ successful referrals", color: '#FB923C' },
            ].map((v) => (
              <div key={v.text} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${v.color}12` }}>
                  <v.icon className="w-4 h-4" style={{ color: v.color }} />
                </div>
                <span className="text-sm font-medium" style={{ color: '#A3A3A3' }}>{v.text}</span>
              </div>
            ))}
          </div>

          {/* Live ticker */}
          <div className="mb-10 h-11 overflow-hidden rounded-xl px-4 flex items-center gap-3" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: '#A3E635' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest shrink-0" style={{ color: '#3F3F3F' }}>LIVE</span>
            <AnimatePresence mode="wait">
              <motion.p key={tickerIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                className="text-sm truncate" style={{ color: '#A3A3A3' }}>
                <span className="font-semibold" style={{ color: '#F5F5F5' }}>{current.name}</span>{' '}
                got referred for <span style={{ color: '#A3E635' }}>{current.role}</span> at{' '}
                <span className="font-semibold" style={{ color: '#F5F5F5' }}>{current.company}</span>
                <span className="ml-2" style={{ color: '#3F3F3F' }}>· {current.time}</span>
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Company logos */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#3F3F3F' }}>Professionals from these companies refer on jobthrive</p>
            <div className="flex flex-wrap gap-3">
              {companies.map((c) => (
                <div key={c.name} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                  <img src={c.logo} alt={c.name} className="w-4 h-4 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-xs font-medium" style={{ color: '#525252' }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right: Login (40%) ────────────────── */}
      <div className="lg:w-[440px] flex items-center justify-center px-8 py-12 lg:py-0 relative z-10" style={{ borderLeft: '1px solid #1F1F1F' }}>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-sm">

          {/* Login card */}
          <div className="rounded-2xl p-6" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <h2 className="text-xl font-black mb-1" style={{ color: '#F5F5F5' }}>Get started</h2>
            <p className="text-sm mb-6" style={{ color: '#525252' }}>Create your account in one click</p>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ background: '#EF444412', border: '1px solid #EF444420' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#EF4444' }} />
                  <span className="text-sm" style={{ color: '#EF4444' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google button */}
            <button onClick={handleSignIn} disabled={loading}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#A3E635', color: '#0C0C0C' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#0C0C0C" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#0C0C0C" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#0C0C0C" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#0C0C0C" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <p className="text-center text-[10px] mt-4" style={{ color: '#3F3F3F' }}>
              Free to sign up · Pay only when you apply
            </p>
          </div>

          {/* How it works */}
          <div className="mt-6 rounded-2xl p-5" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#3F3F3F' }}>How it works</p>
            <div className="space-y-4">
              {[
                { step: "1", text: "Browse 100+ jobs at top companies", sub: "Google, Amazon, Microsoft & more" },
                { step: "2", text: "Upload resume & pay Rs.499", sub: "Secure payment via Cashfree" },
                { step: "3", text: "Get referred by a real employee", sub: "Matched within 24 hours" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                    style={{ background: '#A3E63512', color: '#A3E635' }}>{s.step}</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>{s.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#525252' }}>{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { num: "500+", label: "Referrals" },
              { num: "95+", label: "Companies" },
              { num: "94%", label: "Success rate" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <p className="text-lg font-black" style={{ color: '#F5F5F5' }}>{s.num}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#3F3F3F' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] mt-6" style={{ color: '#3F3F3F' }}>
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline underline-offset-2 hover:text-[#525252]">Terms</a>,{' '}
            <a href="/privacy" className="underline underline-offset-2 hover:text-[#525252]">Privacy</a> &{' '}
            <a href="/refund" className="underline underline-offset-2 hover:text-[#525252]">Refund Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
