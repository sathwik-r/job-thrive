import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target, Briefcase, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { INDIA_TECH_COMPANIES } from '@/lib/companies';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, Check } from 'lucide-react';
import Logo from '@/components/logo';
import { motion } from 'framer-motion';

interface OnboardingData {
  role: 'seeker' | 'referrer' | 'both';
  company?: string;
  workExperience?: string;
  position?: string;
  department?: string;
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
  const { user, updateUser, setLoading } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<OnboardingData>({ role: 'seeker', skills: [] });
  const [companyQuery, setCompanyQuery] = useState('');
  const [companyOpen, setCompanyOpen] = useState(false);
  const [isOtherCompany, setIsOtherCompany] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: OnboardingData) => {
      return apiRequest('POST', '/api/user/profile', {
        ...profileData,
        userId: user?.id,
        email: user?.email,
      });
    },
    onSuccess: () => {
      toast({ title: "You're all set!", description: "Welcome to Job Thrive." });
      if (user) {
        updateUser({ ...user, ...data, onboardingCompleted: true });
      }
      setLoading(true);
      setTimeout(() => { setLoading(false); onComplete(); }, 0);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save", variant: "destructive" });
    },
  });

  const handleComplete = () => updateProfileMutation.mutate(data);

  const addSkill = () => {
    if (skillInput.trim() && !data.skills?.includes(skillInput.trim())) {
      setData(prev => ({ ...prev, skills: [...(prev.skills || []), skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const canSubmit = () => {
    if (data.role === 'referrer' || data.role === 'both') {
      if (!data.company?.trim() || !data.position) return false;
    }
    if (data.role === 'seeker' || data.role === 'both') {
      if (!data.education || !data.targetDomain) return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#0C0C0C' }}>
      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.02] pointer-events-none" style={{ background: '#A3E635', filter: 'blur(150px)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Logo size={32} showText={false} className="justify-center mb-4" />
          <h1 className="text-2xl font-black" style={{ color: '#F5F5F5' }}>
            Welcome, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#525252' }}>Set up in 30 seconds. You can always change this later.</p>
        </div>

        {/* ── Role Selection ──────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { value: 'seeker' as const, icon: Target, label: 'Find jobs', sub: 'Get referrals', color: '#A3E635' },
            { value: 'referrer' as const, icon: Briefcase, label: 'Give referrals', sub: 'Earn money', color: '#818CF8' },
            { value: 'both' as const, icon: Zap, label: 'Both', sub: 'Best of both', color: '#FB923C' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setData(prev => ({ ...prev, role: opt.value }))}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: data.role === opt.value ? `${opt.color}10` : '#1C1C1C',
                border: `1px solid ${data.role === opt.value ? `${opt.color}40` : '#1F1F1F'}`,
              }}
            >
              <opt.icon className="w-5 h-5 mb-2" style={{ color: data.role === opt.value ? opt.color : '#525252' }} />
              <p className="text-sm font-bold" style={{ color: data.role === opt.value ? '#F5F5F5' : '#A3A3A3' }}>{opt.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#525252' }}>{opt.sub}</p>
            </button>
          ))}
        </div>

        {/* ── Smart Form (shows fields based on role) ── */}
        <motion.div layout className="space-y-4 rounded-xl p-5" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>

          {/* Referrer fields */}
          {(data.role === 'referrer' || data.role === 'both') && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#525252' }}>Your work</p>

              {/* Company with typeahead */}
              <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full h-11 rounded-xl px-4 flex items-center justify-between text-sm"
                    style={{ background: '#0C0C0C', border: '1px solid #1F1F1F', color: data.company ? '#F5F5F5' : '#525252' }}>
                    {data.company || 'Company *'}
                    <ChevronsUpDown className="w-4 h-4" style={{ color: '#525252' }} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" style={{ background: '#1C1C1C', border: '1px solid #2A2A2A' }}>
                  <Command shouldFilter={false}>
                    <CommandInput placeholder="Search company..." value={companyQuery} onValueChange={setCompanyQuery}
                      className="text-[#F5F5F5]" style={{ background: '#1C1C1C' }} />
                    <CommandList>
                      <CommandEmpty className="text-[#525252] text-sm p-4">No results.</CommandEmpty>
                      <CommandGroup>
                        {INDIA_TECH_COMPANIES.filter(c => c.toLowerCase().includes(companyQuery.trim().toLowerCase())).slice(0, 20).map((company) => (
                          <CommandItem key={company} onSelect={() => { setData(prev => ({ ...prev, company })); setIsOtherCompany(false); setCompanyOpen(false); }}
                            className="text-[#A3A3A3] hover:bg-[#242424]">
                            <Check className={`mr-2 h-4 w-4 ${data.company === company ? 'opacity-100 text-[#A3E635]' : 'opacity-0'}`} />
                            {company}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup>
                        <CommandItem value="Others" onSelect={() => { setIsOtherCompany(true); setData(prev => ({ ...prev, company: '' })); setCompanyOpen(false); }}
                          className="text-[#A3A3A3]">Others</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {isOtherCompany && (
                <Input placeholder="Type your company" value={data.company || ''} onChange={(e) => setData(prev => ({ ...prev, company: e.target.value }))}
                  className="jt-input" />
              )}

              <Input placeholder="Position (e.g., Sr. Software Engineer) *" value={data.position || ''} onChange={(e) => setData(prev => ({ ...prev, position: e.target.value }))}
                className="jt-input" />

              <Select value={data.workExperience || ''} onValueChange={(v) => setData(prev => ({ ...prev, workExperience: v }))}>
                <SelectTrigger className="h-11 rounded-xl text-sm" style={{ background: '#0C0C0C', border: '1px solid #1F1F1F', color: '#F5F5F5' }}>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent style={{ background: '#1C1C1C', border: '1px solid #2A2A2A', color: '#F5F5F5' }}>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-8">5-8 years</SelectItem>
                  <SelectItem value="8-12">8-12 years</SelectItem>
                  <SelectItem value="12+">12+ years</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {/* Seeker fields */}
          {(data.role === 'seeker' || data.role === 'both') && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              {(data.role === 'both') && <div className="h-px my-2" style={{ background: '#1F1F1F' }} />}
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#525252' }}>Your goals</p>

              <Select value={data.education || ''} onValueChange={(v) => setData(prev => ({ ...prev, education: v }))}>
                <SelectTrigger className="h-11 rounded-xl text-sm" style={{ background: '#0C0C0C', border: '1px solid #1F1F1F', color: '#F5F5F5' }}>
                  <SelectValue placeholder="Education *" />
                </SelectTrigger>
                <SelectContent style={{ background: '#1C1C1C', border: '1px solid #2A2A2A', color: '#F5F5F5' }}>
                  <SelectItem value="bachelors-cs">Bachelor's - CS</SelectItem>
                  <SelectItem value="bachelors-engineering">Bachelor's - Engineering</SelectItem>
                  <SelectItem value="bachelors-other">Bachelor's - Other</SelectItem>
                  <SelectItem value="masters-cs">Master's - CS</SelectItem>
                  <SelectItem value="masters-mba">Master's - MBA</SelectItem>
                  <SelectItem value="masters-other">Master's - Other</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="bootcamp">Bootcamp</SelectItem>
                  <SelectItem value="self-taught">Self-taught</SelectItem>
                </SelectContent>
              </Select>

              <Select value={data.targetDomain || ''} onValueChange={(v) => setData(prev => ({ ...prev, targetDomain: v }))}>
                <SelectTrigger className="h-11 rounded-xl text-sm" style={{ background: '#0C0C0C', border: '1px solid #1F1F1F', color: '#F5F5F5' }}>
                  <SelectValue placeholder="Target domain *" />
                </SelectTrigger>
                <SelectContent style={{ background: '#1C1C1C', border: '1px solid #2A2A2A', color: '#F5F5F5' }}>
                  <SelectItem value="software-engineering">Software Engineering</SelectItem>
                  <SelectItem value="data-science">Data Science & ML</SelectItem>
                  <SelectItem value="product-management">Product Management</SelectItem>
                  <SelectItem value="design">Design (UI/UX)</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="mobile-development">Mobile Dev</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Skills inline */}
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {data.skills?.map((s) => (
                    <span key={s} className="pill pill-lime cursor-pointer hover:opacity-70" onClick={() => setData(prev => ({ ...prev, skills: prev.skills?.filter(x => x !== s) }))}>
                      {s} ×
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add skill (optional)" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    className="jt-input flex-1" />
                  <button onClick={addSkill} className="px-4 h-11 rounded-xl text-sm font-medium"
                    style={{ background: '#1C1C1C', border: '1px solid #1F1F1F', color: '#A3A3A3' }}>Add</button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Submit */}
        <button
          onClick={handleComplete}
          disabled={!canSubmit() || updateProfileMutation.isPending}
          className="w-full h-12 rounded-xl font-bold text-sm mt-6 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100"
          style={{ background: '#A3E635', color: '#0C0C0C' }}
        >
          {updateProfileMutation.isPending ? 'Setting up...' : 'Get Started'}
        </button>
      </motion.div>
    </div>
  );
}
