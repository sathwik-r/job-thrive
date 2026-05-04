import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, ArrowRight, Zap, Shield, Clock, Star, CheckCircle2, Users, Briefcase, TrendingUp, ChevronDown, FileText, IndianRupee, User, Building2 } from 'lucide-react';
import Logo from '@/components/logo';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const ticker = [
  { name: "Priya S.", company: "Google", role: "SDE-2", time: "2h ago" },
  { name: "Amit K.", company: "Microsoft", role: "Product Manager", time: "4h ago" },
  { name: "Sneha R.", company: "Amazon", role: "Data Scientist", time: "5h ago" },
  { name: "Rahul J.", company: "Flipkart", role: "Backend Dev", time: "8h ago" },
  { name: "Neha M.", company: "Swiggy", role: "Frontend Dev", time: "12h ago" },
];

const logos = [
  { n: "Google", u: "https://logo.clearbit.com/google.com" },
  { n: "Microsoft", u: "https://logo.clearbit.com/microsoft.com" },
  { n: "Amazon", u: "https://logo.clearbit.com/amazon.com" },
  { n: "Meta", u: "https://logo.clearbit.com/meta.com" },
  { n: "Flipkart", u: "https://logo.clearbit.com/flipkart.com" },
  { n: "Adobe", u: "https://logo.clearbit.com/adobe.com" },
  { n: "Atlassian", u: "https://logo.clearbit.com/atlassian.com" },
  { n: "Stripe", u: "https://logo.clearbit.com/stripe.com" },
  { n: "Razorpay", u: "https://logo.clearbit.com/razorpay.com" },
  { n: "Swiggy", u: "https://logo.clearbit.com/swiggy.com" },
];

const testimonials = [
  { name: "Riya Sharma", role: "Referred to Google", text: "Applied on a Friday, got my referral by Monday. The referrer even shared tips for my interview. Best Rs.499 I ever spent.", stars: 5 },
  { name: "Arjun Mehta", role: "Referred to Microsoft", text: "I was mass-applying for months with zero callbacks. One referral through Job Thrive and I had an interview within a week.", stars: 5 },
  { name: "Sneha Patel", role: "Referrer at Amazon", text: "I've earned over Rs.15,000 referring candidates. The platform handles everything — I just submit the referral.", stars: 5 },
];

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} id={id} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  );
}

// Referral flow animation — standalone section, NOT a background
function ReferralFlowAnimation() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timings = [2000, 1200, 1200, 1200, 1500, 2000];
    const t = setTimeout(() => setStep(s => s >= 5 ? 0 : s + 1), timings[step]);
    return () => clearTimeout(t);
  }, [step]);

  const steps = ['Seeker pays Rs.499', 'Matched with referrer', 'Resume shared', 'Referral submitted', 'Referrer earns Rs.249', 'Interview call!'];

  return (
    <div className="relative py-8">
      {/* Step labels */}
      <div className="flex items-center justify-between mb-10 px-4 max-w-2xl mx-auto">
        {steps.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <motion.div
              animate={{ background: step >= i ? '#A3E635' : '#1C1C1C', color: step >= i ? '#0C0C0C' : '#525252', scale: step === i ? 1.15 : 1 }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ border: `1.5px solid ${step >= i ? '#A3E635' : '#1F1F1F'}` }}
            >
              {step > i ? '✓' : i + 1}
            </motion.div>
            <span className="text-[8px] font-bold text-center leading-tight hidden md:block" style={{ color: step >= i ? '#D4D4D4' : '#525252' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Visual flow */}
      <div className="flex items-center justify-center gap-4 md:gap-8 px-4">
        {/* Seeker */}
        <motion.div animate={{ borderColor: step >= 0 ? '#A3E63530' : '#1F1F1F' }}
          className="rounded-2xl p-4 md:p-5 w-[130px] md:w-[150px] text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: '#A3E63510' }}>
            <User className="w-5 h-5" style={{ color: '#A3E635' }} />
          </div>
          <p className="text-xs font-bold" style={{ color: '#F5F5F5' }}>Job Seeker</p>
          <p className="text-[10px] mt-1" style={{ color: '#737373' }}>Pays Rs.499</p>
          <AnimatePresence>
            {step >= 5 && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 py-1 rounded-md" style={{ background: '#A3E63510' }}>
                <p className="text-[9px] font-bold" style={{ color: '#A3E635' }}>Got interview! 🎉</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Arrow + animated elements */}
        <div className="flex flex-col items-center gap-2 relative min-w-[80px] md:min-w-[120px]">
          {/* Connection line */}
          <div className="w-full h-px" style={{ background: '#1F1F1F' }} />

          {/* Animated badge traveling across */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="pay" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }}
                className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: '#A3E635', color: '#0C0C0C' }}>
                <IndianRupee className="w-3 h-3" /><span className="text-[10px] font-black">499</span>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="resume" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }}
                className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: '#818CF8', color: '#FFF' }}>
                <FileText className="w-3 h-3" /><span className="text-[10px] font-bold">Resume</span>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="earn" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
                className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: '#818CF8', color: '#FFF' }}>
                <IndianRupee className="w-3 h-3" /><span className="text-[10px] font-black">249</span>
              </motion.div>
            )}
            {(step === 1 || step === 3) && (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#A3E63520' }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: '#A3E635' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Referrer */}
        <motion.div animate={{ borderColor: step >= 1 ? '#818CF830' : '#1F1F1F' }}
          className="rounded-2xl p-4 md:p-5 w-[130px] md:w-[150px] text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: '#818CF810' }}>
            <Building2 className="w-5 h-5" style={{ color: '#818CF8' }} />
          </div>
          <p className="text-xs font-bold" style={{ color: '#F5F5F5' }}>Referrer</p>
          <p className="text-[10px] mt-1" style={{ color: '#737373' }}>At Google</p>
          <AnimatePresence>
            {step >= 3 && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 py-1 rounded-md" style={{ background: '#818CF810' }}>
                <p className="text-[9px] font-bold" style={{ color: '#818CF8' }}>{step >= 4 ? '+Rs.249 earned' : 'Referred ✓'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { signInWithGoogle, loading, error } = useAuth();
  const [ti, setTi] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTi(p => (p + 1) % ticker.length), 2800);
    return () => clearInterval(i);
  }, []);

  const signIn = async () => { try { await signInWithGoogle(); } catch {} };
  const t = ticker[ti];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0C0C0C' }}>

      {/* ══════════ CLEAN SUBTLE BACKGROUND — no competing elements ══════════ */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.04) 0%, transparent 60%)' }} />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.03) 0%, transparent 60%)' }} />
      </div>

      {/* ══════════ NAV ══════════ */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-16 py-5">
        <Logo size={28} showText={true} />
        <div className="flex items-center gap-3">
          <a href="#how-it-works" className="hidden md:block text-sm font-medium transition-colors hover:text-[#D4D4D4]" style={{ color: '#737373' }}>How it works</a>
          <a href="#pricing" className="hidden md:block text-sm font-medium transition-colors hover:text-[#D4D4D4]" style={{ color: '#737373' }}>Pricing</a>
          <button onClick={signIn} disabled={loading}
            className="flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-bold transition-all hover:brightness-110 active:scale-[0.97]"
            style={{ background: '#A3E635', color: '#0C0C0C' }}>
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ══════════ SECTION 1: HERO — Clean, focused, no distractions ══════════ */}
      <section className="relative z-10 px-6 lg:px-16 pt-16 lg:pt-28 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: '#A3E63508', border: '1px solid #A3E63515' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#A3E635' }} />
            <AnimatePresence mode="wait">
              <motion.span key={ti} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="text-xs font-medium" style={{ color: '#D4D4D4' }}>
                <span style={{ color: '#F5F5F5' }}>{t.name}</span> got referred for {t.role} at <span style={{ color: '#A3E635' }}>{t.company}</span>
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6" style={{ color: '#F5F5F5' }}>
            The referral platform<br />
            <span style={{ color: '#A3E635' }}>that pays everyone.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#D4D4D4' }}>
            <span style={{ color: '#F5F5F5' }}>Seekers</span> get referred to top companies for Rs.499.{' '}
            <span style={{ color: '#F5F5F5' }}>Referrers</span> earn Rs.249+ per referral. Everyone wins.
          </motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button onClick={signIn} disabled={loading}
              className="flex items-center gap-3 h-14 px-8 rounded-xl text-base font-black transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#A3E635', color: '#0C0C0C', boxShadow: '0 0 40px rgba(163,230,53,0.15)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#0C0C0C" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#0C0C0C" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#0C0C0C" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#0C0C0C" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {loading ? 'Signing in...' : 'Get Started — Free'}
            </button>
            <span className="text-sm" style={{ color: '#737373' }}>No credit card · Browse jobs free</span>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-4" style={{ background: '#EF444412', border: '1px solid #EF444420' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                <span className="text-sm" style={{ color: '#EF4444' }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-10 lg:gap-14">
            {[
              { n: "500+", l: "Referrals" },
              { n: "95+", l: "Companies" },
              { n: "24h", l: "Avg match" },
              { n: "94%", l: "Success" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-2xl lg:text-3xl font-black" style={{ color: '#F5F5F5' }}>{s.n}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#737373' }}>{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ SECTION 2: HOW IT WORKS — The animation IS the content ══════════ */}
      <Section className="py-20 px-6 lg:px-16" id="how-it-works">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[3px] mb-3" style={{ color: '#A3E635' }}>See it in action</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: '#F5F5F5' }}>
              How a referral happens
            </h2>
            <p className="text-sm mt-2" style={{ color: '#737373' }}>Watch the entire flow — from payment to referral to earnings</p>
          </div>

          {/* The animation component — full attention, no competing content */}
          <div className="rounded-3xl overflow-hidden" style={{ background: '#0C0C0C', border: '1px solid #1F1F1F' }}>
            <ReferralFlowAnimation />
          </div>
        </div>
      </Section>

      {/* ══════════ SECTION 3: COMPANY LOGOS ══════════ */}
      <Section className="py-16 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[3px] mb-8" style={{ color: '#525252' }}>
            Professionals from these companies refer on Job Thrive
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {logos.map((c) => (
              <div key={c.n} className="flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity">
                <img src={c.u} alt={c.n} className="w-6 h-6 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <span className="text-sm font-medium" style={{ color: '#737373' }}>{c.n}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ SECTION 4: DUAL VALUE PROP ══════════ */}
      <Section className="py-20 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background: '#141414', border: '1px solid #A3E63520' }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#A3E635' }} />
              <p className="text-[10px] font-bold uppercase tracking-[3px] mb-4" style={{ color: '#A3E635' }}>For Job Seekers</p>
              <h3 className="text-xl font-black mb-3" style={{ color: '#F5F5F5' }}>Skip cold applications forever</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#D4D4D4' }}>Employee referrals get 10x more interview calls. For Rs.499, a real employee submits your resume internally.</p>
              <div className="space-y-2.5">
                {["Matched with employee in 24 hours", "Resume submitted internally at the company", "Real-time status tracking", "Full refund if not matched in 10 days"].map((t) => (
                  <div key={t} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#A3E635' }} />
                    <span className="text-sm" style={{ color: '#D4D4D4' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background: '#141414', border: '1px solid #818CF820' }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#818CF8' }} />
              <p className="text-[10px] font-bold uppercase tracking-[3px] mb-4" style={{ color: '#818CF8' }}>For Referrers</p>
              <h3 className="text-xl font-black mb-3" style={{ color: '#F5F5F5' }}>Earn money helping others grow</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#D4D4D4' }}>Work at a top company? We match qualified candidates to you. Just submit the internal referral — we handle the rest.</p>
              <div className="space-y-2.5">
                {["Earn Rs.249+ per successful referral", "Candidates pre-screened for your company", "Takes 2 minutes to submit", "Build your professional reputation"].map((t) => (
                  <div key={t} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#818CF8' }} />
                    <span className="text-sm" style={{ color: '#D4D4D4' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════ SECTION 5: FEATURES ══════════ */}
      <Section className="py-20 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[3px] mb-3" style={{ color: '#818CF8' }}>Why Job Thrive</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: '#F5F5F5' }}>
              Built different from job boards
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "Money-back guarantee", desc: "Not matched in 10 days? Full refund. No questions asked.", color: '#A3E635' },
              { icon: Users, title: "Verified employees", desc: "Every referrer is verified as an active employee. No fake profiles.", color: '#818CF8' },
              { icon: Zap, title: "24-hour matching", desc: "Our algorithm finds the best referrer at your target company within 24 hours.", color: '#FB923C' },
              { icon: TrendingUp, title: "94% success rate", desc: "94% of our referrals result in interview calls. 10x better than cold applying.", color: '#A3E635' },
              { icon: Star, title: "1v1 expert coaching", desc: "Book sessions with industry pros. Mock interviews, resume reviews, career advice.", color: '#818CF8' },
              { icon: IndianRupee, title: "Earn as a referrer", desc: "Work at a top company? Earn Rs.249+ per referral. Zero effort — we handle everything.", color: '#FB923C' },
            ].map((f) => (
              <div key={f.title} className="group rounded-xl p-5 transition-all hover:border-[#2A2A2A]" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: `${f.color}08` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: '#F5F5F5' }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#D4D4D4' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ SECTION 6: TESTIMONIALS ══════════ */}
      <Section className="py-20 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[3px] mb-3" style={{ color: '#FB923C' }}>Real results</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: '#F5F5F5' }}>
              People love Job Thrive
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#D4D4D4' }}>"{t.text}"</p>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: '#737373' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ SECTION 7: PRICING ══════════ */}
      <Section className="py-20 px-6 lg:px-16" id="pricing">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[3px] mb-3" style={{ color: '#A3E635' }}>Simple pricing</p>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4" style={{ color: '#F5F5F5' }}>
            One price. No surprises.
          </h2>
          <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#A3E635' }} />
            <p className="text-6xl font-black mb-1" style={{ color: '#F5F5F5' }}>Rs.499</p>
            <p className="text-sm mb-8" style={{ color: '#737373' }}>per referral application</p>
            <div className="space-y-3 text-left mb-8">
              {["Matched with a verified employee", "Internal referral submitted in 24h", "Full refund if not matched in 10 days", "Resume delivered directly to referrer", "Real-time status tracking"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#A3E635' }} />
                  <span className="text-sm" style={{ color: '#D4D4D4' }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={signIn} disabled={loading}
              className="w-full h-12 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: '#A3E635', color: '#0C0C0C' }}>
              {loading ? 'Signing in...' : 'Get Started — Free to Browse'}
            </button>
          </div>
        </div>
      </Section>

      {/* ══════════ SECTION 8: FINAL CTA ══════════ */}
      <section className="relative py-24 px-6 lg:px-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(163,230,53,0.04) 0%, transparent 50%)' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-5" style={{ color: '#F5F5F5' }}>
            Your dream job is one<br />referral away
          </h2>
          <p className="text-lg mb-8" style={{ color: '#D4D4D4' }}>
            Join 500+ professionals who skipped the queue and got referred directly.
          </p>
          <button onClick={signIn} disabled={loading}
            className="inline-flex items-center gap-3 h-14 px-10 rounded-xl text-base font-black transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: '#A3E635', color: '#0C0C0C', boxShadow: '0 0 60px rgba(163,230,53,0.12)' }}>
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-8 px-6 lg:px-16" style={{ borderTop: '1px solid #1F1F1F' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={20} showText={false} />
            <span className="text-xs" style={{ color: '#525252' }}>&copy; {new Date().getFullYear()} Job Thrive. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs" style={{ color: '#525252' }}>
            <a href="/terms" className="hover:text-[#737373]">Terms</a>
            <a href="/privacy" className="hover:text-[#737373]">Privacy</a>
            <a href="/refund" className="hover:text-[#737373]">Refund</a>
            <a href="mailto:admin@jobthrive.in" className="hover:text-[#737373]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
