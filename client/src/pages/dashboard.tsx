import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Search, TrendingUp, Briefcase, ArrowRight, MessageSquare, Users, Zap, Sparkles, Target, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ReferralCard from '@/components/referral-card';
import ProofUploadModal from '@/components/proof-upload-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentRole, setCurrentRole] = useState<'seeker' | 'referrer'>('seeker');
  const [proofUploadModal, setProofUploadModal] = useState<{ isOpen: boolean; assignmentId: number | null }>({ isOpen: false, assignmentId: null });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; request: any | null }>({ isOpen: false, request: null });
  const { toast } = useToast();

  const { data: seekerReferrals, isLoading: seekerLoading } = useQuery({ queryKey: ['/api/referrals/seeker', user?.id], enabled: !!user && currentRole === 'seeker' });
  const { data: referreRequest, isLoading: referrerLoading } = useQuery({ queryKey: ['/api/referrals/referrer', user?.id], enabled: !!user && currentRole === 'referrer' });
  const { data: seekerMetrics } = useQuery<any>({ queryKey: ['/api/seeker-metrics', user?.id], enabled: !!user && currentRole === 'seeker' });
  const { data: referrerMetrics } = useQuery<any>({ queryKey: ['/api/referrer-metrics', user?.id], enabled: !!user && currentRole === 'referrer' });

  if (!user) return null;

  const handleUploadProof = (id: number) => setProofUploadModal({ isOpen: true, assignmentId: id });
  const openDetails = (r: any) => setDetailsModal({ isOpen: true, request: r });
  const handleDecline = async (id: number) => {
    try {
      await apiRequest('PUT', `/api/assignments/${id}`, { action: 'reject' });
      setDetailsModal({ isOpen: false, request: null });
      await queryClient.invalidateQueries({ queryKey: ['/api/referrals/referrer', user?.id] });
      toast({ title: 'Declined' });
    } catch (e: any) { toast({ title: 'Failed', variant: 'destructive' as any }); }
  };
  const handleProofSubmit = async (file: File) => {
    try {
      const pr = await apiRequest('POST', '/api/upload/proof-presigned-url', { fileName: file.name, fileType: file.type });
      const { uploadUrl, fileUrl } = await pr.json();
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      await apiRequest('PUT', `/api/assignments/${proofUploadModal.assignmentId}`, { proofUrl: fileUrl });
      setProofUploadModal({ isOpen: false, assignmentId: null });
      await queryClient.invalidateQueries({ queryKey: ['/api/referrals/referrer', user?.id] });
      toast({ title: 'Proof uploaded' });
    } catch (e: any) { toast({ title: 'Failed', variant: 'destructive' as any }); }
  };

  const active = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => ['pending', 'assigned', 'verification_pending'].includes(r.referral?.status)) : [];
  const past = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => ['completed', 'expired', 'cancelled'].includes(r.referral?.status)) : [];
  const assigned = Array.isArray(referreRequest) ? referreRequest.filter((r: any) => r.referral?.status === 'assigned' || r.referral?.status === 'verification_pending') : [];
  const completed = Array.isArray(referreRequest) ? referreRequest.filter((r: any) => r.referral?.status === 'completed') : [];
  const totalEarnings = parseFloat(referrerMetrics?.totalEarnings ?? '0');
  const monthlyEarnings = parseFloat(referrerMetrics?.monthlyEarnings ?? '0');

  // Profile strength
  const fields = [user.company, user.position, user.education, user.targetDomain, user.experience, user.skills?.length];
  const filled = fields.filter(Boolean).length;
  const strength = Math.round((filled / fields.length) * 100);

  return (
    <AppLayout currentRole={currentRole} onRoleChange={setCurrentRole}>
      {/* Ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.03) 0%, transparent 70%)' }} />

      <div className="p-4 md:p-6 max-w-4xl relative">
        <AnimatePresence mode="wait">
          {currentRole === 'seeker' ? (
            <motion.div key="seeker" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-5">

              {/* ── Hero Card ────────────────────── */}
              <motion.div variants={fadeUp} className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #141414 0%, #1C1C1C 100%)', border: '1px solid #1F1F1F' }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #A3E635, #818CF8)' }} />
                <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.06) 0%, transparent 70%)' }} />

                <div className="flex items-start justify-between mb-5 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1" style={{ color: '#525252' }}>Welcome back</p>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: '#F5F5F5' }}>{user.name}</h1>
                    <p className="text-sm mt-1" style={{ color: '#525252' }}>Ready to find your next opportunity?</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black" style={{ color: '#A3E635' }}>Rs.{seekerMetrics?.totalSpent ?? 0}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[2px]" style={{ color: '#525252' }}>Invested</p>
                  </div>
                </div>

                <button onClick={() => setLocation('/job-search')}
                  className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 hover:scale-[1.005] active:scale-[0.99] relative z-10"
                  style={{ background: '#A3E635', color: '#0C0C0C' }}>
                  <Search className="w-4 h-4" /> Explore {seekerMetrics?.jobsCount ?? 0} Jobs <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>

              {/* ── Stats Row ────────────────────── */}
              <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                {[
                  { n: seekerMetrics?.jobsCount ?? 0, l: 'JOBS', c: '#A3E635', icon: Briefcase },
                  { n: seekerMetrics?.appliedReferrals ?? 0, l: 'APPLIED', c: '#818CF8', icon: Target },
                  { n: seekerMetrics?.successfulReferrals ?? 0, l: 'SUCCESS', c: '#FB923C', icon: Award },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl p-4 relative overflow-hidden group transition-all hover:-translate-y-0.5"
                    style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: s.c }} />
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.c}10` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.c }} />
                      </div>
                    </div>
                    <p className="text-2xl font-black" style={{ color: s.c }}>{s.n}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[2px] mt-0.5" style={{ color: '#3F3F3F' }}>{s.l}</p>
                  </div>
                ))}
              </motion.div>

              {/* ── Profile Strength ──────────────── */}
              {strength < 100 && (
                <motion.div variants={fadeUp}>
                  <button onClick={() => setLocation('/profile-settings')}
                    className="w-full rounded-xl p-4 flex items-center gap-4 transition-all hover:border-[#2A2A2A] group"
                    style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="relative w-12 h-12 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#1F1F1F" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke={strength >= 70 ? '#A3E635' : '#FB923C'} strokeWidth="3"
                          strokeDasharray={`${strength * 0.94} 100`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: '#F5F5F5' }}>{strength}%</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>Complete your profile</p>
                      <p className="text-xs" style={{ color: '#525252' }}>Get matched 3x faster with a complete profile</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#525252' }} />
                  </button>
                </motion.div>
              )}

              {/* ── Quick Actions ─────────────────── */}
              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                <button onClick={() => setLocation('/coaching')}
                  className="rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#2A2A2A]"
                  style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: '#818CF810' }}>
                    <MessageSquare className="w-4.5 h-4.5" style={{ color: '#818CF8' }} />
                  </div>
                  <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>1v1 Coaching</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#3F3F3F' }}>500+ mentors · Rs.499</p>
                </button>

                <button onClick={() => setLocation('/job-search')}
                  className="rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#2A2A2A]"
                  style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: '#A3E63510' }}>
                    <Sparkles className="w-4.5 h-4.5" style={{ color: '#A3E635' }} />
                  </div>
                  <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>New Jobs Today</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#3F3F3F' }}>{seekerMetrics?.jobsCount ?? 0} positions open</p>
                </button>
              </motion.div>

              {/* ── Active Referrals ──────────────── */}
              <motion.div variants={fadeUp}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#525252' }}>Active Referrals</p>
                  {active.length > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: '#A3E63510', color: '#A3E635' }}>{active.length}</span>}
                </div>
                {seekerLoading ? (
                  <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#141414' }} />)}</div>
                ) : active.length > 0 ? (
                  <div className="space-y-3">{active.map((r: any) => <ReferralCard key={r.referral.id} referral={r} onClick={() => openDetails(r)} />)}</div>
                ) : (
                  <div className="rounded-xl p-8 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#1C1C1C' }}>
                      <Zap className="w-5 h-5" style={{ color: '#525252' }} />
                    </div>
                    <p className="text-sm font-bold mb-1" style={{ color: '#F5F5F5' }}>No active referrals yet</p>
                    <p className="text-xs mb-4" style={{ color: '#3F3F3F' }}>Browse jobs and get your first referral</p>
                    <button onClick={() => setLocation('/job-search')} className="text-xs font-bold px-4 py-2 rounded-lg"
                      style={{ background: '#A3E63510', color: '#A3E635', border: '1px solid #A3E63520' }}>
                      Browse Jobs
                    </button>
                  </div>
                )}
              </motion.div>

              {/* ── Past Referrals ────────────────── */}
              {past.length > 0 && (
                <motion.div variants={fadeUp}>
                  <p className="text-[10px] font-bold uppercase tracking-[2px] mb-3" style={{ color: '#3F3F3F' }}>Past Referrals</p>
                  <div className="space-y-3">{past.map((r: any) => <ReferralCard key={r.referral?.id || r.id} referral={r} onClick={() => openDetails(r)} />)}</div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* ══════ REFERRER VIEW ══════ */
            <motion.div key="referrer" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-5">

              {/* Earnings hero */}
              <motion.div variants={fadeUp} className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #141414 0%, #1C1C1C 100%)', border: '1px solid #1F1F1F' }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #A3E635, #FB923C)' }} />
                <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.04) 0%, transparent 70%)' }} />

                <div className="flex items-start justify-between mb-5 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1" style={{ color: '#525252' }}>Your Earnings</p>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: '#F5F5F5' }}>{user.name}</h1>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black" style={{ color: '#A3E635' }}>Rs.{totalEarnings}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[2px]" style={{ color: '#525252' }}>Total Earned</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {[
                    { n: `Rs.${monthlyEarnings.toFixed(0)}`, l: 'This Month' },
                    { n: referrerMetrics?.successfulReferrals ?? 0, l: 'Successful' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg p-3 text-center" style={{ background: '#0C0C0C' }}>
                      <p className="text-lg font-black" style={{ color: '#F5F5F5' }}>{s.n}</p>
                      <p className="text-[9px] uppercase tracking-[2px]" style={{ color: '#3F3F3F' }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                {[
                  { n: assigned.length, l: 'PENDING', c: '#FB923C', icon: Target },
                  { n: completed.length, l: 'COMPLETED', c: '#A3E635', icon: Award },
                  { n: `${Array.isArray(referreRequest) && referreRequest.length > 0 ? Math.round((completed.length / referreRequest.length) * 100) : 0}%`, l: 'RATE', c: '#818CF8', icon: TrendingUp },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl p-4 relative overflow-hidden group transition-all hover:-translate-y-0.5"
                    style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: s.c }} />
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.c}10` }}>
                      <s.icon className="w-4 h-4" style={{ color: s.c }} />
                    </div>
                    <p className="text-2xl font-black" style={{ color: s.c }}>{s.n}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[2px] mt-0.5" style={{ color: '#3F3F3F' }}>{s.l}</p>
                  </div>
                ))}
              </motion.div>

              {/* Assigned */}
              <motion.div variants={fadeUp}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#525252' }}>Assigned Referrals</p>
                  {assigned.length > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: '#FB923C10', color: '#FB923C' }}>{assigned.length}</span>}
                </div>
                {referrerLoading ? (
                  <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#141414' }} />)}</div>
                ) : assigned.length > 0 ? (
                  <div className="space-y-3">{assigned.map((r: any) => (
                    <ReferralCard key={r.referral.id} referral={r} isReferrer onClick={() => openDetails(r)}
                      onUploadProof={() => handleUploadProof(r.assignment?.id)} onDecline={() => handleDecline(r.assignment?.id)} />
                  ))}</div>
                ) : (
                  <div className="rounded-xl p-8 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <p className="text-sm" style={{ color: '#525252' }}>No assigned referrals right now.</p>
                  </div>
                )}
              </motion.div>

              {completed.length > 0 && (
                <motion.div variants={fadeUp}>
                  <p className="text-[10px] font-bold uppercase tracking-[2px] mb-3" style={{ color: '#3F3F3F' }}>Completed</p>
                  <div className="space-y-3">{completed.map((r: any) => (
                    <ReferralCard key={r.referral.id} referral={r} isReferrer onClick={() => openDetails(r)}
                      onUploadProof={() => handleUploadProof(r.assignment?.id)} onDecline={() => handleDecline(r.assignment?.id)} />
                  ))}</div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProofUploadModal isOpen={proofUploadModal.isOpen} onClose={() => setProofUploadModal({ isOpen: false, assignmentId: null })} onSubmit={handleProofSubmit} />

      <Dialog open={detailsModal.isOpen} onOpenChange={(o) => !o && setDetailsModal({ isOpen: false, request: null })}>
        <DialogContent style={{ background: '#1C1C1C', border: '1px solid #2A2A2A' }}>
          <DialogHeader><DialogTitle className="text-lg font-bold" style={{ color: '#F5F5F5' }}>Referral Details</DialogTitle></DialogHeader>
          {detailsModal.request && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold" style={{ color: '#F5F5F5' }}>{detailsModal.request.job?.title || 'Unknown'}</p>
                  <p className="text-sm" style={{ color: '#A3A3A3' }}>{detailsModal.request.job?.company}</p>
                  <p className="text-xs" style={{ color: '#525252' }}>{detailsModal.request.job?.location}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: '#A3E635' }}>Rs.499</span>
              </div>
              {detailsModal.request.seeker && (
                <div className="rounded-lg p-3" style={{ background: '#141414' }}>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#3F3F3F' }}>Candidate</p>
                  <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>{detailsModal.request.seeker.name}</p>
                  {detailsModal.request.referral?.resumeUrl && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open(detailsModal.request.referral.resumeUrl, '_blank')}>View Resume</Button>
                  )}
                </div>
              )}
              {currentRole === 'referrer' && detailsModal.request.referral?.status === 'assigned' && (
                <div className="flex gap-2">
                  <button className="flex-1 h-9 rounded-lg text-sm font-bold" style={{ background: '#A3E635', color: '#0C0C0C' }}
                    onClick={() => { setDetailsModal({ isOpen: false, request: null }); handleUploadProof(detailsModal.request.assignment.id); }}>Upload Proof</button>
                  <button className="flex-1 h-9 rounded-lg text-sm" style={{ background: '#EF444410', color: '#EF4444', border: '1px solid #EF444420' }}
                    onClick={() => handleDecline(detailsModal.request.assignment.id)}>Decline</button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
