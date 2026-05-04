import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ArrowRight, CheckCircle2, IndianRupee, User, Building2, Sparkles } from 'lucide-react';

// Animated story showing the full referral flow:
// Seeker pays → matched with referrer → resume sent → referral submitted → money earned
// Loops continuously

const STORIES = [
  { seeker: 'Priya', company: 'Google', referrer: 'Amit K.', role: 'SDE-2', logo: 'https://logo.clearbit.com/google.com' },
  { seeker: 'Rahul', company: 'Microsoft', referrer: 'Sneha R.', role: 'PM', logo: 'https://logo.clearbit.com/microsoft.com' },
  { seeker: 'Neha', company: 'Amazon', referrer: 'Vikram P.', role: 'Data Scientist', logo: 'https://logo.clearbit.com/amazon.com' },
];

export default function BgReferralStory() {
  const [storyIdx, setStoryIdx] = useState(0);
  const [step, setStep] = useState(0);
  // Steps: 0=appear, 1=pay, 2=match, 3=resume, 4=submit, 5=earn, 6=celebrate

  useEffect(() => {
    const timings = [1200, 1500, 1500, 1500, 1500, 1800, 2000];
    const timer = setTimeout(() => {
      if (step < 6) {
        setStep(s => s + 1);
      } else {
        setStep(0);
        setStoryIdx(i => (i + 1) % STORIES.length);
      }
    }, timings[step]);
    return () => clearTimeout(timer);
  }, [step, storyIdx]);

  const story = STORIES[storyIdx];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {/* Faint connecting line */}
      <div className="absolute top-1/2 left-[12%] right-[12%] h-px" style={{ background: 'linear-gradient(90deg, transparent, #1F1F1F 20%, #1F1F1F 80%, transparent)' }} />

      {/* Step indicators */}
      <div className="absolute top-[22%] left-1/2 -translate-x-1/2 flex items-center gap-2">
        {['Pay', 'Match', 'Resume', 'Refer', 'Earn'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold transition-all duration-500"
                style={{
                  background: step > i ? '#A3E635' : '#1C1C1C',
                  color: step > i ? '#0C0C0C' : '#525252',
                  border: `1px solid ${step > i ? '#A3E635' : '#1F1F1F'}`,
                  boxShadow: step === i + 1 ? '0 0 12px rgba(163,230,53,0.3)' : 'none',
                }}>
                {step > i ? '✓' : i + 1}
              </div>
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: step > i ? '#A3E635' : '#525252' }}>{label}</span>
            </div>
            {i < 4 && <div className="w-6 h-px" style={{ background: step > i + 1 ? '#A3E63540' : '#1F1F1F' }} />}
          </div>
        ))}
      </div>

      {/* ─── LEFT: Seeker ─── */}
      <motion.div
        className="absolute left-[8%] md:left-[12%] top-1/2 -translate-y-1/2"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: step >= 0 ? 1 : 0, x: step >= 0 ? 0 : -30 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl p-4 w-[140px] md:w-[160px]" style={{ background: '#141414', border: `1px solid ${step >= 1 ? '#A3E63530' : '#1F1F1F'}` }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 mx-auto"
            style={{ background: '#A3E63510' }}>
            <User className="w-5 h-5" style={{ color: '#A3E635' }} />
          </div>
          <p className="text-sm font-bold text-center" style={{ color: '#F5F5F5' }}>{story.seeker}</p>
          <p className="text-[10px] text-center mt-0.5" style={{ color: '#737373' }}>Job Seeker</p>
          <p className="text-[10px] text-center mt-1" style={{ color: '#525252' }}>Wants: {story.role}</p>
        </div>
      </motion.div>

      {/* ─── CENTER: Platform + animations ─── */}
      <div className="relative">
        {/* Rs.499 flying from seeker to center */}
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              initial={{ x: -120, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute -left-16 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full z-20"
              style={{ background: '#A3E635', color: '#0C0C0C' }}
            >
              <IndianRupee className="w-3 h-3" />
              <span className="text-xs font-black">499</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Platform logo in center */}
        <motion.div
          animate={{
            borderColor: step >= 2 ? '#A3E63540' : '#1F1F1F',
            boxShadow: step >= 2 ? '0 0 30px rgba(163,230,53,0.08)' : 'none',
          }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
          style={{ background: '#141414', border: '1px solid #1F1F1F' }}
        >
          <Sparkles className="w-7 h-7" style={{ color: step >= 2 ? '#A3E635' : '#525252' }} />
          {step >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: '#A3E635' }}
            >
              <CheckCircle2 className="w-3 h-3" style={{ color: '#0C0C0C' }} />
            </motion.div>
          )}
        </motion.div>

        {/* "Matched!" text */}
        <AnimatePresence>
          {step === 2 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap"
              style={{ color: '#A3E635' }}
            >
              Matched!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Resume flying to referrer */}
        <AnimatePresence>
          {step === 3 && (
            <motion.div
              initial={{ x: 0, opacity: 0, scale: 0.8 }}
              animate={{ x: 120, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 140 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-12 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg z-20"
              style={{ background: '#818CF8', color: '#FFF' }}
            >
              <FileText className="w-3 h-3" />
              <span className="text-[10px] font-bold">Resume</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rs.249 flying to referrer */}
        <AnimatePresence>
          {step === 5 && (
            <motion.div
              initial={{ x: 0, opacity: 0, scale: 0.8 }}
              animate={{ x: 120, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 140 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-12 top-[60%] flex items-center gap-1 px-3 py-1.5 rounded-full z-20"
              style={{ background: '#A3E635', color: '#0C0C0C' }}
            >
              <IndianRupee className="w-3 h-3" />
              <span className="text-xs font-black">249</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── RIGHT: Referrer + Company ─── */}
      <motion.div
        className="absolute right-[8%] md:right-[12%] top-1/2 -translate-y-1/2"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: step >= 2 ? 1 : 0.3, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl p-4 w-[140px] md:w-[160px]" style={{ background: '#141414', border: `1px solid ${step >= 4 ? '#818CF830' : '#1F1F1F'}` }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src={story.logo} alt="" className="w-8 h-8 rounded-lg p-0.5" style={{ background: '#1C1C1C', border: '1px solid #1F1F1F' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <p className="text-sm font-bold text-center" style={{ color: '#F5F5F5' }}>{story.referrer}</p>
          <p className="text-[10px] text-center mt-0.5" style={{ color: '#818CF8' }}>{story.company}</p>
          <p className="text-[10px] text-center mt-0.5" style={{ color: '#737373' }}>Referrer</p>

          {/* Referral submitted badge */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 flex items-center justify-center gap-1 py-1 rounded-md"
                style={{ background: '#A3E63510', border: '1px solid #A3E63520' }}
              >
                <CheckCircle2 className="w-3 h-3" style={{ color: '#A3E635' }} />
                <span className="text-[9px] font-bold" style={{ color: '#A3E635' }}>Referred!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Earned badge */}
          <AnimatePresence>
            {step >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 flex items-center justify-center gap-1 py-1 rounded-md"
                style={{ background: '#818CF810' }}
              >
                <IndianRupee className="w-3 h-3" style={{ color: '#818CF8' }} />
                <span className="text-[9px] font-bold" style={{ color: '#818CF8' }}>+Rs.249 earned</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─── CELEBRATION overlay ─── */}
      <AnimatePresence>
        {step === 6 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center z-30"
          >
            <div className="rounded-2xl px-8 py-4 text-center" style={{ background: '#141414E0', border: '1px solid #A3E63530', backdropFilter: 'blur(10px)' }}>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" style={{ color: '#A3E635' }} />
              </motion.div>
              <p className="text-lg font-black" style={{ color: '#F5F5F5' }}>
                {story.seeker} got referred to <span style={{ color: '#A3E635' }}>{story.company}</span>!
              </p>
              <p className="text-xs mt-1" style={{ color: '#737373' }}>{story.referrer} earned Rs.249</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fade edges */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(90deg, #0C0C0C 0%, transparent 15%, transparent 85%, #0C0C0C 100%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, #0C0C0C 0%, transparent 25%, transparent 75%, #0C0C0C 100%)',
      }} />
    </div>
  );
}
