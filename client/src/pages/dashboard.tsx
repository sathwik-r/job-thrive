import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Bell, Search, BarChart3, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import RoleToggle from '@/components/role-toggle';
import ReferralCard from '@/components/referral-card';
import ProofUploadModal from '@/components/proof-upload-modal';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [currentRole, setCurrentRole] = useState<'seeker' | 'referrer'>('seeker');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [proofUploadModal, setProofUploadModal] = useState<{
    isOpen: boolean;
    referralId: number | null;
  }>({ isOpen: false, referralId: null });
  const { toast } = useToast();

  const { data: seekerReferrals, isLoading: seekerLoading } = useQuery({
    queryKey: ['/api/referrals/seeker', user?.id],
    enabled: !!user && currentRole === 'seeker',
  });

  const { data: referrerReferrals, isLoading: referrerLoading } = useQuery({
    queryKey: ['/api/referrals/referrer', user?.id],
    enabled: !!user && currentRole === 'referrer',
  });

  if (!user) {
    return null;
  }

  const handleRoleChange = (role: 'seeker' | 'referrer') => {
    setCurrentRole(role);
  };

  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
    if (nav === 'search') {
      setLocation('/job-search');
    }
  };

  const handleUploadProof = (referralId: number) => {
    setProofUploadModal({ isOpen: true, referralId });
  };

  const handleProofSubmit = async (file: File) => {
    // In production, upload to Firebase Storage and update referral
    toast({
      title: "Proof Uploaded",
      description: "Your proof has been submitted successfully.",
    });
    
    // Close modal and refresh data
    setProofUploadModal({ isOpen: false, referralId: null });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const activeReferrals = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => 
    ['pending', 'assigned', 'in_review'].includes(r.status)
  ) : [];
  
  const pastReferrals = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => 
    ['completed', 'expired', 'cancelled'].includes(r.status)
  ) : [];

  const assignedReferrals = Array.isArray(referrerReferrals) ? referrerReferrals.filter((r: any) => 
    r.status === 'assigned'
  ) : [];
  
  const completedReferrals = Array.isArray(referrerReferrals) ? referrerReferrals.filter((r: any) => 
    r.status === 'completed'
  ) : [];

  const totalEarnings = parseFloat(user.totalEarnings);
  const totalSpent = parseFloat(user.totalSpent);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--purple-light)] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l12-4-4 12m0 0L8 15m8 0V7M8 15l0-8"></path>
              </svg>
            </div>
            <span className="text-xl font-bold text-[var(--dark-gray)]">Circl</span>
          </div>
          
          {/* Role Toggle */}
          <RoleToggle currentRole={currentRole} onRoleChange={handleRoleChange} />
          
          {/* Profile */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-[var(--orange-accent)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-white text-sm font-semibold">
                {getInitials(user.name)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pb-20">
        {currentRole === 'seeker' ? (
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-[var(--purple-primary)] to-[var(--purple-light)] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="opacity-90">Ready to find your dream job?</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${totalSpent}</div>
                    <div className="text-sm opacity-75">Total Invested</div>
                  </div>
                </div>
                <Button 
                  onClick={() => setLocation('/job-search')}
                  className="w-full bg-white/20 backdrop-blur-lg text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-300"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find Jobs
                </Button>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold gradient-text">
                    {activeReferrals.length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Active</div>
                </CardContent>
              </Card>
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--emerald-success)]">
                    {completedReferrals.length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Completed</div>
                </CardContent>
              </Card>
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--orange-accent)]">
                    {Array.isArray(seekerReferrals) && seekerReferrals.length > 0 ? Math.round((pastReferrals.filter(r => r.status === 'completed').length / seekerReferrals.length) * 100) : 0}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Success Rate</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Active Requests */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">Active Requests</h3>
              {seekerLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : activeReferrals.length > 0 ? (
                <div className="space-y-4">
                  {activeReferrals.map((referral: any) => (
                    <ReferralCard key={referral.id} referral={referral} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No active requests. Start by searching for jobs!</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Past Requests */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">Past Requests</h3>
              {pastReferrals.length > 0 ? (
                <div className="space-y-3">
                  {pastReferrals.map((referral: any) => (
                    <ReferralCard key={referral.id} referral={referral} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No past requests yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Referrer View */
          <div className="p-6 space-y-6">
            {/* Earnings Overview */}
            <Card className="bg-gradient-to-r from-[var(--emerald-success)] to-[var(--purple-light)] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="opacity-90">Your referral earnings</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">${totalEarnings}</div>
                    <div className="text-sm opacity-75">Total Earned</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center">
                    <div className="text-xl font-bold">${(totalEarnings * 0.25).toFixed(0)}</div>
                    <div className="text-xs opacity-75">This Month</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center">
                    <div className="text-xl font-bold">{user.successfulReferrals}</div>
                    <div className="text-xs opacity-75">Successful</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--orange-accent)]">
                    {assignedReferrals.length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Pending</div>
                </CardContent>
              </Card>
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--emerald-success)]">
                    {completedReferrals.length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Completed</div>
                </CardContent>
              </Card>
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold gradient-text">
                    {Array.isArray(referrerReferrals) && referrerReferrals.length > 0 ? Math.round((completedReferrals.length / referrerReferrals.length) * 100) : 0}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Success Rate</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Assigned Referrals */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">Assigned Referrals</h3>
              {referrerLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : assignedReferrals.length > 0 ? (
                <div className="space-y-4">
                  {assignedReferrals.map((referral: any) => (
                    <ReferralCard 
                      key={referral.id} 
                      referral={referral} 
                      isReferrer 
                      onUploadProof={() => handleUploadProof(referral.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No assigned referrals at the moment.</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Completed Referrals */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">Completed Referrals</h3>
              {completedReferrals.length > 0 ? (
                <div className="space-y-3">
                  {completedReferrals.map((referral: any) => (
                    <ReferralCard key={referral.id} referral={referral} isReferrer />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No completed referrals yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-20">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick('dashboard')}
            className={`flex flex-col items-center space-y-1 ${
              activeNav === 'dashboard' ? 'text-[var(--purple-primary)]' : 'text-gray-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Dashboard</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick('search')}
            className={`flex flex-col items-center space-y-1 ${
              activeNav === 'search' ? 'text-[var(--purple-primary)]' : 'text-gray-400'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs font-medium">Search</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-medium">Analytics</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </Button>
        </div>
      </nav>

      {/* Proof Upload Modal */}
      <ProofUploadModal
        isOpen={proofUploadModal.isOpen}
        onClose={() => setProofUploadModal({ isOpen: false, referralId: null })}
        onSubmit={handleProofSubmit}
      />
    </div>
  );
}
