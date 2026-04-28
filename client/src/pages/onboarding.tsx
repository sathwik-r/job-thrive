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
            <div className="w-24 h-24 mx-auto mb-6 glassmorphism rounded-2xl flex items-center justify-center shadow-lg shadow-white/5">
              <Logo variant="white" size={64} showText={false} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white tracking-tight">Transform Your Career Journey</h2>
            <p className="text-base text-white/60 mb-8 max-w-lg mx-auto leading-relaxed">Connect, refer, and earn in the world's most advanced referral marketplace</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Search className="w-5 h-5 text-white" />,
                gradient: "from-[var(--purple-primary)] to-[var(--purple-light)]",
                title: "Find Dream Jobs",
                desc: "Discover exclusive opportunities at top companies -- faster than job boards",
              },
              {
                icon: <Users className="w-5 h-5 text-white" />,
                gradient: "from-[var(--emerald-success)] to-[var(--orange-accent)]",
                title: "Get Consulted",
                desc: "Accelerate your growth with 1-on-1 guidance from top industry professionals",
              },
              {
                icon: <IndianRupee className="w-5 h-5 text-white" />,
                gradient: "from-[var(--orange-accent)] to-[var(--purple-primary)]",
                title: "Earn Money",
                desc: "Share your experience, mentor top talent, and earn while helping others grow.",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="modern-card card-hover group cursor-default">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className={`w-11 h-11 mx-auto mb-4 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center shadow-md`}
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {item.icon}
                    </motion.div>
                    <h3 className="font-semibold text-[var(--dark-gray)] mb-1.5 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
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
            {/* Job Seeker Side */}
            <motion.div variants={fadeUp}>
              <Card className="bg-gradient-to-br from-[var(--purple-primary)] to-[var(--purple-light)] text-white p-6 border-0 shadow-xl shadow-purple-900/20 hover:shadow-2xl hover:shadow-purple-900/30 transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="flex items-center mb-5">
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm">
                      <Search className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">As a Job Seeker</h3>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { title: "Browse Premium Jobs", desc: "Access hidden job market from top companies" },
                      { title: "Get Internal Referrals", desc: "Connected directly with company employees" },
                      { title: "Track Your Progress", desc: "Real-time updates on referral status" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start space-x-2.5">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-80" />
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs opacity-75">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-3.5 bg-white/10 rounded-xl backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs opacity-80">Average referral fee</span>
                      <span className="text-xl font-bold">Rs. 499</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Referrer Side */}
            <motion.div variants={fadeUp}>
              <Card className="bg-gradient-to-br from-[var(--emerald-success)] to-[var(--orange-accent)] text-white p-6 border-0 shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-900/30 transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="flex items-center mb-5">
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">As a Referrer</h3>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { title: "Automatic Assignments", desc: "Get matched with qualified candidates instantly" },
                      { title: "Earn Passive Income", desc: "Make money from successful referrals" },
                      { title: "Build Your Network", desc: "Connect with talent in your industry" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start space-x-2.5">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-80" />
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs opacity-75">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-3.5 bg-white/10 rounded-xl backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs opacity-80">Potential monthly earnings</span>
                      <span className="text-xl font-bold">Up to Rs. 20,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div className="text-center" variants={fadeUp}>
            <Card className="modern-card p-5 inline-block card-hover">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[var(--orange-accent)] to-[var(--purple-primary)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--dark-gray)] text-sm">Smart Assignment Algorithm</p>
                  <p className="text-xs text-gray-500">AI-powered matching ensures fair distribution and higher success rates</p>
                </div>
              </div>
            </Card>
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
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 right-20 w-36 h-36 bg-white/[0.04] rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-24 left-12 w-28 h-28 bg-white/[0.03] rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {/* Progress Indicator */}
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
                className="h-1.5 rounded-full transition-all duration-500"
                animate={{
                  width: index === currentStep ? 32 : 8,
                  backgroundColor: index <= currentStep ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            ))}
          </div>
          <div className="text-center text-white/50 text-xs font-medium tracking-wide">
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
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">{steps[currentStep].title}</h1>
                <p className="text-lg text-white/65 font-medium">{steps[currentStep].subtitle}</p>
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
            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Button
                onClick={handleNext}
                className="bg-white text-[var(--purple-primary)] font-semibold px-7 py-3 rounded-2xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-black/10 hover:shadow-xl text-sm"
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
            <p className="text-white/45 text-xs leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-white/65 hover:text-white transition-colors duration-200 underline underline-offset-2">
                Terms & Conditions
              </a>
              ,{' '}
              <a href="/privacy" className="text-white/65 hover:text-white transition-colors duration-200 underline underline-offset-2">
                Privacy Policy
              </a>
              , and{' '}
              <a href="/refund" className="text-white/65 hover:text-white transition-colors duration-200 underline underline-offset-2">
                Refund Policy
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
