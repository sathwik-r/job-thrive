import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Search, Home, User, Calendar, MapPin, Users, MessageSquare } from 'lucide-react';
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
import Logo from '@/components/logo';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glassmorphism sticky top-0 z-30 px-6 py-3"
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Logo */}
          <Logo showText={true} size={32} />

          {/* Role Toggle */}
          <RoleToggle
            currentRole={currentRole}
            onRoleChange={handleRoleChange}
          />

          {/* Profile */}
          <div
            className="w-10 h-10 rounded-full ring-2 ring-purple-200 ring-offset-2 cursor-pointer hover:scale-110 transition-transform duration-200 overflow-hidden"
            onClick={() => setLocation('/profile')}
          >
            <img
              src={user.photoUrl || ''}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="pb-36">
        <AnimatePresence mode="wait">
          {currentRole === 'seeker' ? (
            <motion.div
              key="seeker"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="px-5 py-6 space-y-8 max-w-2xl mx-auto"
            >
              {/* Welcome Section */}
              <motion.div variants={itemVariants} className="animate-fade-in">
                <Card className="modern-card border-0 overflow-hidden bg-gradient-to-br from-[var(--purple-primary)] via-[#7c3aed] to-[var(--purple-light)] text-white shadow-xl">
                  <CardContent className="p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">{user.name}</h2>
                        <p className="text-white/80 text-sm mt-1">Ready to find your dream job?</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-extrabold">
                          Rs.{seekerMetrics?.totalSpent ?? 0}
                        </div>
                        <div className="text-xs text-white/60 mt-1 font-medium uppercase tracking-wider">Total Invested</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setLocation('/job-search')}
                      className="w-full bg-white/20 backdrop-blur-xl text-white font-semibold py-4 px-6 rounded-2xl hover:bg-white/30 transition-all duration-300 text-base h-auto"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Find Jobs
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 animate-slide-up">
                <Card className="stat-card modern-card card-hover border-0">
                  <CardContent className="p-5 text-center">
                    <div className="text-3xl font-extrabold gradient-text">
                      {seekerMetrics?.jobsCount ?? 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">Total Jobs</div>
                  </CardContent>
                </Card>
                <Card className="stat-card modern-card card-hover border-0">
                  <CardContent className="p-5 text-center">
                    <div className="text-3xl font-extrabold text-[var(--emerald-success)]">
                      {seekerMetrics?.appliedReferrals ?? 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">Applied</div>
                  </CardContent>
                </Card>
                <Card className="stat-card modern-card card-hover border-0">
                  <CardContent className="p-5 text-center">
                    <div className="text-3xl font-extrabold text-[var(--orange-accent)]">
                      {seekerMetrics?.successfulReferrals ?? 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">Successful</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 1v1 Coaching */}
              <motion.div variants={itemVariants} className="animate-slide-up">
                <Card className="modern-card card-hover hover-elevate border-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-[var(--purple-primary)]" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">1v1 Coaching</CardTitle>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Personalized career guidance from industry pros
                          </p>
                        </div>
                      </div>
                      <Button
                        data-testid="button-start-coaching"
                        onClick={() => setLocation('/coaching')}
                        className="rounded-xl px-5 h-10"
                      >
                        Get Started
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-purple-400" />
                        <span>500+ Mentors</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <span>Flexible Scheduling</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        <span>Global Network</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Active Requests */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-extrabold text-[var(--dark-gray)] mb-5">
                  Active Requests
                </h3>
                {seekerLoading ? (
                  <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : activeRequests.length > 0 ? (
                  <div className="space-y-4">
                    {activeRequests.map((r: any, index: number) => (
                      <motion.div
                        key={r.referral.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.35 }}
                      >
                        <ReferralCard
                          referral={r}
                          onClick={() => openReferralDetails(r)}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="modern-card border-0">
                    <CardContent className="p-10 text-center">
                      <p className="text-gray-400 text-sm">
                        No active requests. Start by searching for jobs!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              {/* Past Requests */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-extrabold text-[var(--dark-gray)] mb-5">
                  Past Requests
                </h3>
                {pastRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pastRequests.map((referral: any, index: number) => (
                      <motion.div
                        key={referral.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.35 }}
                      >
                        <ReferralCard
                          referral={referral}
                          onClick={() => openReferralDetails(referral)}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="modern-card border-0">
                    <CardContent className="p-10 text-center">
                      <p className="text-gray-400 text-sm">No past requests yet.</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </motion.div>
          ) : (
            /* Referrer View */
            <motion.div
              key="referrer"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="px-5 py-6 space-y-8 max-w-2xl mx-auto"
            >
              {/* Earnings Overview */}
              <motion.div variants={itemVariants} className="animate-fade-in">
                <Card className="modern-card border-0 overflow-hidden bg-gradient-to-br from-[var(--emerald-success)] via-emerald-500 to-[var(--purple-light)] text-white shadow-xl">
                  <CardContent className="p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">{user.name}</h2>
                        <p className="text-white/80 text-sm mt-1">Your referral earnings</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-extrabold">Rs.{totalEarnings}</div>
                        <div className="text-xs text-white/60 mt-1 font-medium uppercase tracking-wider">Total Earned</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="glassmorphism rounded-2xl p-5 text-center">
                        <div className="text-2xl font-extrabold">
                          Rs.{monthlyEarnings.toFixed(0)}
                        </div>
                        <div className="text-xs text-white/60 mt-1 font-medium uppercase tracking-wider">This Month</div>
                      </div>
                      <div className="glassmorphism rounded-2xl p-5 text-center">
                        <div className="text-2xl font-extrabold">
                          {referrerMetrics?.successfulReferrals}
                        </div>
                        <div className="text-xs text-white/60 mt-1 font-medium uppercase tracking-wider">Successful</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 animate-slide-up">
                <Card className="stat-card modern-card card-hover border-0">
                  <CardContent className="p-5 text-center">
                    <div className="text-3xl font-extrabold text-[var(--orange-accent)]">
                      {assignedRequests.length}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">Pending</div>
                  </CardContent>
                </Card>
                <Card className="stat-card modern-card card-hover border-0">
                  <CardContent className="p-5 text-center">
                    <div className="text-3xl font-extrabold text-[var(--emerald-success)]">
                      {completedRequests.length}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">Completed</div>
                  </CardContent>
                </Card>
                <Card className="stat-card modern-card card-hover border-0">
                  <CardContent className="p-5 text-center">
                    <div className="text-3xl font-extrabold gradient-text">
                      {Array.isArray(referreRequest) && referreRequest.length > 0
                        ? Math.round(
                            (completedRequests.length / referreRequest.length) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">Success Rate</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Assigned Referrals */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-extrabold text-[var(--dark-gray)] mb-5">
                  Assigned Referrals
                </h3>
                {referrerLoading ? (
                  <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : assignedRequests.length > 0 ? (
                  <div className="space-y-4">
                    {assignedRequests.map((r: any, index: number) => (
                      <motion.div
                        key={r.referral.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.35 }}
                      >
                        <ReferralCard
                          referral={r}
                          isReferrer
                          onClick={() => openReferralDetails(r)}
                          onUploadProof={() => handleUploadProof(r.assignment?.id)}
                          onDecline={() => handleDecline(r.assignment?.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="modern-card border-0">
                    <CardContent className="p-10 text-center">
                      <p className="text-gray-400 text-sm">
                        No assigned referrals at the moment.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              {/* Completed Referrals */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-extrabold text-[var(--dark-gray)] mb-5">
                  Completed Referrals
                </h3>
                {completedRequests.length > 0 ? (
                  <div className="space-y-4">
                    {completedRequests.map((r: any, index: number) => (
                      <motion.div
                        key={r.referral.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.35 }}
                      >
                        <ReferralCard
                          referral={r}
                          isReferrer
                          onClick={() => openReferralDetails(r)}
                          onUploadProof={() => handleUploadProof(r.assignment?.id)}
                          onDecline={() => handleDecline(r.assignment?.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="modern-card border-0">
                    <CardContent className="p-10 text-center">
                      <p className="text-gray-400 text-sm">No completed referrals yet.</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-20">
        {/* Policy Links */}
        <div className="px-6 py-2 border-b border-gray-100/50">
          <div className="flex justify-center space-x-6 text-xs">
            <a
              href="/terms"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy
            </a>
            <a
              href="/refund"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Refund
            </a>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleNavClick('dashboard')}
              className={`flex flex-col items-center gap-1 min-w-[72px] min-h-[56px] rounded-2xl transition-all duration-200 ${
                activeNav === 'dashboard'
                  ? 'text-[var(--purple-primary)] bg-purple-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-semibold">Dashboard</span>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleNavClick('search')}
              className={`flex flex-col items-center gap-1 min-w-[72px] min-h-[56px] rounded-2xl transition-all duration-200 ${
                activeNav === 'search'
                  ? 'text-[var(--purple-primary)] bg-purple-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-xs font-semibold">Search</span>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleNavClick('profile')}
              className={`flex flex-col items-center gap-1 min-w-[72px] min-h-[56px] rounded-2xl transition-all duration-200 ${
                activeNav === 'profile'
                  ? 'text-[var(--purple-primary)] bg-purple-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-semibold">Profile</span>
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
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-[var(--dark-gray)]">
              Referral Details
            </DialogTitle>
          </DialogHeader>
          {detailsModal.request && (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={`https://logo.clearbit.com/${(detailsModal.request.job?.company || 'example').toLowerCase().replace(/\s+/g, '')}.com`}
                    alt={detailsModal.request.job?.company || ''}
                    className="company-logo w-12 h-12 rounded-xl object-contain bg-gray-50 p-1.5"
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <p className="font-bold text-lg text-[var(--dark-gray)]">
                      {detailsModal.request.job?.title || 'Unknown Position'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {detailsModal.request.job?.company || 'Unknown Company'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {detailsModal.request.job?.location ||
                        'Location not specified'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="pill-badge">
                    {(detailsModal.request.referral.status || '')
                      .toString()
                      .replace(/^./, (c: string) => c.toUpperCase())}
                  </Badge>
                  <p className="text-sm font-bold text-[var(--emerald-success)] mt-2">
                    Rs.499
                  </p>
                </div>
              </div>

              {detailsModal.request.seeker && (
                <div className="bg-gray-50/80 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Seeker</p>
                  <p className="font-semibold text-[var(--dark-gray)]">
                    {detailsModal.request.seeker.name}
                  </p>
                  {detailsModal.request.seeker.email && (
                    <p className="text-sm text-gray-500 mt-1">
                      {detailsModal.request.seeker.email}
                    </p>
                  )}
                  {detailsModal.request.seeker.experience && (
                    <p className="text-sm text-gray-500">
                      Experience: {detailsModal.request.seeker.experience}
                    </p>
                  )}
                  {detailsModal.request.seeker.skills &&
                    Array.isArray(detailsModal.request.seeker.skills) &&
                    detailsModal.request.seeker.skills.length > 0 && (
                      <p className="text-sm text-gray-500">
                        Skills: {detailsModal.request.seeker.skills.join(', ')}
                      </p>
                    )}
                  {detailsModal.request.referral.resumeUrl &&
                    detailsModal.request.referral.resumeUrl !== '' && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          className="rounded-xl"
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

              <div className="flex space-x-3 pt-2">
                {currentRole === 'referrer' &&
                  detailsModal.request.referral &&
                  detailsModal.request.referral.status === 'assigned' &&
                  detailsModal.request.referral.referrerId === user.id && (
                    <>
                      <Button
                        className="flex-1 bg-[var(--purple-primary)] hover:bg-[var(--purple-primary)]/90 rounded-xl h-12 text-base font-semibold"
                        onClick={() => {
                          setDetailsModal({ isOpen: false, request: null });
                          handleUploadProof(detailsModal.request.assignment.id);
                        }}
                      >
                        Upload Proof
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-500 hover:bg-red-50 rounded-xl h-12 text-base font-semibold"
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
