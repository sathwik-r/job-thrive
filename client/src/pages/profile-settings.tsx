import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Edit3, Briefcase, GraduationCap, Check, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    role: user?.role || 'seeker',
    company: user?.company || '',
    position: user?.position || '',
    department: user?.department || '',
    workExperience: user?.workExperience || '',
    education: user?.education || '',
    targetDomain: user?.targetDomain || '',
    experience: user?.experience || '',
    skills: user?.skills || []
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return apiRequest('POST', '/api/user/profile', profileData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
      setIsEditing(false);
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/profile')}
            className="flex items-center space-x-2 text-gray-500 hover:text-[var(--purple-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <h1 className="text-base font-semibold text-[var(--dark-gray)] tracking-tight">Settings</h1>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className={`transition-colors ${isEditing ? 'text-[var(--emerald-success)]' : 'text-gray-400 hover:text-[var(--purple-primary)]'}`}
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-md mx-auto pb-12">
        {/* Role Selection */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="modern-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Role</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Select
                  value={formData.role}
                  onValueChange={(value: 'seeker' | 'referrer' | 'both') =>
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/20 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeker">Job Seeker</SelectItem>
                    <SelectItem value="referrer">Referrer</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  variant="outline"
                  className="pill-badge bg-gradient-to-r from-[var(--purple-primary)]/8 to-[var(--emerald-success)]/8 border-[var(--purple-primary)]/30 text-[var(--purple-primary)] capitalize px-4 py-1.5 text-xs font-semibold"
                >
                  {user.role === 'both' ? 'Seeker & Referrer' : user.role}
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Referrer Information */}
        {(formData.role === 'referrer' || formData.role === 'both') && (
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card className="modern-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--purple-primary)]/8 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-[var(--purple-primary)]" />
                  </div>
                  <span className="text-sm font-semibold gradient-text">Work Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</Label>
                  {isEditing ? (
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="e.g., Google, Microsoft"
                      className="h-12 rounded-xl border-gray-200 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/20 text-base placeholder:text-gray-300"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[var(--dark-gray)] py-1">{user.company || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</Label>
                  {isEditing ? (
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g., Senior Software Engineer"
                      className="h-12 rounded-xl border-gray-200 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/20 text-base placeholder:text-gray-300"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[var(--dark-gray)] py-1">{user.position || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</Label>
                  {isEditing ? (
                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/20 text-base">
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
                  ) : (
                    <p className="text-sm font-medium text-[var(--dark-gray)] py-1 capitalize">{user.department || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workExperience" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Work Experience</Label>
                  {isEditing ? (
                    <Select value={formData.workExperience} onValueChange={(value) => setFormData(prev => ({ ...prev, workExperience: value }))}>
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/20 text-base">
                        <SelectValue placeholder="Select experience" />
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
                  ) : (
                    <p className="text-sm font-medium text-[var(--dark-gray)] py-1">{user.workExperience || 'Not specified'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Seeker Information */}
        {(formData.role === 'seeker' || formData.role === 'both') && (
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card className="modern-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--emerald-success)]/8 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-[var(--emerald-success)]" />
                  </div>
                  <span className="text-sm font-semibold gradient-text">Job Search Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="education" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Education</Label>
                  {isEditing ? (
                    <Select value={formData.education} onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}>
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/20 text-base">
                        <SelectValue placeholder="Select education" />
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
                  ) : (
                    <p className="text-sm font-medium text-[var(--dark-gray)] py-1">{user.education || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDomain" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Domain</Label>
                  {isEditing ? (
                    <Select value={formData.targetDomain} onValueChange={(value) => setFormData(prev => ({ ...prev, targetDomain: value }))}>
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/20 text-base">
                        <SelectValue placeholder="Select target domain" />
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
                  ) : (
                    <p className="text-sm font-medium text-[var(--dark-gray)] py-1">{user.targetDomain || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Experience Level</Label>
                  {isEditing ? (
                    <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/20 text-base">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid-level">Mid Level (2-5 years)</SelectItem>
                        <SelectItem value="senior-level">Senior Level (5-8 years)</SelectItem>
                        <SelectItem value="staff-principal">Staff/Principal (8+ years)</SelectItem>
                        <SelectItem value="management">Management/Leadership</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium text-[var(--dark-gray)] py-1">{user.experience || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills</Label>
                  <div>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="pill-badge inline-flex items-center bg-[var(--purple-primary)]/8 text-[var(--purple-primary)] px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors"
                              onClick={() => removeSkill(skill)}
                            >
                              {skill}
                              <X className="w-3 h-3 ml-1.5" />
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add a skill..."
                            className="flex-1 h-12 rounded-xl border-gray-200 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/20 text-base placeholder:text-gray-300"
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
                            className="h-12 px-5 rounded-xl border-[var(--purple-primary)]/30 text-[var(--purple-primary)] hover:bg-[var(--purple-primary)] hover:text-white transition-colors"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.skills && user.skills.length > 0 ? (
                          user.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="pill-badge inline-flex items-center bg-[var(--purple-primary)]/8 text-[var(--purple-primary)] px-3.5 py-1.5 rounded-full text-xs font-semibold"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic">No skills added yet</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Save Button */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="w-full h-14 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] text-white rounded-2xl font-semibold text-base shadow-lg shadow-[var(--purple-primary)]/20 hover:shadow-xl hover:shadow-[var(--purple-primary)]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Save className="w-4.5 h-4.5 mr-2.5" />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
