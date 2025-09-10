import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Edit3, Briefcase, GraduationCap } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/profile')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-lg font-semibold text-[var(--dark-gray)]">Profile Settings</h1>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Role Selection */}
        <Card className="modern-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold gradient-text">Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Select 
                value={formData.role} 
                onValueChange={(value: 'seeker' | 'referrer' | 'both') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="w-full">
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
                className="bg-gradient-to-r from-[var(--purple-primary)]/10 to-[var(--emerald-success)]/10 border-[var(--purple-primary)] text-[var(--purple-primary)] capitalize"
              >
                {user.role === 'both' ? 'Seeker & Referrer' : user.role}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Referrer Information */}
        {(formData.role === 'referrer' || formData.role === 'both') && (
          <Card className="modern-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold gradient-text flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Work Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company" className="text-sm font-medium text-[var(--dark-gray)]">Company</Label>
                {isEditing ? (
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g., Google, Microsoft"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-600 mt-1">{user.company || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="position" className="text-sm font-medium text-[var(--dark-gray)]">Position</Label>
                {isEditing ? (
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Senior Software Engineer"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-600 mt-1">{user.position || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="department" className="text-sm font-medium text-[var(--dark-gray)]">Department</Label>
                {isEditing ? (
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger className="mt-1">
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
                  <p className="text-gray-600 mt-1 capitalize">{user.department || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="workExperience" className="text-sm font-medium text-[var(--dark-gray)]">Work Experience</Label>
                {isEditing ? (
                  <Select value={formData.workExperience} onValueChange={(value) => setFormData(prev => ({ ...prev, workExperience: value }))}>
                    <SelectTrigger className="mt-1">
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
                  <p className="text-gray-600 mt-1">{user.workExperience || 'Not specified'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seeker Information */}
        {(formData.role === 'seeker' || formData.role === 'both') && (
          <Card className="modern-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold gradient-text flex items-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>Job Search Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="education" className="text-sm font-medium text-[var(--dark-gray)]">Education</Label>
                {isEditing ? (
                  <Select value={formData.education} onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}>
                    <SelectTrigger className="mt-1">
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
                  <p className="text-gray-600 mt-1">{user.education || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="targetDomain" className="text-sm font-medium text-[var(--dark-gray)]">Target Domain</Label>
                {isEditing ? (
                  <Select value={formData.targetDomain} onValueChange={(value) => setFormData(prev => ({ ...prev, targetDomain: value }))}>
                    <SelectTrigger className="mt-1">
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
                  <p className="text-gray-600 mt-1">{user.targetDomain || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-[var(--dark-gray)]">Experience Level</Label>
                {isEditing ? (
                  <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                    <SelectTrigger className="mt-1">
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
                  <p className="text-gray-600 mt-1">{user.experience || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-[var(--dark-gray)]">Skills</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.skills.map((skill, index) => (
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
                          placeholder="Add a skill"
                          className="flex-1"
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
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-[var(--purple-primary)]/10 text-[var(--purple-primary)]">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-600">No skills added</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        {isEditing && (
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="w-full bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] text-white py-3 rounded-xl font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>
    </div>
  );
}