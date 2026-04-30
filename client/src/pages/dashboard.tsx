import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Search, TrendingUp, Briefcase, ArrowRight, MessageSquare, Users, Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ReferralCard from '@/components/referral-card';
import ProofUploadModal from '@/components/proof-upload-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [currentRole, setCurrentRole] = useState<'seeker' | 'referrer'>('seeker');
  const [proofUploadModal, setProofUploadModal] = useState<{ isOpen: boolean; assignmentId: number | null }>({ isOpen: false, assignmentId: null });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; request: any | null }>({ isOpen: false, request: null });
  const { toast } = useToast();

  const { data: seekerReferrals, isLoading: seekerLoading } = useQuery({
    queryKey: ['/api/referrals/seeker', user?.id],
    enabled: !!user && currentRole === 'seeker',
  });
  const { data: referreRequest, isLoading: referrerLoading } = useQuery({
    queryKey: ['/api/referrals/referrer', user?.id],
    enabled: !!user && currentRole === 'referrer',
  });
  const { data: seekerMetrics } = useQuery<any>({
    queryKey: ['/api/seeker-metrics', user?.id],
    enabled: !!user && currentRole === 'seeker',
  });
  const { data: referrerMetrics } = useQuery<any>({
    queryKey: ['/api/referrer-metrics', user?.id],
    enabled: !!user && currentRole === 'referrer',
  });

  if (!user) return null;

  const handleUploadProof = (assignmentId: number) => setProofUploadModal({ isOpen: true, assignmentId });
  const openReferralDetails = (request: any) => setDetailsModal({ isOpen: true, request });

  const handleDecline = async (assignmentId: number) => {
    try {
      await apiRequest('PUT', `/api/assignments/${assignmentId}`, { action: 'reject' });
      setDetailsModal({ isOpen: false, request: null });
      await queryClient.invalidateQueries({ queryKey: ['/api/referrals/referrer', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['/api/referrals/seeker', user?.id] });
      toast({ title: 'Declined' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.message, variant: 'destructive' as any });
    }
  };

  const handleProofSubmit = async (file: File) => {
    try {
      const presignedResponse = await apiRequest('POST', '/api/upload/proof-presigned-url', { fileName: file.name, fileType: file.type });
      const { uploadUrl, fileUrl } = await presignedResponse.json();
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      await apiRequest('PUT', `/api/assignments/${proofUploadModal.assignmentId}`, { proofUrl: fileUrl });
      setProofUploadModal({ isOpen: false, assignmentId: null });
      await queryClient.invalidateQueries({ queryKey: ['/api/referrals/referrer', user?.id] });
      toast({ title: "Proof uploaded" });
    } catch (error: any) {
      toast({ title: "Failed", description: error?.message, variant: "destructive" as any });
    }
  };

  const activeRequests = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => ['pending', 'assigned', 'verification_pending'].includes(r.referral?.status)) : [];
  const pastRequests = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => ['completed', 'expired', 'cancelled'].includes(r.referral?.status)) : [];
  const assignedRequests = Array.isArray(referreRequest) ? referreRequest.filter((r: any) => r.referral?.status === 'assigned' || r.referral?.status === 'verification_pending') : [];
  const completedRequests = Array.isArray(referreRequest) ? referreRequest.filter((r: any) => r.referral?.status === 'completed') : [];
  const totalEarnings = parseFloat(referrerMetrics?.totalEarnings ?? '0');
  const monthlyEarnings = parseFloat(referrerMetrics?.monthlyEarnings ?? '0');

  return (
    <AppLayout currentRole={currentRole} onRoleChange={setCurrentRole}>
      <div className="p-4 md:p-6 max-w-4xl">
        <AnimatePresence mode="wait">
          {currentRole === 'seeker' ? (
            <motion.div key="seeker" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">

              {/* Hero metrics */}
              <motion.div variants={fadeUp} className="rounded-xl p-5 relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#A3E635' }} />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#525252' }}>Welcome back</p>
                    <h1 className="text-xl font-black mt-1" style={{ color: '#F5F5F5' }}>{user.name}</h1>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black" style={{ color: '#A3E635' }}>Rs.{seekerMetrics?.totalSpent ?? 0}</p>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: '#525252' }}>Invested</p>
                  </div>
                </div>
                <button onClick={() => setLocation('/job-search')}
                  className="w-full h-10 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: '#A3E635', color: '#0C0C0C' }}>
                  <Search className="w-4 h-4" /> Explore {seekerMetrics?.jobsCount ?? 0} Jobs <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                {[
                  { n: seekerMetrics?.jobsCount ?? 0, l: 'JOBS', c: '#A3E635' },
                  { n: seekerMetrics?.appliedReferrals ?? 0, l: 'APPLIED', c: '#818CF8' },
                  { n: seekerMetrics?.successfulReferrals ?? 0, l: 'SUCCESS', c: '#FB923C' },
                ].map((s) => (
                  <div key={s.l} className="stat-card rounded-xl p-4 text-center" style={{ '--tw-before-bg': s.c } as any}>
                    <p className="text-2xl font-black" style={{ color: s.c }}>{s.n}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: '#525252' }}>{s.l}</p>
                  </div>
                ))}
              </motion.div>

              {/* Coaching CTA */}
              <motion.div variants={fadeUp}>
                <button onClick={() => setLocation('/coaching')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-colors"
                  style={{ background: '#1C1C1C', border: '1px solid #1F1F1F' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#818CF815' }}>
                    <MessageSquare className="w-5 h-5" style={{ color: '#818CF8' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>1v1 Coaching</p>
                    <p className="text-xs" style={{ color: '#525252' }}>500+ mentors · Rs.499/session</p>
                  </div>
                  <ArrowRight className="w-4 h-4" style={{ color: '#525252' }} />
                </button>
              </motion.div>

              {/* Active Referrals */}
              <motion.div variants={fadeUp}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#525252' }}>Active Referrals</p>
                {seekerLoading ? (
                  <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#1C1C1C' }} />)}</div>
                ) : activeRequests.length > 0 ? (
                  <div className="space-y-3">{activeRequests.map((r: any) => <ReferralCard key={r.referral.id} referral={r} onClick={() => openReferralDetails(r)} />)}</div>
                ) : (
                  <div className="rounded-xl p-8 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <p className="text-sm" style={{ color: '#525252' }}>No active referrals. Start by exploring jobs.</p>
                  </div>
                )}
              </motion.div>

              {/* Past */}
              <motion.div variants={fadeUp}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#525252' }}>Past Referrals</p>
                {pastRequests.length > 0 ? (
                  <div className="space-y-3">{pastRequests.map((r: any) => <ReferralCard key={r.referral?.id || r.id} referral={r} onClick={() => openReferralDetails(r)} />)}</div>
                ) : (
                  <div className="rounded-xl p-6 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <p className="text-sm" style={{ color: '#3F3F3F' }}>No past referrals yet.</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            /* ── REFERRER VIEW ────────────────── */
            <motion.div key="referrer" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">

              {/* Earnings hero */}
              <motion.div variants={fadeUp} className="rounded-xl p-5 relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#A3E635' }} />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#525252' }}>Your Earnings</p>
                    <h1 className="text-xl font-black mt-1" style={{ color: '#F5F5F5' }}>{user.name}</h1>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black" style={{ color: '#A3E635' }}>Rs.{totalEarnings}</p>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: '#525252' }}>Total Earned</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3 text-center" style={{ background: '#0C0C0C' }}>
                    <p className="text-lg font-black" style={{ color: '#F5F5F5' }}>Rs.{monthlyEarnings.toFixed(0)}</p>
                    <p className="text-[9px] uppercase tracking-widest" style={{ color: '#525252' }}>This Month</p>
                  </div>
                  <div className="rounded-lg p-3 text-center" style={{ background: '#0C0C0C' }}>
                    <p className="text-lg font-black" style={{ color: '#F5F5F5' }}>{referrerMetrics?.successfulReferrals ?? 0}</p>
                    <p className="text-[9px] uppercase tracking-widest" style={{ color: '#525252' }}>Successful</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                {[
                  { n: assignedRequests.length, l: 'PENDING', c: '#FB923C' },
                  { n: completedRequests.length, l: 'COMPLETED', c: '#A3E635' },
                  { n: Array.isArray(referreRequest) && referreRequest.length > 0 ? Math.round((completedRequests.length / referreRequest.length) * 100) : 0, l: 'RATE %', c: '#818CF8' },
                ].map((s) => (
                  <div key={s.l} className="stat-card rounded-xl p-4 text-center">
                    <p className="text-2xl font-black" style={{ color: s.c }}>{s.n}{s.l === 'RATE %' ? '%' : ''}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: '#525252' }}>{s.l}</p>
                  </div>
                ))}
              </motion.div>

              {/* Assigned */}
              <motion.div variants={fadeUp}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#525252' }}>Assigned Referrals</p>
                {referrerLoading ? (
                  <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#1C1C1C' }} />)}</div>
                ) : assignedRequests.length > 0 ? (
                  <div className="space-y-3">{assignedRequests.map((r: any) => (
                    <ReferralCard key={r.referral.id} referral={r} isReferrer onClick={() => openReferralDetails(r)}
                      onUploadProof={() => handleUploadProof(r.assignment?.id)} onDecline={() => handleDecline(r.assignment?.id)} />
                  ))}</div>
                ) : (
                  <div className="rounded-xl p-8 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <p className="text-sm" style={{ color: '#525252' }}>No assigned referrals right now.</p>
                  </div>
                )}
              </motion.div>

              {/* Completed */}
              <motion.div variants={fadeUp}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#525252' }}>Completed</p>
                {completedRequests.length > 0 ? (
                  <div className="space-y-3">{completedRequests.map((r: any) => (
                    <ReferralCard key={r.referral.id} referral={r} isReferrer onClick={() => openReferralDetails(r)}
                      onUploadProof={() => handleUploadProof(r.assignment?.id)} onDecline={() => handleDecline(r.assignment?.id)} />
                  ))}</div>
                ) : (
                  <div className="rounded-xl p-6 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <p className="text-sm" style={{ color: '#3F3F3F' }}>No completed referrals yet.</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ProofUploadModal isOpen={proofUploadModal.isOpen} onClose={() => setProofUploadModal({ isOpen: false, assignmentId: null })} onSubmit={handleProofSubmit} />

      <Dialog open={detailsModal.isOpen} onOpenChange={(open) => !open && setDetailsModal({ isOpen: false, request: null })}>
        <DialogContent className="sm:max-w-lg" style={{ background: '#1C1C1C', border: '1px solid #2A2A2A' }}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold" style={{ color: '#F5F5F5' }}>Referral Details</DialogTitle>
          </DialogHeader>
          {detailsModal.request && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold" style={{ color: '#F5F5F5' }}>{detailsModal.request.job?.title || 'Unknown'}</p>
                  <p className="text-sm" style={{ color: '#A3A3A3' }}>{detailsModal.request.job?.company || 'Unknown'}</p>
                  <p className="text-xs" style={{ color: '#525252' }}>{detailsModal.request.job?.location || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className="pill pill-lime">{(detailsModal.request.referral?.status || '').replace(/_/g, ' ')}</span>
                  <p className="text-sm font-bold mt-1" style={{ color: '#A3E635' }}>Rs.499</p>
                </div>
              </div>
              {detailsModal.request.seeker && (
                <div className="rounded-lg p-3" style={{ background: '#141414' }}>
                  <p className="text-xs" style={{ color: '#525252' }}>Candidate</p>
                  <p className="font-medium text-sm" style={{ color: '#F5F5F5' }}>{detailsModal.request.seeker.name}</p>
                  {detailsModal.request.seeker.email && <p className="text-xs" style={{ color: '#A3A3A3' }}>{detailsModal.request.seeker.email}</p>}
                  {detailsModal.request.referral?.resumeUrl && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open(detailsModal.request.referral.resumeUrl, '_blank', 'noopener')}>
                      View Resume
                    </Button>
                  )}
                </div>
              )}
              {currentRole === 'referrer' && detailsModal.request.referral?.status === 'assigned' && (
                <div className="flex gap-2">
                  <button className="flex-1 h-9 rounded-lg text-sm font-bold" style={{ background: '#A3E635', color: '#0C0C0C' }}
                    onClick={() => { setDetailsModal({ isOpen: false, request: null }); handleUploadProof(detailsModal.request.assignment.id); }}>
                    Upload Proof
                  </button>
                  <button className="flex-1 h-9 rounded-lg text-sm font-medium" style={{ background: '#EF444415', color: '#EF4444', border: '1px solid #EF444425' }}
                    onClick={() => handleDecline(detailsModal.request.assignment.id)}>
                    Decline
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
