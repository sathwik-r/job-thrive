import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, User, Briefcase, GraduationCap, Target } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  role: 'seeker' | 'referrer' | 'both';
  // Referrer specific
  company?: string;
  workExperience?: string;
  position?: string;
  department?: string;
  // Seeker specific
  education?: string;
  targetDomain?: string;
  targetRole?: string;
  experience?: string;
  skills?: string[];
}

interface PostLoginOnboardingProps {
  onComplete: () => void;
}

export default function PostLoginOnboarding({ onComplete }: PostLoginOnboardingProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    role: 'seeker',
    skills: []
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: OnboardingData) => {
      // Always call the API for profile updates
      const requestData = {
        ...profileData,
        userId: user?.id,
        email: user?.email
      };
      
      return apiRequest('POST', '/api/user/profile', requestData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been set up successfully!",
      });
      
      // Update user state with onboarding completed
      if (user) {
        const updatedUser = {
          ...user,
          ...data,
          onboardingCompleted: true
        };
        updateUser(updatedUser);
      }
      
      // Call the completion callback
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const handleNext = () => {
    if (step < getTotalSteps()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    updateProfileMutation.mutate(data);
  };

  const getTotalSteps = () => {
    if (data.role === 'both') return 4;
    return 3;
  };

  const addSkill = (skill: string) => {
    if (skill && !data.skills?.includes(skill)) {
      setData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Card className="modern-card border-0">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] rounded-2xl flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold gradient-text">What brings you to Circl?</CardTitle>
              <p className="text-gray-600">Choose your primary goal on our platform</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setData(prev => ({ ...prev, role: 'seeker' }))}
                variant={data.role === 'seeker' ? 'default' : 'outline'}
                className={`w-full p-6 h-auto text-left ${
                  data.role === 'seeker' 
                    ? 'bg-gradient-to-r from-[var(--purple-primary)] to-[var(--purple-light)] text-white border-0' 
                    : 'border-2 hover:border-[var(--purple-primary)]'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <Target className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-lg mb-1">I'm looking for a job</div>
                    <div className="text-sm opacity-90">Get referrals from employees at top companies</div>
                    <div className="text-xs mt-2 font-medium">💰 Referral fees: $150-500</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => setData(prev => ({ ...prev, role: 'referrer' }))}
                variant={data.role === 'referrer' ? 'default' : 'outline'}
                className={`w-full p-6 h-auto text-left ${
                  data.role === 'referrer' 
                    ? 'bg-gradient-to-r from-[var(--emerald-success)] to-[var(--orange-accent)] text-white border-0' 
                    : 'border-2 hover:border-[var(--emerald-success)]'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <Briefcase className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-lg mb-1">I want to provide referrals</div>
                    <div className="text-sm opacity-90">Earn money by referring candidates</div>
                    <div className="text-xs mt-2 font-medium">💰 Earn: $2000+ monthly</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => setData(prev => ({ ...prev, role: 'both' }))}
                variant={data.role === 'both' ? 'default' : 'outline'}
                className={`w-full p-6 h-auto text-left ${
                  data.role === 'both' 
                    ? 'bg-gradient-to-r from-[var(--orange-accent)] to-[var(--purple-primary)] text-white border-0' 
                    : 'border-2 hover:border-[var(--orange-accent)]'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex -space-x-1 mt-1">
                    <Target className="w-5 h-5" />
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">Both - Job seeker & Referrer</div>
                    <div className="text-sm opacity-90">Looking for jobs while helping others</div>
                    <div className="text-xs mt-2 font-medium">💰 Best of both worlds</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        if (data.role === 'referrer' || data.role === 'both') {
          return (
            <Card className="modern-card border-0">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[var(--emerald-success)] to-[var(--orange-accent)] rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold gradient-text">Tell us about your work</CardTitle>
                <p className="text-gray-600">This helps us match you with relevant referral requests</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="company" className="text-sm font-medium text-[var(--dark-gray)] mb-2 block">
                    Current Company *
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft, Apple"
                    value={data.company || ''}
                    onChange={(e) => setData(prev => ({ ...prev, company: e.target.value }))}
                    className="bg-gray-50 border-2 rounded-xl py-3 focus:border-[var(--purple-primary)] focus:bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="position" className="text-sm font-medium text-[var(--dark-gray)] mb-2 block">
                    Current Position *
                  </Label>
                  <Input
                    id="position"
                    placeholder="e.g., Senior Software Engineer, Product Manager"
                    value={data.position || ''}
                    onChange={(e) => setData(prev => ({ ...prev, position: e.target.value }))}
                    className="bg-gray-50 border-2 rounded-xl py-3 focus:border-[var(--purple-primary)] focus:bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="department" className="text-sm font-medium text-[var(--dark-gray)] mb-2 block">
                    Department
                  </Label>
                  <Select value={data.department || ''} onValueChange={(value) => setData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger className="bg-gray-50 border-2 rounded-xl py-3 focus:border-[var(--purple-primary)]">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workExperience" className="text-sm font-medium text-[var(--dark-gray)] mb-2 block">
                    Total Work Experience *
                  </Label>
                  <Select value={data.workExperience || ''} onValueChange={(value) => setData(prev => ({ ...prev, workExperience: value }))}>
                    <SelectTrigger className="bg-gray-50 border-2 rounded-xl py-3">
                      <SelectValue placeholder="Select experience range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years (New Grad)</SelectItem>
                      <SelectItem value="1-3">1-3 years (Junior)</SelectItem>
                      <SelectItem value="3-5">3-5 years (Mid-level)</SelectItem>
                      <SelectItem value="5-8">5-8 years (Senior)</SelectItem>
                      <SelectItem value="8-12">8-12 years (Staff/Principal)</SelectItem>
                      <SelectItem value="12+">12+ years (Leadership)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        }
        // Fall through to seeker form if not referrer
      case 3:
        if (data.role === 'seeker' || data.role === 'both') {
          return (
            <Card className="modern-card border-0">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[var(--purple-primary)] to-[var(--purple-light)] rounded-2xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold gradient-text">Your job search profile</CardTitle>
                <p className="text-gray-600">Help us find the perfect referral opportunities for you</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="education" className="text-sm font-medium text-[var(--dark-gray)] mb-2 block">
                    Education Background *
                  </Label>
                  <Select value={data.education || ''} onValueChange={(value) => setData(prev => ({ ...prev, education: value }))}>
                    <SelectTrigger className="bg-gray-50 border-2 rounded-xl py-3">
                      <SelectValue placeholder="Select your education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="bachelors-cs">Bachelor's - Computer Science</SelectItem>
                      <SelectItem value="bachelors-engineering">Bachelor's - Engineering</SelectItem>
                      <SelectItem value="bachelors-business">Bachelor's - Business</SelectItem>
                      <SelectItem value="bachelors-other">Bachelor's - Other</SelectItem>
                      <SelectItem value="masters-cs">Master's - Computer Science</SelectItem>
                      <SelectItem value="masters-mba">Master's - MBA</SelectItem>
                      <SelectItem value="masters-engineering">Master's - Engineering</SelectItem>
                      <SelectItem value="masters-other">Master's - Other</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="bootcamp">Coding Bootcamp</SelectItem>
                      <SelectItem value="self-taught">Self-taught</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetDomain" className="text-sm font-medium text-[var(--dark-gray)] mb-2 block">
                    Target Domain *
                  </Label>
                  <Select value={data.targetDomain || ''} onValueChange={(value) => setData(prev => ({ ...prev, targetDomain: value }))}>
                    <SelectTrigger className="bg-gray-50 border-2 rounded-xl py-3">
                      <SelectValue placeholder="What field are you targeting?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-engineering">Software Engineering</SelectItem>
                      <SelectItem value="data-science">Data Science & ML</SelectItem>
                      <SelectItem value="product-management">Product Management</SelectItem>
                      <SelectItem value="design">Design (UI/UX)</SelectItem>
                      <SelectItem value="devops">DevOps & Infrastructure</SelectItem>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="finance">Finance & Fintech</SelectItem>
                      <SelectItem value="marketing">Marketing & Growth</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetRole" className="text-sm font-medium text-[var(--dark-gray)] mb-2 block">
                    Target Role Level *
                  </Label>
                  <Select value={data.experience || ''} onValueChange={(value) => setData(prev => ({ ...prev, experience: value }))}>
                    <SelectTrigger className="bg-gray-50 border-2 rounded-xl py-3">
                      <SelectValue placeholder="What level are you targeting?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid-level">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="senior-level">Senior Level (5-8 years)</SelectItem>
                      <SelectItem value="staff-principal">Staff/Principal (8+ years)</SelectItem>
                      <SelectItem value="management">Management/Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-[var(--dark-gray)] mb-2 block">
                    Key Skills (Optional)
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {data.skills?.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-[var(--purple-primary)]/10 text-[var(--purple-primary)] px-3 py-1 cursor-pointer hover:bg-red-100 hover:text-red-600"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill (e.g., React, Python, AWS)"
                      className="bg-gray-50 border-2 rounded-xl py-3"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSkill((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        addSkill(input.value);
                        input.value = '';
                      }}
                      className="px-4"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        break;

      case 4:
        return (
          <Card className="modern-card border-0">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[var(--orange-accent)] to-[var(--emerald-success)] rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold gradient-text">You're all set!</CardTitle>
              <p className="text-gray-600">Review your profile before we get started</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-[var(--purple-primary)]/10 to-[var(--emerald-success)]/10 rounded-2xl p-6">
                <h3 className="font-semibold text-[var(--dark-gray)] mb-4">Profile Summary:</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <Badge variant="outline" className="capitalize">{data.role}</Badge>
                  </div>
                  
                  {(data.role === 'referrer' || data.role === 'both') && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company:</span>
                        <span className="font-medium">{data.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-medium">{data.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{data.workExperience} years</span>
                      </div>
                    </>
                  )}
                  
                  {(data.role === 'seeker' || data.role === 'both') && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Education:</span>
                        <span className="font-medium">{data.education}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Domain:</span>
                        <span className="font-medium">{data.targetDomain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience Level:</span>
                        <span className="font-medium">{data.experience}</span>
                      </div>
                      {data.skills && data.skills.length > 0 && (
                        <div>
                          <span className="text-gray-600">Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {data.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.role !== undefined;
      case 2:
        if (data.role === 'referrer' || data.role === 'both') {
          return data.company && data.position && data.workExperience;
        }
        return true;
      case 3:
        if (data.role === 'seeker' || data.role === 'both') {
          return data.education && data.targetDomain && data.experience;
        }
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of {getTotalSteps()}</span>
            <span>{Math.round((step / getTotalSteps()) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / getTotalSteps()) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={step === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          {step === getTotalSteps() ? (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || updateProfileMutation.isPending}
              className="bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] text-white px-8 py-3 rounded-xl font-semibold"
            >
              {updateProfileMutation.isPending ? 'Setting up...' : 'Complete Setup'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-[var(--purple-primary)] text-white flex items-center space-x-2 px-6"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}