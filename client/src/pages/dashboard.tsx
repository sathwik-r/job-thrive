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

  const totalJobs = seekerMetrics?.jobsCount ?? 0;

  return (
    <div className="min-h-screen" style={{ background: '#0B0A10' }}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-30 px-6 py-3"
        style={{
          background: 'rgba(11, 10, 16, 0.85)',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          borderBottom: '1px solid #252336',
        }}
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Logo */}
          <Logo showText={false} size={28} />

          {/* Role Toggle */}
          <RoleToggle
            currentRole={currentRole}
            onRoleChange={handleRoleChange}
          />

          {/* Profile Avatar with green ring */}
          <div
            className="w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 overflow-hidden"
            style={{
              boxShadow: '0 0 0 2px #0B0A10, 0 0 0 4px #1DB954',
            }}
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
              className="px-5 py-6 space-y-6 max-w-2xl mx-auto"
            >
              {/* Welcome Card */}
              <motion.div variants={itemVariants}>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: '#1A1828',
                    border: '1px solid #252336',
                  }}
                >
                  {/* Gradient top border */}
                  <div
                    style={{
                      height: '3px',
                      background: 'linear-gradient(135deg, #6D5BF7 0%, #A259FF 50%, #1DB954 100%)',
                    }}
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <span
                          className="text-label"
                          style={{ color: '#5C5A72' }}
                        >
                          WELCOME BACK
                        </span>
                        <h2
                          className="mt-1"
                          style={{
                            fontSize: '24px',
                            fontWeight: 900,
                            color: '#FAFAFA',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {user.name}
                        </h2>
                      </div>
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(29, 185, 84, 0.12)' }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: '#1DB954' }}
                        />
                        <span
                          style={{
                            color: '#1DB954',
                            fontSize: '13px',
                            fontWeight: 700,
                          }}
                        >
                          Rs.{seekerMetrics?.totalSpent ?? 0} invested
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setLocation('/job-search')}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-[15px] transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        background: 'linear-gradient(135deg, #6D5BF7, #1DB954)',
                      }}
                    >
                      <Search className="w-4.5 h-4.5" />
                      Explore {totalJobs} Jobs
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 3 Stat Cards */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
                {/* JOBS - purple top accent */}
                <div className="stat-card rounded-2xl overflow-hidden" style={{ ['--tw-stat-accent' as any]: '#6D5BF7' }}>
                  <div style={{ height: '2px', background: '#6D5BF7' }} />
                  <div className="p-4 text-center">
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#6D5BF7',
                      }}
                    >
                      {seekerMetrics?.jobsCount ?? 0}
                    </div>
                    <div className="text-label mt-1.5">JOBS</div>
                  </div>
                </div>

                {/* APPLIED - green top accent */}
                <div className="stat-card rounded-2xl overflow-hidden">
                  <div style={{ height: '2px', background: '#1DB954' }} />
                  <div className="p-4 text-center">
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#1DB954',
                      }}
                    >
                      {seekerMetrics?.appliedReferrals ?? 0}
                    </div>
                    <div className="text-label mt-1.5">APPLIED</div>
                  </div>
                </div>

                {/* SUCCESS - coral top accent */}
                <div className="stat-card rounded-2xl overflow-hidden">
                  <div style={{ height: '2px', background: '#FF7262' }} />
                  <div className="p-4 text-center">
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#FF7262',
                      }}
                    >
                      {seekerMetrics?.successfulReferrals ?? 0}
                    </div>
                    <div className="text-label mt-1.5">SUCCESS</div>
                  </div>
                </div>
              </motion.div>

              {/* Coaching CTA */}
              <motion.div variants={itemVariants}>
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: '#1A1828',
                    border: '1px solid #252336',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(162, 89, 255, 0.12)' }}
                      >
                        <MessageSquare className="h-6 w-6" style={{ color: '#A259FF' }} />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#FAFAFA',
                          }}
                        >
                          1v1 Coaching
                        </h3>
                        <p style={{ fontSize: '13px', color: '#A1A0B3', marginTop: '2px' }}>
                          500+ mentors available
                        </p>
                      </div>
                    </div>
                    <button
                      data-testid="button-start-coaching"
                      onClick={() => setLocation('/coaching')}
                      className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
                      style={{
                        background: '#A259FF',
                        color: '#FAFAFA',
                      }}
                    >
                      Start
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* ACTIVE REFERRALS section */}
              <motion.div variants={itemVariants}>
                <div className="text-label mb-4" style={{ color: '#5C5A72' }}>
                  ACTIVE REFERRALS
                </div>
                {seekerLoading ? (
                  <div className="text-center py-12" style={{ color: '#5C5A72' }}>Loading...</div>
                ) : activeRequests.length > 0 ? (
                  <div className="space-y-3">
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
                  <div
                    className="rounded-2xl p-10 text-center"
                    style={{
                      background: '#1A1828',
                      border: '1px solid #252336',
                    }}
                  >
                    <p style={{ color: '#5C5A72', fontSize: '14px' }}>
                      No active requests. Start by searching for jobs!
                    </p>
                  </div>
                )}
              </motion.div>

              {/* PAST REFERRALS section */}
              <motion.div variants={itemVariants}>
                <div className="text-label mb-4" style={{ color: '#5C5A72' }}>
                  PAST REFERRALS
                </div>
                {pastRequests.length > 0 ? (
                  <div className="space-y-3">
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
                  <div
                    className="rounded-2xl p-10 text-center"
                    style={{
                      background: '#1A1828',
                      border: '1px solid #252336',
                    }}
                  >
                    <p style={{ color: '#5C5A72', fontSize: '14px' }}>No past requests yet.</p>
                  </div>
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
              className="px-5 py-6 space-y-6 max-w-2xl mx-auto"
            >
              {/* Earnings Card */}
              <motion.div variants={itemVariants}>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: '#1A1828',
                    border: '1px solid #252336',
                  }}
                >
                  {/* Gradient top border */}
                  <div
                    style={{
                      height: '3px',
                      background: 'linear-gradient(135deg, #6D5BF7 0%, #A259FF 50%, #1DB954 100%)',
                    }}
                  />
                  <div className="p-6">
                    <span className="text-label" style={{ color: '#5C5A72' }}>
                      TOTAL EARNED
                    </span>
                    <div
                      className="mt-1 mb-5"
                      style={{
                        fontSize: '32px',
                        fontWeight: 900,
                        color: '#1DB954',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Rs.{totalEarnings}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="rounded-xl p-4 text-center"
                        style={{ background: '#211F30' }}
                      >
                        <div
                          style={{
                            fontSize: '20px',
                            fontWeight: 900,
                            color: '#FAFAFA',
                          }}
                        >
                          Rs.{monthlyEarnings.toFixed(0)}
                        </div>
                        <div className="text-label mt-1">THIS MONTH</div>
                      </div>
                      <div
                        className="rounded-xl p-4 text-center"
                        style={{ background: '#211F30' }}
                      >
                        <div
                          style={{
                            fontSize: '20px',
                            fontWeight: 900,
                            color: '#FAFAFA',
                          }}
                        >
                          {referrerMetrics?.successfulReferrals ?? 0}
                        </div>
                        <div className="text-label mt-1">SUCCESSFUL</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 3 Stat Cards */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
                {/* Pending - amber */}
                <div className="stat-card rounded-2xl overflow-hidden">
                  <div style={{ height: '2px', background: '#FFB347' }} />
                  <div className="p-4 text-center">
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#FFB347',
                      }}
                    >
                      {assignedRequests.length}
                    </div>
                    <div className="text-label mt-1.5">PENDING</div>
                  </div>
                </div>

                {/* Completed - green */}
                <div className="stat-card rounded-2xl overflow-hidden">
                  <div style={{ height: '2px', background: '#1DB954' }} />
                  <div className="p-4 text-center">
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#1DB954',
                      }}
                    >
                      {completedRequests.length}
                    </div>
                    <div className="text-label mt-1.5">COMPLETED</div>
                  </div>
                </div>

                {/* Success Rate - purple */}
                <div className="stat-card rounded-2xl overflow-hidden">
                  <div style={{ height: '2px', background: '#6D5BF7' }} />
                  <div className="p-4 text-center">
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#6D5BF7',
                      }}
                    >
                      {Array.isArray(referreRequest) && referreRequest.length > 0
                        ? Math.round(
                            (completedRequests.length / referreRequest.length) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-label mt-1.5">SUCCESS RATE</div>
                  </div>
                </div>
              </motion.div>

              {/* Assigned Referrals */}
              <motion.div variants={itemVariants}>
                <div className="text-label mb-4" style={{ color: '#5C5A72' }}>
                  ASSIGNED REFERRALS
                </div>
                {referrerLoading ? (
                  <div className="text-center py-12" style={{ color: '#5C5A72' }}>Loading...</div>
                ) : assignedRequests.length > 0 ? (
                  <div className="space-y-3">
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
                  <div
                    className="rounded-2xl p-10 text-center"
                    style={{
                      background: '#1A1828',
                      border: '1px solid #252336',
                    }}
                  >
                    <p style={{ color: '#5C5A72', fontSize: '14px' }}>
                      No assigned referrals at the moment.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Completed Referrals */}
              <motion.div variants={itemVariants}>
                <div className="text-label mb-4" style={{ color: '#5C5A72' }}>
                  COMPLETED REFERRALS
                </div>
                {completedRequests.length > 0 ? (
                  <div className="space-y-3">
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
                  <div
                    className="rounded-2xl p-10 text-center"
                    style={{
                      background: '#1A1828',
                      border: '1px solid #252336',
                    }}
                  >
                    <p style={{ color: '#5C5A72', fontSize: '14px' }}>No completed referrals yet.</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-20">
        {/* Policy Links */}
        <div className="px-6 py-2" style={{ borderBottom: '1px solid #252336' }}>
          <div className="flex justify-center space-x-6 text-xs">
            <a
              href="/terms"
              className="transition-colors"
              style={{ color: '#3F3D52' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#A1A0B3')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3F3D52')}
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="transition-colors"
              style={{ color: '#3F3D52' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#A1A0B3')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3F3D52')}
            >
              Privacy
            </a>
            <a
              href="/refund"
              className="transition-colors"
              style={{ color: '#3F3D52' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#A1A0B3')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3F3D52')}
            >
              Refund
            </a>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {[
              { key: 'dashboard', icon: Home, label: 'Home' },
              { key: 'search', icon: Search, label: 'Search' },
              { key: 'profile', icon: User, label: 'Profile' },
            ].map(({ key, icon: Icon, label }) => {
              const isActive = activeNav === key;
              return (
                <button
                  key={key}
                  onClick={() => handleNavClick(key)}
                  className="flex flex-col items-center gap-1 min-w-[64px] min-h-[52px] justify-center rounded-xl transition-all duration-200 relative"
                  style={{
                    color: isActive ? '#6D5BF7' : '#5C5A72',
                    background: 'transparent',
                  }}
                >
                  {/* Purple glow dot for active */}
                  {isActive && (
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: '#6D5BF7',
                        boxShadow: '0 0 8px 2px rgba(109, 91, 247, 0.5)',
                      }}
                    />
                  )}
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">{label}</span>
                </button>
              );
            })}
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
        <DialogContent
          className="sm:max-w-lg rounded-2xl border-0"
          style={{
            background: '#1A1828',
            border: '1px solid #252336',
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: '#FAFAFA',
              }}
            >
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
                    className="company-logo w-12 h-12 rounded-xl object-contain p-1.5"
                    style={{ background: '#13121D', border: '1px solid #252336' }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: '16px',
                        color: '#FAFAFA',
                      }}
                    >
                      {detailsModal.request.job?.title || 'Unknown Position'}
                    </p>
                    <p style={{ fontSize: '13px', color: '#A1A0B3', marginTop: '2px' }}>
                      {detailsModal.request.job?.company || 'Unknown Company'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#5C5A72', marginTop: '2px' }}>
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
                  <p
                    className="mt-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1DB954',
                    }}
                  >
                    Rs.499
                  </p>
                </div>
              </div>

              {detailsModal.request.seeker && (
                <div
                  className="rounded-xl p-5"
                  style={{ background: '#211F30' }}
                >
                  <p className="text-label mb-2" style={{ color: '#5C5A72' }}>
                    SEEKER
                  </p>
                  <p style={{ fontWeight: 600, color: '#FAFAFA' }}>
                    {detailsModal.request.seeker.name}
                  </p>
                  {detailsModal.request.seeker.email && (
                    <p style={{ fontSize: '13px', color: '#A1A0B3', marginTop: '4px' }}>
                      {detailsModal.request.seeker.email}
                    </p>
                  )}
                  {detailsModal.request.seeker.experience && (
                    <p style={{ fontSize: '13px', color: '#A1A0B3' }}>
                      Experience: {detailsModal.request.seeker.experience}
                    </p>
                  )}
                  {detailsModal.request.seeker.skills &&
                    Array.isArray(detailsModal.request.seeker.skills) &&
                    detailsModal.request.seeker.skills.length > 0 && (
                      <p style={{ fontSize: '13px', color: '#A1A0B3' }}>
                        Skills: {detailsModal.request.seeker.skills.join(', ')}
                      </p>
                    )}
                  {detailsModal.request.referral.resumeUrl &&
                    detailsModal.request.referral.resumeUrl !== '' && (
                      <div className="mt-4">
                        <button
                          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
                          style={{
                            background: '#302D45',
                            color: '#FAFAFA',
                            border: '1px solid #252336',
                          }}
                          onClick={() =>
                            window.open(
                              detailsModal.request.referral.resumeUrl,
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                        >
                          View Resume
                        </button>
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
                      <button
                        className="flex-1 rounded-xl h-12 text-[15px] font-semibold text-white transition-all duration-200 hover:opacity-90"
                        style={{
                          background: '#6D5BF7',
                        }}
                        onClick={() => {
                          setDetailsModal({ isOpen: false, request: null });
                          handleUploadProof(detailsModal.request.assignment.id);
                        }}
                      >
                        Upload Proof
                      </button>
                      <button
                        className="flex-1 rounded-xl h-12 text-[15px] font-semibold transition-all duration-200 hover:opacity-90"
                        style={{
                          background: 'transparent',
                          color: '#FF7262',
                          border: '1px solid rgba(255, 114, 98, 0.3)',
                        }}
                        onClick={() =>
                          handleDecline(detailsModal.request.assignment.id)
                        }
                      >
                        Decline
                      </button>
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
