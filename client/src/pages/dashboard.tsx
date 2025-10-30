import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Search, BarChart3, User, Calendar, MapPin, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RoleToggle from '@/components/role-toggle';
import ReferralCard from '@/components/referral-card';
import ProofUploadModal from '@/components/proof-upload-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/footer';
import React from 'react';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  console.log('user in dashboard', user);
  const [currentRole, setCurrentRole] = useState<'seeker' | 'referrer'>('seeker');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [proofUploadModal, setProofUploadModal] = useState<{
    isOpen: boolean;
    assignmentId: number | null;
  }>({ isOpen: false, assignmentId: null });
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    request: any | null;
  }>({ isOpen: false, request: null });
  const { toast } = useToast();

  const { data: seekerReferrals, isLoading: seekerLoading } = useQuery({
    queryKey: ['/api/referrals/seeker', user?.id],
    enabled: !!user && currentRole === 'seeker',
  });

  const { data: referreRequest, isLoading: referrerLoading } = useQuery({
    queryKey: ['/api/referrals/referrer', user?.id],
    enabled: !!user && currentRole === 'referrer',
  });

  const { data: seekerMetrics, isLoading: seekerMetricsLoading } = useQuery<any>({
    queryKey: ['/api/seeker-metrics', user?.id],
    enabled: !!user && currentRole === 'seeker',
  });
  

  const { data: referrerMetrics, isLoading: referrerMetricsLoading } = useQuery<any>({
    queryKey: ['/api/referrer-metrics', user?.id],
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
    } else if (nav === 'dashboard') {
      setLocation('/dashboard');
    } else if (nav === 'analytics') {
      setLocation('/analytics');
    } else if (nav === 'profile') {
      setLocation('/profile');
    }
  };

  const handleUploadProof = (assignmentId: number) => {
    setProofUploadModal({ isOpen: true, assignmentId });
  };

  const openReferralDetails = (request: any) => {
    setDetailsModal({ isOpen: true, request });
  };

  const handleDecline = async (assignmentId: number) => {
    try {
      await apiRequest('PUT', `/api/assignments/${assignmentId}`, { action: 'reject' });
      // Optimistically close dialog
      setDetailsModal({ isOpen: false, request: null });
      // Invalidate lists
      await queryClient.invalidateQueries({ queryKey: ['/api/referrals/referrer', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['/api/referrals/seeker', user?.id] });
      toast({ title: 'Request declined', description: 'You have declined this referral.' });
    } catch (e: any) {
      toast({ title: 'Failed to decline', description: e?.message || 'Please try again.', variant: 'destructive' as any });
    }
  };

  const handleProofSubmit = async (file: File) => {
    try {
      // Get pre-signed URL for upload
      const presignedResponse = await apiRequest('POST', '/api/upload/proof-presigned-url', {
        fileName: file.name,
        fileType: file.type
      });
      const { uploadUrl, fileUrl } = await presignedResponse.json();

      // Upload file to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Update assignment with proof URL (backend sets referral to verification_pending)
      await apiRequest('PUT', `/api/assignments/${proofUploadModal.assignmentId}`, { proofUrl: fileUrl });

      // Close modal and refresh data
      setProofUploadModal({ isOpen: false, assignmentId: null });
      await queryClient.invalidateQueries({ queryKey: ['/api/referrals/referrer', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['/api/referrals/seeker', user?.id] });
      
      toast({
        title: "Proof Uploaded",
        description: "Your proof has been submitted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error?.message || "Please try again.",
        variant: "destructive" as any,
      });
    }
  };


  const activeRequests = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => 
    ['pending', 'assigned', 'verification_pending'].includes(r.referral?.status)
  ) : [];
  
  const pastRequests = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => 
    ['completed', 'expired', 'cancelled'].includes(r.referral?.status)
  ) : [];

  const assignedRequests = Array.isArray(referreRequest) ? referreRequest.filter((r: any) => 
    r.referral?.status === 'assigned' || r.referral?.status === 'verification_pending'
  ) : [];
  
  const completedRequests = Array.isArray(referreRequest) ? referreRequest.filter((r: any) => 
    r.referral?.status === 'completed'
  ) : [];

  const totalEarnings = parseFloat(referrerMetrics?.totalEarnings ?? '0');
  const monthlyEarnings = parseFloat(referrerMetrics?.monthlyEarnings ?? '0');
  const totalSpent = parseFloat(referrerMetrics?.totalSpent ?? '0');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--purple-light)] rounded-xl flex items-center justify-center">
              <img
                src="https://job-thrive.s3.ap-south-1.amazonaws.com/assets/job-thrive-logo.jpg"
                alt="Job Thrive"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-[var(--dark-gray)]">
              Job Thrive
            </span>
          </div>

          {/* Role Toggle */}
          <RoleToggle
            currentRole={currentRole}
            onRoleChange={handleRoleChange}
          />

          {/* Profile */}
          <div className="flex items-center">
            <div
              className="w-8 h-8 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
              onClick={() => setLocation('/profile')}
            >
              <img
                src={user.photoUrl || ''}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
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
                    <div className="text-2xl font-bold">
                      ₹{seekerMetrics?.totalSpent ?? 0}
                    </div>
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
                    {seekerMetrics?.jobsCount ?? 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Total Jobs</div>
                </CardContent>
              </Card>
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--emerald-success)]">
                    {seekerMetrics?.appliedReferrals ?? 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Applied</div>
                </CardContent>
              </Card>
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--orange-accent)]">
                    {seekerMetrics?.successfulReferrals ?? 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Successful</div>
                </CardContent>
              </Card>
            </div>
            {/* 1v1 Coaching */}
            <div className="mb-8 hover-elevate">
              <Card className="mb-8 hover-elevate">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">1v1 Coaching</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Connect with industry professionals for personalized
                          career guidance
                        </p>
                      </div>
                    </div>
                    <Button data-testid="button-start-coaching" onClick={() => setLocation('/coaching')}>
                      Get Started
                      
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>500+ Mentors</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Flexible Scheduling</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Global Network</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Active Requests */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">
                Active Requests
              </h3>
              {seekerLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : activeRequests.length > 0 ? (
                <div className="space-y-4">
                  {activeRequests.map((r: any) => (
                    <ReferralCard
                      key={r.referral.id}
                      referral={r}
                      onClick={() => openReferralDetails(r)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">
                      No active requests. Start by searching for jobs!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Past Requests */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">
                Past Requests
              </h3>
              {pastRequests.length > 0 ? (
                <div className="space-y-3">
                  {pastRequests.map((referral: any) => (
                    <ReferralCard
                      key={referral.id}
                      referral={referral}
                      onClick={() => openReferralDetails(referral)}
                    />
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
                    <div className="text-3xl font-bold">₹{totalEarnings}</div>
                    <div className="text-sm opacity-75">Total Earned</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center">
                    <div className="text-xl font-bold">
                      ₹{monthlyEarnings.toFixed(0)}
                    </div>
                    <div className="text-xs opacity-75">This Month</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center">
                    <div className="text-xl font-bold">
                      {referrerMetrics?.successfulReferrals}
                    </div>
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
                    {assignedRequests.length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Pending</div>
                </CardContent>
              </Card>
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--emerald-success)]">
                    {completedRequests.length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Completed</div>
                </CardContent>
              </Card>
              <Card className="modern-card card-hover border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold gradient-text">
                    {Array.isArray(referreRequest) && referreRequest.length > 0
                      ? Math.round(
                          (completedRequests.length / referreRequest.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Success Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Assigned Referrals */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">
                Assigned Referrals
              </h3>
              {referrerLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : assignedRequests.length > 0 ? (
                <div className="space-y-4">
                  {assignedRequests.map((r: any) => (
                    <ReferralCard
                      key={r.referral.id}
                      referral={r}
                      isReferrer
                      onClick={() => openReferralDetails(r)}
                      onUploadProof={() => handleUploadProof(r.assignment?.id)}
                      onDecline={() => handleDecline(r.assignment?.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">
                      No assigned referrals at the moment.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Completed Referrals */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">
                Completed Referrals
              </h3>
              {completedRequests.length > 0 ? (
                <div className="space-y-3">
                  {completedRequests.map((r: any) => (
                    <ReferralCard
                      key={r.referral.id}
                      referral={r}
                      isReferrer
                      onClick={() => openReferralDetails(r)}
                      onUploadProof={() => handleUploadProof(r.assignment?.id)}
                      onDecline={() => handleDecline(r.assignment?.id)}
                    />
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
        {/* Policy Links */}
        <div className="px-6 py-2 border-b border-gray-100">
          <div className="flex justify-center space-x-4 text-xs">
            <a 
              href="/terms" 
              className="text-gray-500 hover:text-gray-700 underline"
            >
              Terms
            </a>
            <a 
              href="/privacy" 
              className="text-gray-500 hover:text-gray-700 underline"
            >
              Privacy
            </a>
            <a 
              href="/refund" 
              className="text-gray-500 hover:text-gray-700 underline"
            >
              Refund
            </a>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-around max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick('dashboard')}
            className={`flex flex-col items-center space-y-1 ${
              activeNav === 'dashboard'
                ? 'text-[var(--purple-primary)]'
                : 'text-gray-400'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs font-medium">Dashboard</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick('search')}
            className={`flex flex-col items-center space-y-1 ${
              activeNav === 'search'
                ? 'text-[var(--purple-primary)]'
                : 'text-gray-400'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs font-medium">Search</span>
          </Button>

          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick('analytics')}
            className={`flex flex-col items-center space-y-1 ${
              activeNav === 'analytics' ? 'text-[var(--purple-primary)]' : 'text-gray-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-medium">Analytics</span>
          </Button> */}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick('profile')}
            className={`flex flex-col items-center space-y-1 ${
              activeNav === 'profile'
                ? 'text-[var(--purple-primary)]'
                : 'text-gray-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </Button>
          </div>
        </div>
      </nav>

      {/* Proof Upload Modal */}
      <ProofUploadModal
        isOpen={proofUploadModal.isOpen}
        onClose={() =>
          setProofUploadModal({ isOpen: false, assignmentId: null })
        }
        onSubmit={handleProofSubmit}
      />

      {/* Referral Details Modal */}
      <Dialog
        open={detailsModal.isOpen}
        onOpenChange={open =>
          !open && setDetailsModal({ isOpen: false, request: null })
        }
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--dark-gray)]">
              Referral Details
            </DialogTitle>
          </DialogHeader>
          {detailsModal.request && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[var(--dark-gray)]">
                    {detailsModal.request.job?.title || 'Unknown Position'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {detailsModal.request.job?.company || 'Unknown Company'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {detailsModal.request.job?.location ||
                      'Location not specified'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge>
                    {(detailsModal.request.referral.status || '')
                      .toString()
                      .replace(/^./, (c: string) => c.toUpperCase())}
                  </Badge>
                  <p className="text-sm font-semibold text-[var(--emerald-success)] mt-1">
                    ₹ 499
                  </p>
                </div>
              </div>

              {detailsModal.request.seeker && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Seeker</p>
                  <p className="font-medium text-[var(--dark-gray)]">
                    {detailsModal.request.seeker.name}
                  </p>
                  {detailsModal.request.seeker.email && (
                    <p className="text-sm text-gray-600">
                      {detailsModal.request.seeker.email}
                    </p>
                  )}
                  {detailsModal.request.seeker.experience && (
                    <p className="text-sm text-gray-600">
                      Experience: {detailsModal.request.seeker.experience}
                    </p>
                  )}
                  {detailsModal.request.seeker.skills &&
                    Array.isArray(detailsModal.request.seeker.skills) &&
                    detailsModal.request.seeker.skills.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Skills: {detailsModal.request.seeker.skills.join(', ')}
                      </p>
                    )}
                  {detailsModal.request.referral.resumeUrl &&
                    detailsModal.request.referral.resumeUrl !== '' && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.open(
                              detailsModal.request.referral.resumeUrl,
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                        >
                          View Resume
                        </Button>
                      </div>
                    )}
                </div>
              )}

              <div className="flex space-x-3">
                {currentRole === 'referrer' &&
                  detailsModal.request.referral &&
                  detailsModal.request.referral.status === 'assigned' &&
                  detailsModal.request.referral.referrerId === user.id && (
                    <>
                      <Button
                        className="flex-1 bg-[var(--purple-primary)] hover:bg-[var(--purple-primary)]/90"
                        onClick={() => {
                          setDetailsModal({ isOpen: false, request: null });
                          handleUploadProof(detailsModal.request.assignment.id);
                        }}
                      >
                        Upload Proof
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleDecline(detailsModal.request.assignment.id)
                        }
                      >
                        Decline
                      </Button>
                    </>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
