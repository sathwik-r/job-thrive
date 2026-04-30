import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Search, Users, IndianRupee, Building2, Trophy, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/logo';

interface OnboardingPageProps {
  onComplete: () => void;
}

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

const staggerContainer = {
  center: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const fadeUp = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const steps = [
    {
      title: "Welcome to Job Thrive",
      subtitle: "The future of job referrals",
      content: (
        <motion.div
          className="space-y-8"
          variants={staggerContainer}
          initial="enter"
          animate="center"
        >
          <motion.div className="text-center" variants={fadeUp}>
            <div className="flex justify-center mb-6">
              <Logo size={64} showText={false} />
            </div>
            <h2
              className="text-2xl sm:text-3xl mb-3 tracking-tight"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, color: '#F5F5F5' }}
            >
              Transform Your Career Journey
            </h2>
            <p
              className="text-base mb-8 max-w-lg mx-auto leading-relaxed"
              style={{ color: '#D4D4D4', fontFamily: 'Inter, sans-serif' }}
            >
              Connect, refer, and earn in the world's most advanced referral marketplace
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Search className="w-5 h-5" style={{ color: '#F5F5F5' }} />,
                gradientBg: 'linear-gradient(135deg, #A3E635, #818CF8)',
                title: "Find Dream Jobs",
                desc: "Discover exclusive opportunities at top companies -- faster than job boards",
              },
              {
                icon: <Users className="w-5 h-5" style={{ color: '#F5F5F5' }} />,
                gradientBg: 'linear-gradient(135deg, #A3E635, #818CF8)',
                title: "Get Consulted",
                desc: "Accelerate your growth with 1-on-1 guidance from top industry professionals",
              },
              {
                icon: <IndianRupee className="w-5 h-5" style={{ color: '#F5F5F5' }} />,
                gradientBg: 'linear-gradient(135deg, #FB923C, #FB923C)',
                title: "Earn Money",
                desc: "Share your experience, mentor top talent, and earn while helping others grow.",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div
                  className="rounded-2xl p-6 text-center transition-all duration-300 group cursor-default"
                  style={{
                    backgroundColor: '#1C1C1C',
                    border: '1px solid #1F1F1F',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2A2A2A';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#1F1F1F';
                  }}
                >
                  <motion.div
                    className="w-11 h-11 mx-auto mb-4 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: item.gradientBg }}
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {item.icon}
                  </motion.div>
                  <h3
                    className="mb-1.5 text-sm"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#F5F5F5' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#D4D4D4' }}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )
    },
    {
      title: "Dual-Side Marketplace",
      subtitle: "Earn on both sides of the equation",
      content: (
        <motion.div
          className="space-y-8"
          variants={staggerContainer}
          initial="enter"
          animate="center"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Seeker Side - Purple tones */}
            <motion.div variants={fadeUp}>
              <div
                className="rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(109, 91, 247, 0.15), rgba(162, 89, 255, 0.1))',
                  border: '1px solid rgba(109, 91, 247, 0.25)',
                }}
              >
                <div className="flex items-center mb-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mr-3"
                    style={{ background: 'linear-gradient(135deg, #A3E635, #818CF8)' }}
                  >
                    <Search className="w-5 h-5" style={{ color: '#F5F5F5' }} />
                  </div>
                  <h3
                    className="text-lg tracking-tight"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, color: '#F5F5F5' }}
                  >
                    As a Job Seeker
                  </h3>
                </div>

                <div className="space-y-3.5">
                  {[
                    { title: "Browse Premium Jobs", desc: "Access hidden job market from top companies" },
                    { title: "Get Internal Referrals", desc: "Connected directly with company employees" },
                    { title: "Track Your Progress", desc: "Real-time updates on referral status" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-2.5">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#A3E635' }} />
                      <div>
                        <p className="text-sm" style={{ fontWeight: 600, color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}>
                          {item.title}
                        </p>
                        <p className="text-xs" style={{ color: '#D4D4D4' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-5 p-3.5 rounded-xl"
                  style={{ backgroundColor: 'rgba(109, 91, 247, 0.1)', border: '1px solid rgba(109, 91, 247, 0.15)' }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: '#D4D4D4' }}>Average referral fee</span>
                    <span className="text-xl" style={{ fontWeight: 900, color: '#A3E635', fontFamily: 'Inter, sans-serif' }}>
                      Rs. 499
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Referrer Side - Green tones */}
            <motion.div variants={fadeUp}>
              <div
                className="rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.15), rgba(29, 185, 84, 0.05))',
                  border: '1px solid rgba(29, 185, 84, 0.25)',
                }}
              >
                <div className="flex items-center mb-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mr-3"
                    style={{ background: 'linear-gradient(135deg, #A3E635, #818CF8)' }}
                  >
                    <Building2 className="w-5 h-5" style={{ color: '#F5F5F5' }} />
                  </div>
                  <h3
                    className="text-lg tracking-tight"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, color: '#F5F5F5' }}
                  >
                    As a Referrer
                  </h3>
                </div>

                <div className="space-y-3.5">
                  {[
                    { title: "Automatic Assignments", desc: "Get matched with qualified candidates instantly" },
                    { title: "Earn Passive Income", desc: "Make money from successful referrals" },
                    { title: "Build Your Network", desc: "Connect with talent in your industry" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-2.5">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#A3E635' }} />
                      <div>
                        <p className="text-sm" style={{ fontWeight: 600, color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}>
                          {item.title}
                        </p>
                        <p className="text-xs" style={{ color: '#D4D4D4' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-5 p-3.5 rounded-xl"
                  style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)', border: '1px solid rgba(29, 185, 84, 0.15)' }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: '#D4D4D4' }}>Potential monthly earnings</span>
                    <span className="text-xl" style={{ fontWeight: 900, color: '#A3E635', fontFamily: 'Inter, sans-serif' }}>
                      Up to Rs. 20,000
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div className="text-center" variants={fadeUp}>
            <div
              className="p-5 inline-block rounded-2xl transition-all duration-300"
              style={{ backgroundColor: '#1C1C1C', border: '1px solid #1F1F1F' }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FB923C, #FB923C)' }}
                >
                  <Trophy className="w-5 h-5" style={{ color: '#F5F5F5' }} />
                </div>
                <div className="text-left">
                  <p className="text-sm" style={{ fontWeight: 700, color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}>
                    Smart Assignment Algorithm
                  </p>
                  <p className="text-xs" style={{ color: '#D4D4D4' }}>
                    AI-powered matching ensures fair distribution and higher success rates
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden gradient-bg-animated"
      style={{ backgroundColor: '#0C0C0C' }}
    >
      {/* Ambient Glow Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-5%] right-[10%] w-[450px] h-[450px] rounded-full blur-[120px]"
          style={{ background: '#A3E635', opacity: 0.04 }}
        />
        <div
          className="absolute bottom-[-5%] left-[5%] w-[350px] h-[350px] rounded-full blur-[100px]"
          style={{ background: '#A3E635', opacity: 0.03 }}
        />
        <div
          className="absolute top-[50%] left-[50%] w-[250px] h-[250px] rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: '#818CF8', opacity: 0.02 }}
        />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {/* Logo */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Logo size={36} showText={true} />
        </motion.div>

        {/* Progress Dots */}
        <motion.div
          className="w-full max-w-xs mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-2.5 mb-2">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className="h-2 rounded-full"
                animate={{
                  width: index === currentStep ? 28 : 8,
                  background: index === currentStep
                    ? '#A3E635'
                    : index < currentStep
                      ? '#A3E635'
                      : '#1F1F1F',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            ))}
          </div>
          <div
            className="text-center text-xs font-medium tracking-wide"
            style={{
              color: '#737373',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Step {currentStep + 1} of {steps.length}
          </div>
        </motion.div>

        {/* Content with page transitions */}
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              <div className="text-center mb-8">
                <h1
                  className="text-3xl sm:text-4xl mb-2 tracking-tight"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, color: '#F5F5F5' }}
                >
                  {steps[currentStep].title}
                </h1>
                <p
                  className="text-lg font-medium"
                  style={{ color: '#D4D4D4', fontFamily: 'Inter, sans-serif' }}
                >
                  {steps[currentStep].subtitle}
                </p>
              </div>

              <div className="mb-10">
                {steps[currentStep].content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            className="flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Previous - Ghost Button */}
            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  color: currentStep === 0 ? '#3F3F3F' : '#A3A3A3',
                  backgroundColor: 'transparent',
                  border: '1px solid #1F1F1F',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
            </motion.div>

            {/* Next / Get Started - Gradient CTA */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Button
                onClick={handleNext}
                className="font-semibold px-7 py-3 rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-lg text-sm border-0"
                style={{
                  background: '#A3E635',
                  color: '#F5F5F5',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs" style={{ color: '#525252', fontFamily: 'Inter, sans-serif' }}>
              <a href="/terms" className="hover:underline transition-colors duration-200" style={{ color: '#525252' }}>
                Terms
              </a>
              {' \u00B7 '}
              <a href="/privacy" className="hover:underline transition-colors duration-200" style={{ color: '#525252' }}>
                Privacy
              </a>
              {' \u00B7 '}
              <a href="/refund" className="hover:underline transition-colors duration-200" style={{ color: '#525252' }}>
                Refund
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
