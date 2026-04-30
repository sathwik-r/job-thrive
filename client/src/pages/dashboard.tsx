import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Search, TrendingUp, Briefcase, ArrowRight, MessageSquare, Zap, Sparkles, Target, Award, ChevronRight, Star, Clock, MapPin, Wifi, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReferralCard from '@/components/referral-card';
import ProofUploadModal from '@/components/proof-upload-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import type { Job } from '@shared/schema';

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function getCompanyDomain(c: string) {
  const m: Record<string,string> = { google:'google.com',microsoft:'microsoft.com',amazon:'amazon.com',flipkart:'flipkart.com',swiggy:'swiggy.com',meta:'meta.com',adobe:'adobe.com',atlassian:'atlassian.com',stripe:'stripe.com',razorpay:'razorpay.com' };
  const k = c.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'');
  return m[k] || `${k}.com`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentRole, setCurrentRole] = useState<'seeker' | 'referrer'>('seeker');
  const [proofModal, setProofModal] = useState<{ isOpen: boolean; assignmentId: number | null }>({ isOpen: false, assignmentId: null });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; request: any | null }>({ isOpen: false, request: null });
  const { toast } = useToast();

  const { data: seekerReferrals, isLoading: seekerLoading } = useQuery({ queryKey: ['/api/referrals/seeker', user?.id], enabled: !!user && currentRole === 'seeker' });
  const { data: referreRequest, isLoading: referrerLoading } = useQuery({ queryKey: ['/api/referrals/referrer', user?.id], enabled: !!user && currentRole === 'referrer' });
  const { data: seekerMetrics } = useQuery<any>({ queryKey: ['/api/seeker-metrics', user?.id], enabled: !!user && currentRole === 'seeker' });
  const { data: referrerMetrics } = useQuery<any>({ queryKey: ['/api/referrer-metrics', user?.id], enabled: !!user && currentRole === 'referrer' });
  // Fetch trending jobs for dashboard preview
  const { data: jobsData } = useQuery({ queryKey: ['/api/jobs', '', 1], queryFn: async () => (await apiRequest('GET', '/api/jobs?page=1')).json(), enabled: !!user && currentRole === 'seeker' });

  if (!user) return null;

  const handleUploadProof = (id: number) => setProofModal({ isOpen: true, assignmentId: id });
  const openDetails = (r: any) => setDetailsModal({ isOpen: true, request: r });
  const handleDecline = async (id: number) => {
    try { await apiRequest('PUT', `/api/assignments/${id}`, { action: 'reject' }); setDetailsModal({ isOpen: false, request: null }); await queryClient.invalidateQueries({ queryKey: ['/api/referrals/referrer', user?.id] }); toast({ title: 'Declined' }); }
    catch { toast({ title: 'Failed', variant: 'destructive' as any }); }
  };
  const handleProofSubmit = async (file: File) => {
    try { const pr = await apiRequest('POST', '/api/upload/proof-presigned-url', { fileName: file.name, fileType: file.type }); const { uploadUrl, fileUrl } = await pr.json(); await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } }); await apiRequest('PUT', `/api/assignments/${proofModal.assignmentId}`, { proofUrl: fileUrl }); setProofModal({ isOpen: false, assignmentId: null }); await queryClient.invalidateQueries({ queryKey: ['/api/referrals/referrer', user?.id] }); toast({ title: 'Proof uploaded' }); }
    catch { toast({ title: 'Failed', variant: 'destructive' as any }); }
  };

  const active = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => ['pending', 'assigned', 'verification_pending'].includes(r.referral?.status)) : [];
  const past = Array.isArray(seekerReferrals) ? seekerReferrals.filter((r: any) => ['completed', 'expired', 'cancelled'].includes(r.referral?.status)) : [];
  const assigned = Array.isArray(referreRequest) ? referreRequest.filter((r: any) => r.referral?.status === 'assigned' || r.referral?.status === 'verification_pending') : [];
  const completed = Array.isArray(referreRequest) ? referreRequest.filter((r: any) => r.referral?.status === 'completed') : [];
  const totalEarnings = parseFloat(referrerMetrics?.totalEarnings ?? '0');
  const monthlyEarnings = parseFloat(referrerMetrics?.monthlyEarnings ?? '0');
  const trendingJobs = (jobsData as any)?.items?.slice(0, 3) as Job[] || [];

  const fields = [user.company, user.position, user.education, user.targetDomain, user.experience, user.skills?.length];
  const strength = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <AppLayout currentRole={currentRole} onRoleChange={setCurrentRole}>
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.025) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.02) 0%, transparent 70%)' }} />

      <div className="p-4 md:p-6 max-w-5xl relative">
        <AnimatePresence mode="wait">
          {currentRole === 'seeker' ? (
            <motion.div key="seeker" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }}>

              {/* ══ ROW 1: Hero + Stats side by side ══ */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                {/* Hero card - spans 2 cols */}
                <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #141414 0%, #1C1C1C 100%)', border: '1px solid #1F1F1F' }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #A3E635, #818CF8)' }} />
                  <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.06) 0%, transparent 70%)' }} />

                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1" style={{ color: '#737373' }}>Welcome back</p>
                    <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: '#F5F5F5' }}>{user.name}</h1>
                    <p className="text-sm mb-5" style={{ color: '#D4D4D4' }}>
                      {active.length > 0 ? `You have ${active.length} active referral${active.length > 1 ? 's' : ''} in progress.` : 'Ready to find your next opportunity?'}
                    </p>

                    <div className="flex items-center gap-3">
                      <button onClick={() => setLocation('/job-search')}
                        className="h-10 px-5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:brightness-110 active:scale-[0.98]"
                        style={{ background: '#A3E635', color: '#0C0C0C' }}>
                        <Search className="w-4 h-4" /> Explore {seekerMetrics?.jobsCount ?? 0} Jobs
                      </button>
                      <button onClick={() => setLocation('/coaching')}
                        className="h-10 px-4 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:border-[#2A2A2A]"
                        style={{ background: 'transparent', border: '1px solid #2A2A2A', color: '#D4D4D4' }}>
                        <MessageSquare className="w-4 h-4" /> Coaching
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Stats column */}
                <motion.div variants={fadeUp} className="space-y-3">
                  <div className="rounded-xl p-4 text-center relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <p className="text-3xl font-black" style={{ color: '#A3E635' }}>Rs.{seekerMetrics?.totalSpent ?? 0}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[2px] mt-1" style={{ color: '#737373' }}>Total Invested</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { n: seekerMetrics?.jobsCount ?? 0, l: 'Jobs', c: '#A3E635' },
                      { n: seekerMetrics?.appliedReferrals ?? 0, l: 'Applied', c: '#818CF8' },
                      { n: seekerMetrics?.successfulReferrals ?? 0, l: 'Won', c: '#FB923C' },
                    ].map((s) => (
                      <div key={s.l} className="rounded-lg p-2.5 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                        <p className="text-lg font-black" style={{ color: s.c }}>{s.n}</p>
                        <p className="text-[8px] font-bold uppercase tracking-[1px]" style={{ color: '#525252' }}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* ══ ROW 2: Profile strength + Quick actions ══ */}
              <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                {/* Profile strength */}
                {strength < 100 && (
                  <button onClick={() => setLocation('/profile-settings')}
                    className="rounded-xl p-4 flex items-center gap-3 group transition-all hover:border-[#2A2A2A] text-left"
                    style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="relative w-11 h-11 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#1F1F1F" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke={strength >= 70 ? '#A3E635' : '#FB923C'} strokeWidth="3"
                          strokeDasharray={`${strength * 0.94} 100`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black" style={{ color: '#F5F5F5' }}>{strength}%</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: '#F5F5F5' }}>Complete profile</p>
                      <p className="text-[10px]" style={{ color: '#737373' }}>Get matched 3x faster</p>
                    </div>
                  </button>
                )}

                {/* 1v1 Coaching */}
                <button onClick={() => setLocation('/coaching')}
                  className="rounded-xl p-4 flex items-center gap-3 transition-all hover:border-[#2A2A2A] text-left"
                  style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#818CF810' }}>
                    <Star className="w-5 h-5" style={{ color: '#818CF8' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#F5F5F5' }}>1v1 Coaching</p>
                    <p className="text-[10px]" style={{ color: '#737373' }}>500+ mentors · Rs.499</p>
                  </div>
                </button>

                {/* Referral guarantee */}
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#A3E63510' }}>
                    <Shield className="w-5 h-5" style={{ color: '#A3E635' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#F5F5F5' }}>Refund guarantee</p>
                    <p className="text-[10px]" style={{ color: '#737373' }}>Not matched? Full refund.</p>
                  </div>
                </div>
              </motion.div>

              {/* ══ ROW 3: Trending Jobs Preview ══ */}
              {trendingJobs.length > 0 && (
                <motion.div variants={fadeUp} className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" style={{ color: '#A3E635' }} />
                      <p className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#D4D4D4' }}>Trending Jobs</p>
                    </div>
                    <button onClick={() => setLocation('/job-search')} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#A3E635' }}>
                      View all <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {trendingJobs.map((job: Job) => (
                      <button key={job.id} onClick={() => setLocation(`/referral-request/${job.id}`)}
                        className="rounded-xl p-4 text-left group transition-all hover:-translate-y-0.5 hover:border-[#2A2A2A] relative overflow-hidden"
                        style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#A3E635' }} />
                        <div className="flex items-start gap-3 mb-2">
                          <img src={`https://logo.clearbit.com/${getCompanyDomain(job.company)}`} alt=""
                            className="w-8 h-8 rounded-lg p-0.5 shrink-0" style={{ background: '#1C1C1C', border: '1px solid #1F1F1F' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: '#F5F5F5' }}>{job.title}</p>
                            <p className="text-xs" style={{ color: '#818CF8' }}>{job.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] flex items-center gap-1" style={{ color: '#737373' }}><MapPin className="w-3 h-3" /> {job.location}</span>
                          {job.remote && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#A3E63510', color: '#A3E635' }}>Remote</span>}
                          <span className="text-[10px] font-bold ml-auto" style={{ color: '#FB923C' }}>Rs.{job.referralFee}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ══ ROW 4: Active Referrals ══ */}
              <motion.div variants={fadeUp} className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#D4D4D4' }}>Active Referrals</p>
                  {active.length > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: '#A3E63510', color: '#A3E635' }}>{active.length}</span>}
                </div>
                {seekerLoading ? (
                  <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#141414' }} />)}</div>
                ) : active.length > 0 ? (
                  <div className="space-y-3">{active.map((r: any) => <ReferralCard key={r.referral.id} referral={r} onClick={() => openDetails(r)} />)}</div>
                ) : (
                  <div className="rounded-xl p-6 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#1C1C1C' }}>
                      <Sparkles className="w-5 h-5" style={{ color: '#737373' }} />
                    </div>
                    <p className="text-sm font-bold mb-1" style={{ color: '#F5F5F5' }}>No active referrals yet</p>
                    <p className="text-xs mb-3" style={{ color: '#737373' }}>Apply to a job and your referral will appear here</p>
                    <button onClick={() => setLocation('/job-search')} className="text-xs font-bold px-4 py-2 rounded-lg transition-all hover:brightness-110"
                      style={{ background: '#A3E635', color: '#0C0C0C' }}>Browse Jobs</button>
                  </div>
                )}
              </motion.div>

              {/* Past */}
              {past.length > 0 && (
                <motion.div variants={fadeUp}>
                  <p className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#737373' }}>Past Referrals</p>
                  <div className="space-y-3">{past.map((r: any) => <ReferralCard key={r.referral?.id || r.id} referral={r} onClick={() => openDetails(r)} />)}</div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* ══════════ REFERRER VIEW ══════════ */
            <motion.div key="referrer" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }}>

              {/* Row 1: Earnings hero + stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #141414 0%, #1C1C1C 100%)', border: '1px solid #1F1F1F' }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #A3E635, #FB923C)' }} />
                  <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.04) 0%, transparent 70%)' }} />

                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1" style={{ color: '#737373' }}>Your Earnings</p>
                    <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: '#F5F5F5' }}>{user.name}</h1>
                    <p className="text-sm mb-5" style={{ color: '#D4D4D4' }}>
                      {assigned.length > 0 ? `You have ${assigned.length} referral${assigned.length > 1 ? 's' : ''} waiting for action.` : 'You\'re all caught up. New referrals will appear here.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg p-3 text-center" style={{ background: '#0C0C0C' }}>
                        <p className="text-lg font-black" style={{ color: '#F5F5F5' }}>Rs.{monthlyEarnings.toFixed(0)}</p>
                        <p className="text-[9px] uppercase tracking-[1px]" style={{ color: '#737373' }}>This Month</p>
                      </div>
                      <div className="rounded-lg p-3 text-center" style={{ background: '#0C0C0C' }}>
                        <p className="text-lg font-black" style={{ color: '#F5F5F5' }}>{referrerMetrics?.successfulReferrals ?? 0}</p>
                        <p className="text-[9px] uppercase tracking-[1px]" style={{ color: '#737373' }}>Successful</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-3">
                  <div className="rounded-xl p-4 text-center relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <p className="text-3xl font-black" style={{ color: '#A3E635' }}>Rs.{totalEarnings}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[2px] mt-1" style={{ color: '#737373' }}>Total Earned</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { n: assigned.length, l: 'Pending', c: '#FB923C' },
                      { n: completed.length, l: 'Done', c: '#A3E635' },
                      { n: `${Array.isArray(referreRequest) && referreRequest.length > 0 ? Math.round((completed.length / referreRequest.length) * 100) : 0}%`, l: 'Rate', c: '#818CF8' },
                    ].map((s) => (
                      <div key={s.l} className="rounded-lg p-2.5 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                        <p className="text-lg font-black" style={{ color: s.c }}>{s.n}</p>
                        <p className="text-[8px] font-bold uppercase tracking-[1px]" style={{ color: '#525252' }}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* How referrer earns */}
              <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { icon: CheckCircle2, title: 'Get matched', desc: 'Candidates matched to your company', c: '#A3E635' },
                  { icon: Briefcase, title: 'Submit referral', desc: 'Use your internal referral link', c: '#818CF8' },
                  { icon: Award, title: 'Earn Rs.249+', desc: 'Paid for each successful referral', c: '#FB923C' },
                ].map((s) => (
                  <div key={s.title} className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.c}10` }}>
                      <s.icon className="w-4 h-4" style={{ color: s.c }} />
                    </div>
                    <p className="text-xs font-bold" style={{ color: '#F5F5F5' }}>{s.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#737373' }}>{s.desc}</p>
                  </div>
                ))}
              </motion.div>

              {/* Assigned referrals */}
              <motion.div variants={fadeUp} className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#D4D4D4' }}>Assigned Referrals</p>
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
                  <div className="rounded-xl p-6 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <p className="text-sm font-bold mb-1" style={{ color: '#F5F5F5' }}>No pending referrals</p>
                    <p className="text-xs" style={{ color: '#737373' }}>New candidates will be matched to you automatically.</p>
                  </div>
                )}
              </motion.div>

              {completed.length > 0 && (
                <motion.div variants={fadeUp}>
                  <p className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#737373' }}>Completed</p>
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

      <ProofUploadModal isOpen={proofModal.isOpen} onClose={() => setProofModal({ isOpen: false, assignmentId: null })} onSubmit={handleProofSubmit} />
      <Dialog open={detailsModal.isOpen} onOpenChange={(o) => !o && setDetailsModal({ isOpen: false, request: null })}>
        <DialogContent style={{ background: '#1C1C1C', border: '1px solid #2A2A2A' }}>
          <DialogHeader><DialogTitle className="text-lg font-bold" style={{ color: '#F5F5F5' }}>Referral Details</DialogTitle></DialogHeader>
          {detailsModal.request && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div><p className="font-bold" style={{ color: '#F5F5F5' }}>{detailsModal.request.job?.title}</p><p className="text-sm" style={{ color: '#D4D4D4' }}>{detailsModal.request.job?.company}</p><p className="text-xs" style={{ color: '#737373' }}>{detailsModal.request.job?.location}</p></div>
                <span className="text-sm font-bold" style={{ color: '#A3E635' }}>Rs.499</span>
              </div>
              {detailsModal.request.seeker && (
                <div className="rounded-lg p-3" style={{ background: '#141414' }}>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#737373' }}>Candidate</p>
                  <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>{detailsModal.request.seeker.name}</p>
                  {detailsModal.request.referral?.resumeUrl && <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open(detailsModal.request.referral.resumeUrl, '_blank')}>View Resume</Button>}
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
