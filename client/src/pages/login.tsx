import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, ArrowRight, Zap, Shield, Clock, Star, CheckCircle2, Users, Briefcase, TrendingUp, ChevronDown } from 'lucide-react';
import Logo from '@/components/logo';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const ticker = [
  { name: "Priya S.", company: "Google", role: "SDE-2", time: "2h ago" },
  { name: "Amit K.", company: "Microsoft", role: "Product Manager", time: "4h ago" },
  { name: "Sneha R.", company: "Amazon", role: "Data Scientist", time: "5h ago" },
  { name: "Rahul J.", company: "Flipkart", role: "Backend Dev", time: "8h ago" },
  { name: "Neha M.", company: "Swiggy", role: "Frontend Dev", time: "12h ago" },
  { name: "Vikram P.", company: "Razorpay", role: "DevOps Eng", time: "1d ago" },
  { name: "Ananya D.", company: "Atlassian", role: "SRE", time: "1d ago" },
  { name: "Karthik S.", company: "Adobe", role: "UX Designer", time: "2d ago" },
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
  { name: "Riya Sharma", role: "Got referred to Google", text: "Applied on a Friday, got my referral by Monday. The referrer even shared tips for my interview. Best Rs.499 I ever spent.", stars: 5 },
  { name: "Arjun Mehta", role: "Got referred to Microsoft", text: "I was mass-applying for months with zero callbacks. One referral through jobthrive and I had an interview within a week.", stars: 5 },
  { name: "Sneha Patel", role: "Referrer at Amazon", text: "I've earned over Rs.15,000 by referring qualified candidates. The platform handles everything — I just submit the referral.", stars: 5 },
];

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  );
}

export default function LoginPage() {
  const { signInWithGoogle, loading, error } = useAuth();
  const [ti, setTi] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTi((p) => (p + 1) % ticker.length), 2800);
    return () => clearInterval(i);
  }, []);

  const signIn = async () => { try { await signInWithGoogle(); } catch {} };
  const t = ticker[ti];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0C0C0C' }}>

      {/* ══════════ ANIMATED BACKGROUND ══════════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(163,230,53,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.015) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />
        {/* Glow orbs */}
        <div className="absolute -top-40 left-1/4 w-[800px] h-[800px] rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.07) 0%, transparent 60%)', animationDuration: '4s' }} />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 60%)', animationDuration: '6s' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.03) 0%, transparent 60%)' }} />
      </div>

      {/* ══════════ NAV ══════════ */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-16 py-5">
        <Logo size={28} showText={true} />
        <button onClick={signIn} disabled={loading}
          className="hidden sm:flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-bold transition-all hover:brightness-110 active:scale-[0.97]"
          style={{ background: '#A3E635', color: '#0C0C0C' }}>
          Get Started <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative z-10 px-6 lg:px-16 pt-16 lg:pt-24 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Live badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: '#A3E63510', border: '1px solid #A3E63520' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#A3E635' }} />
            <AnimatePresence mode="wait">
              <motion.span key={ti} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                className="text-xs font-medium" style={{ color: '#A3A3A3' }}>
                <span style={{ color: '#F5F5F5' }}>{t.name}</span> just got referred for {t.role} at <span style={{ color: '#A3E635' }}>{t.company}</span>
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6" style={{ color: '#F5F5F5' }}>
            Stop applying.<br />
            <span style={{ color: '#A3E635' }}>Start getting referred.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#A3A3A3' }}>
            Real employees at Google, Microsoft, Amazon and 90+ top companies refer you directly.
            No cold applications. No networking. Just <span className="font-bold" style={{ color: '#F5F5F5' }}>Rs.499</span> and a real referral.
          </motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button onClick={signIn} disabled={loading}
              className="flex items-center gap-3 h-14 px-8 rounded-xl text-base font-black transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#A3E635', color: '#0C0C0C', boxShadow: '0 0 40px rgba(163,230,53,0.2)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#0C0C0C" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#0C0C0C" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#0C0C0C" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#0C0C0C" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {loading ? 'Signing in...' : 'Get Started with Google'}
            </button>
            <span className="text-sm" style={{ color: '#3F3F3F' }}>Free to join · Pay only when you apply</span>
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
            className="flex items-center justify-center gap-8 lg:gap-12 mt-4">
            {[
              { n: "500+", l: "Referrals given" },
              { n: "95+", l: "Companies" },
              { n: "24h", l: "Avg match time" },
              { n: "94%", l: "Success rate" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-2xl lg:text-3xl font-black" style={{ color: '#F5F5F5' }}>{s.n}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#525252' }}>{s.l}</p>
              </div>
            ))}
          </motion.div>

          {/* Scroll hint */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-16 flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-widest" style={{ color: '#3F3F3F' }}>Scroll to learn more</span>
            <ChevronDown className="w-4 h-4 animate-bounce" style={{ color: '#3F3F3F' }} />
          </motion.div>
        </div>
      </section>

      {/* ══════════ COMPANY LOGOS ══════════ */}
      <Section className="py-16 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[3px] mb-8" style={{ color: '#3F3F3F' }}>
            Professionals from these companies refer on jobthrive
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {logos.map((c) => (
              <div key={c.n} className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity">
                <img src={c.u} alt={c.n} className="w-6 h-6 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <span className="text-sm font-medium" style={{ color: '#525252' }}>{c.n}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <Section className="py-20 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[3px] mb-3" style={{ color: '#A3E635' }}>How it works</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: '#F5F5F5' }}>
              Three steps to your next job
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: Briefcase, title: "Browse real jobs", desc: "100+ verified positions at top companies updated daily. Filter by role, company, location, and salary.", color: '#A3E635' },
              { step: "02", icon: Zap, title: "Upload & pay Rs.499", desc: "Upload your resume and pay a flat Rs.499 fee. Secure payment via Cashfree. Full refund if not referred within 10 days.", color: '#818CF8' },
              { step: "03", icon: CheckCircle2, title: "Get referred", desc: "We match you with a verified employee at the company who submits your referral internally. Average match time: 24 hours.", color: '#FB923C' },
            ].map((s) => (
              <div key={s.step} className="group relative rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: s.color }} />
                <span className="text-4xl font-black" style={{ color: '#1F1F1F' }}>{s.step}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-4 mb-3" style={{ background: `${s.color}12` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#F5F5F5' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A3A3A3' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ FEATURES ══════════ */}
      <Section className="py-20 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[3px] mb-3" style={{ color: '#818CF8' }}>Why jobthrive</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: '#F5F5F5' }}>
              Not just another job board
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "Refund guarantee", desc: "If we can't match you with a referrer within 10 days, you get a full refund. Zero risk.", color: '#A3E635' },
              { icon: Users, title: "Verified referrers", desc: "Every referrer is verified as an active employee at the company. No fake profiles.", color: '#818CF8' },
              { icon: Clock, title: "24-hour matching", desc: "Our algorithm matches you with the best referrer at your target company within 24 hours.", color: '#FB923C' },
              { icon: TrendingUp, title: "94% success rate", desc: "94% of referrals result in interview calls. That's 10x better than cold applications.", color: '#A3E635' },
              { icon: Star, title: "1v1 coaching", desc: "Book personal sessions with industry professionals. Mock interviews, career advice, resume reviews.", color: '#818CF8' },
              { icon: Briefcase, title: "Earn as a referrer", desc: "Work at a top company? Earn Rs.249+ per referral by helping others land their dream job.", color: '#FB923C' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl p-5 transition-all hover:border-[#2A2A2A]" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${f.color}10` }}>
                  <f.icon className="w-4.5 h-4.5" style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-bold mb-1" style={{ color: '#F5F5F5' }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#525252' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <Section className="py-20 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[3px] mb-3" style={{ color: '#FB923C' }}>Testimonials</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: '#F5F5F5' }}>
              People love jobthrive
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#A3A3A3' }}>"{t.text}"</p>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: '#525252' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ PRICING ══════════ */}
      <Section className="py-20 px-6 lg:px-16">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[3px] mb-3" style={{ color: '#A3E635' }}>Simple pricing</p>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4" style={{ color: '#F5F5F5' }}>
            One price. No hidden fees.
          </h2>
          <p className="text-sm mb-8" style={{ color: '#525252' }}>Pay per referral. No subscriptions. No commitments.</p>

          <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#A3E635' }} />
            <p className="text-6xl font-black mb-1" style={{ color: '#F5F5F5' }}>Rs.499</p>
            <p className="text-sm mb-6" style={{ color: '#525252' }}>per referral application</p>

            <div className="space-y-3 text-left mb-8">
              {[
                "Matched with verified employee",
                "Referral submitted within 24h",
                "Full refund if not matched in 10 days",
                "Resume delivered to referrer",
                "Status tracking in real-time",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#A3E635' }} />
                  <span className="text-sm" style={{ color: '#A3A3A3' }}>{item}</span>
                </div>
              ))}
            </div>

            <button onClick={signIn} disabled={loading}
              className="w-full h-12 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: '#A3E635', color: '#0C0C0C' }}>
              {loading ? 'Signing in...' : 'Get Started — It\'s Free to Browse'}
            </button>
          </div>
        </div>
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="relative py-24 px-6 lg:px-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(163,230,53,0.06) 0%, transparent 60%)' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-5" style={{ color: '#F5F5F5' }}>
            Your dream job is one<br />referral away
          </h2>
          <p className="text-lg mb-8" style={{ color: '#A3A3A3' }}>
            Join 500+ professionals who skipped the queue and got referred directly.
          </p>
          <button onClick={signIn} disabled={loading}
            className="inline-flex items-center gap-3 h-14 px-10 rounded-xl text-base font-black transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: '#A3E635', color: '#0C0C0C', boxShadow: '0 0 60px rgba(163,230,53,0.15)' }}>
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-8 px-6 lg:px-16" style={{ borderTop: '1px solid #1F1F1F' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={20} showText={false} />
            <span className="text-xs" style={{ color: '#3F3F3F' }}>&copy; {new Date().getFullYear()} jobthrive. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs" style={{ color: '#3F3F3F' }}>
            <a href="/terms" className="hover:text-[#525252] transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-[#525252] transition-colors">Privacy</a>
            <a href="/refund" className="hover:text-[#525252] transition-colors">Refund</a>
            <a href="mailto:admin@jobthrive.in" className="hover:text-[#525252] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
