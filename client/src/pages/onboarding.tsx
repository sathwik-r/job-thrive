import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Search, Users, IndianRupee, Building2, Trophy, CheckCircle } from 'lucide-react';

interface OnboardingPageProps {
  onComplete: () => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Job Thrive",
      subtitle: "The future of job referrals",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 glassmorphism rounded-3xl overflow-hidden">
              <img
                src="https://job-thrive.s3.ap-south-1.amazonaws.com/assets/job-thrive-logo.png"
                alt="Job Thrive"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">Transform Your Career Journey</h2>
            <p className="text-lg text-gray-600 mb-8">Connect, refer, and earn in the world's most advanced referral marketplace</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="modern-card card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--purple-light)] rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--dark-gray)] mb-2">Find Dream Jobs</h3>
                <p className="text-sm text-gray-600">Discover exclusive opportunities at top companies—faster than job boards</p>
              </CardContent>
            </Card>

            <Card className="modern-card card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[var(--emerald-success)] to-[var(--orange-accent)] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--dark-gray)] mb-2">Get Consulted</h3>
                <p className="text-sm text-gray-600">Accelerate your growth with 1-on-1 guidance from top industry professionals</p>
              </CardContent>
            </Card>

            <Card className="modern-card card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[var(--orange-accent)] to-[var(--purple-primary)] rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--dark-gray)] mb-2">Earn Money</h3>
                <p className="text-sm text-gray-600">Share your experience, mentor top talent, and earn while helping others grow.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Dual-Side Marketplace",
      subtitle: "Earn on both sides of the equation",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Seeker Side */}
            <Card className="bg-gradient-to-br from-[var(--purple-primary)] to-[var(--purple-light)] text-white p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">As a Job Seeker</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Browse Premium Jobs</p>
                      <p className="text-sm opacity-90">Access hidden job market from top companies</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Get Internal Referrals</p>
                      <p className="text-sm opacity-90">Connected directly with company employees</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Track Your Progress</p>
                      <p className="text-sm opacity-90">Real-time updates on referral status</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">Average referral fee</span>
                    <span className="text-2xl font-bold">₹499</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referrer Side */}
            <Card className="bg-gradient-to-br from-[var(--emerald-success)] to-[var(--orange-accent)] text-white p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">As a Referrer</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Automatic Assignments</p>
                      <p className="text-sm opacity-90">Get matched with qualified candidates instantly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Earn Passive Income</p>
                      <p className="text-sm opacity-90">Make money from successful referrals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Build Your Network</p>
                      <p className="text-sm opacity-90">Connect with talent in your industry</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">Potential monthly earnings</span>
                    <span className="text-2xl font-bold">Up to ₹20,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="modern-card p-6 inline-block">
              <div className="flex items-center space-x-4">
                <Trophy className="w-8 h-8 text-[var(--orange-accent)]" />
                <div className="text-left">
                  <p className="font-semibold text-[var(--dark-gray)]">Smart Assignment Algorithm</p>
                  <p className="text-sm text-gray-600">AI-powered matching ensures fair distribution and higher success rates</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
      {/* Progress Indicator */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        <div className="text-center text-white/80 text-sm">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{steps[currentStep].title}</h1>
          <p className="text-xl text-white/80">{steps[currentStep].subtitle}</p>
        </div>

        <div className="mb-12">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="text-white hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            className="bg-white text-[var(--purple-primary)] font-semibold px-8 py-3 rounded-2xl hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2"
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-white hover:text-white/80 underline">
              Terms & Conditions
            </a>
            ,{' '}
            <a href="/privacy" className="text-white hover:text-white/80 underline">
              Privacy Policy
            </a>
            , and{' '}
            <a href="/refund" className="text-white hover:text-white/80 underline">
              Refund Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}