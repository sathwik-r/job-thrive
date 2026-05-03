import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Search, TrendingUp, Briefcase, ArrowRight, MessageSquare, Zap, Sparkles, Target, Award, ChevronRight, Star, MapPin, Wifi, CheckCircle2, Shield, IndianRupee, Users } from 'lucide-react';
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

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

function CompanyIcon({ name, size = 36 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const c = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const map: Record<string, string> = { google:'google.com',microsoft:'microsoft.com',amazon:'amazon.com',flipkart:'flipkart.com',swiggy:'swiggy.com',meta:'meta.com',adobe:'adobe.com',atlassian:'atlassian.com',stripe:'stripe.com',razorpay:'razorpay.com',uber:'uber.com',netflix:'netflix.com' };
  const domain = map[c] || `${c}.com`;
  if (err) return (
    <div className="rounded-xl flex items-center justify-center font-black text-sm shrink-0" style={{ width: size, height: size, background: '#1C1C1C', border: '1px solid #1F1F1F', color: '#525252' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
  return <img src={`https://logo.clearbit.com/${domain}`} alt="" className="rounded-xl shrink-0 object-contain p-1" style={{ width: size, height: size, background: '#1C1C1C', border: '1px solid #1F1F1F' }} onError={() => setErr(true)} />;
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
  const trendingJobs = (jobsData as any)?.items?.slice(0, 4) as Job[] || [];
  const fields = [user.company, user.position, user.education, user.targetDomain, user.experience, user.skills?.length];
  const strength = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <AppLayout currentRole={currentRole} onRoleChange={setCurrentRole}>
      <div className="min-h-screen relative">
        {/* Full-screen ambient */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px]" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.03) 0%, transparent 60%)' }} />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px]" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.025) 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10 px-4 md:px-8 py-6 space-y-6 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {currentRole === 'seeker' ? (
              <motion.div key="seeker" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">

                {/* ═══ HERO — CRED Style Full Width ═══ */}
                <motion.div variants={fadeUp} className="rounded-3xl p-8 md:p-10 relative overflow-hidden"
                  style={{ background: 'linear-gradient(145deg, #141414 0%, #0C0C0C 100%)', border: '1px solid #1F1F1F' }}>
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #A3E635 0%, #818CF8 50%, #A3E635 100%)' }} />
                  {/* Glow */}
                  <div className="absolute -top-20 -right-20 w-80 h-80 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 60%)' }} />
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.04) 0%, transparent 60%)' }} />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[3px] mb-2" style={{ color: '#525252' }}>Welcome back</p>
                      <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight" style={{ color: '#F5F5F5' }}>
                        {user.name?.split(' ')[0]}, let's land<br />
                        <span style={{ color: '#A3E635' }}>your next role.</span>
                      </h1>
                      <p className="text-sm mt-3 max-w-md" style={{ color: '#D4D4D4' }}>
                        {active.length > 0 ? `${active.length} referral${active.length > 1 ? 's' : ''} in progress. Your next interview could be days away.` : 'Browse top companies and get referred by real employees.'}
                      </p>
                      <div className="flex items-center gap-3 mt-5">
                        <button onClick={() => setLocation('/job-search')}
                          className="h-12 px-6 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                          style={{ background: '#A3E635', color: '#0C0C0C', boxShadow: '0 0 30px rgba(163,230,53,0.12)' }}>
                          <Search className="w-4 h-4" /> Explore {seekerMetrics?.jobsCount ?? 0} Jobs
                        </button>
                        <button onClick={() => setLocation('/coaching')}
                          className="h-12 px-5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
                          style={{ border: '1px solid #2A2A2A', color: '#D4D4D4' }}>
                          <Star className="w-4 h-4" /> Coaching
                        </button>
                      </div>
                    </div>

                    {/* Stats block — CRED style big numbers */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0">
                      <div className="rounded-2xl p-5 text-center min-w-[120px]" style={{ background: '#0C0C0C', border: '1px solid #1F1F1F' }}>
                        <p className="text-3xl font-black" style={{ color: '#A3E635' }}>{seekerMetrics?.appliedReferrals ?? 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[2px] mt-1" style={{ color: '#525252' }}>Applied</p>
                      </div>
                      <div className="rounded-2xl p-5 text-center min-w-[120px]" style={{ background: '#0C0C0C', border: '1px solid #1F1F1F' }}>
                        <p className="text-3xl font-black" style={{ color: '#818CF8' }}>{seekerMetrics?.successfulReferrals ?? 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[2px] mt-1" style={{ color: '#525252' }}>Success</p>
                      </div>
                      <div className="rounded-2xl p-5 text-center col-span-2" style={{ background: '#0C0C0C', border: '1px solid #1F1F1F' }}>
                        <p className="text-3xl font-black" style={{ color: '#FB923C' }}>Rs.{seekerMetrics?.totalSpent ?? 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[2px] mt-1" style={{ color: '#525252' }}>Total Invested</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ═══ QUICK ACTIONS ROW ═══ */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Profile Strength */}
                  <button onClick={() => setLocation('/profile-settings')}
                    className="rounded-2xl p-5 flex items-center gap-4 group transition-all hover:border-[#2A2A2A] text-left"
                    style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="relative w-14 h-14 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#1F1F1F" strokeWidth="2.5" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke={strength >= 70 ? '#A3E635' : '#FB923C'} strokeWidth="2.5"
                          strokeDasharray={`${strength * 0.94} 100`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-black" style={{ color: '#F5F5F5' }}>{strength}%</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>Profile</p>
                      <p className="text-[11px]" style={{ color: '#737373' }}>{strength >= 100 ? 'Complete!' : 'Finish to match 3x faster'}</p>
                    </div>
                  </button>

                  {/* Coaching */}
                  <button onClick={() => setLocation('/coaching')}
                    className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-[#2A2A2A] text-left"
                    style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#818CF808' }}>
                      <MessageSquare className="w-6 h-6" style={{ color: '#818CF8' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>1v1 Coaching</p>
                      <p className="text-[11px]" style={{ color: '#737373' }}>Mock interviews, career advice</p>
                    </div>
                  </button>

                  {/* Guarantee */}
                  <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#A3E63508' }}>
                      <Shield className="w-6 h-6" style={{ color: '#A3E635' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>Money-back</p>
                      <p className="text-[11px]" style={{ color: '#737373' }}>Full refund if not matched</p>
                    </div>
                  </div>
                </motion.div>

                {/* ═══ TRENDING JOBS — Full width cards ═══ */}
                {trendingJobs.length > 0 && (
                  <motion.div variants={fadeUp}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#A3E635' }} />
                        <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>Hot right now</p>
                      </div>
                      <button onClick={() => setLocation('/job-search')} className="text-xs font-semibold flex items-center gap-1 transition-colors hover:text-[#A3E635]" style={{ color: '#737373' }}>
                        See all {seekerMetrics?.jobsCount ?? 0} jobs <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {trendingJobs.map((job: Job) => (
                        <button key={job.id} onClick={() => setLocation(`/referral-request/${job.id}`)}
                          className="rounded-2xl p-5 text-left group transition-all hover:-translate-y-1 hover:border-[#2A2A2A] relative overflow-hidden"
                          style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#A3E635' }} />
                          <div className="flex items-start gap-4">
                            <CompanyIcon name={job.company} size={44} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate" style={{ color: '#F5F5F5' }}>{job.title}</p>
                              <p className="text-xs font-medium mt-0.5" style={{ color: '#818CF8' }}>{job.company}</p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="text-[11px] flex items-center gap-1" style={{ color: '#737373' }}><MapPin className="w-3 h-3" /> {job.location}</span>
                                {job.remote && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#A3E63510', color: '#A3E635' }}>Remote</span>}
                                <span className="text-[11px] font-bold ml-auto" style={{ color: '#FB923C' }}>Rs.{job.referralFee}</span>
                              </div>
                            </div>
                            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#A3E635' }}>
                                <ArrowRight className="w-4 h-4" style={{ color: '#0C0C0C' }} />
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ═══ ACTIVE REFERRALS ═══ */}
                <motion.div variants={fadeUp}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>Your referrals</p>
                    {active.length > 0 && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#A3E63510', color: '#A3E635' }}>{active.length} active</span>}
                  </div>
                  {seekerLoading ? (
                    <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#141414' }} />)}</div>
                  ) : active.length > 0 ? (
                    <div className="space-y-3">{active.map((r: any) => <ReferralCard key={r.referral.id} referral={r} onClick={() => openDetails(r)} />)}</div>
                  ) : (
                    <div className="rounded-2xl p-10 text-center relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(163,230,53,0.03) 0%, transparent 60%)' }} />
                      <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#1C1C1C' }}>
                          <Zap className="w-7 h-7" style={{ color: '#525252' }} />
                        </div>
                        <p className="text-base font-bold mb-1" style={{ color: '#F5F5F5' }}>No referrals yet</p>
                        <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: '#737373' }}>Browse jobs from Google, Microsoft, Amazon and 90+ top companies. Get referred for just Rs.499.</p>
                        <button onClick={() => setLocation('/job-search')} className="h-10 px-6 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                          style={{ background: '#A3E635', color: '#0C0C0C' }}>
                          Browse Jobs <ArrowRight className="w-4 h-4 inline ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>

                {past.length > 0 && (
                  <motion.div variants={fadeUp}>
                    <p className="text-sm font-bold mb-3" style={{ color: '#737373' }}>Past referrals</p>
                    <div className="space-y-3">{past.map((r: any) => <ReferralCard key={r.referral?.id || r.id} referral={r} onClick={() => openDetails(r)} />)}</div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* ═══════════════ REFERRER VIEW ═══════════════ */
              <motion.div key="referrer" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">

                {/* Hero */}
                <motion.div variants={fadeUp} className="rounded-3xl p-8 md:p-10 relative overflow-hidden"
                  style={{ background: 'linear-gradient(145deg, #141414 0%, #0C0C0C 100%)', border: '1px solid #1F1F1F' }}>
                  <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #818CF8, #A3E635)' }} />
                  <div className="absolute -top-20 -right-20 w-80 h-80 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 60%)' }} />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[3px] mb-2" style={{ color: '#525252' }}>Referrer Dashboard</p>
                      <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight" style={{ color: '#F5F5F5' }}>
                        Hi {user.name?.split(' ')[0]}, you've<br />
                        <span style={{ color: '#A3E635' }}>earned Rs.{totalEarnings}</span>
                      </h1>
                      <p className="text-sm mt-3 max-w-md" style={{ color: '#D4D4D4' }}>
                        {assigned.length > 0
                          ? `${assigned.length} candidate${assigned.length > 1 ? 's' : ''} waiting for your referral. Submit and earn Rs.249+ each.`
                          : 'You\'re all caught up. We\'ll match new candidates to your company automatically.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 shrink-0">
                      <div className="rounded-2xl p-5 text-center min-w-[120px]" style={{ background: '#0C0C0C', border: '1px solid #1F1F1F' }}>
                        <p className="text-3xl font-black" style={{ color: '#A3E635' }}>Rs.{monthlyEarnings.toFixed(0)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[2px] mt-1" style={{ color: '#525252' }}>This Month</p>
                      </div>
                      <div className="rounded-2xl p-5 text-center min-w-[120px]" style={{ background: '#0C0C0C', border: '1px solid #1F1F1F' }}>
                        <p className="text-3xl font-black" style={{ color: '#818CF8' }}>{referrerMetrics?.successfulReferrals ?? 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[2px] mt-1" style={{ color: '#525252' }}>Referred</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* How you earn — CRED style */}
                <motion.div variants={fadeUp} className="rounded-2xl p-6 relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                  <p className="text-xs font-bold uppercase tracking-[3px] mb-5" style={{ color: '#525252' }}>How you earn</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { step: '01', icon: Users, title: 'We match candidates', desc: 'Qualified job seekers are matched to your company. You get their resume and details.', c: '#A3E635' },
                      { step: '02', icon: Briefcase, title: 'You submit referral', desc: 'Use your company\'s internal referral portal. Takes 2 minutes. We guide you through it.', c: '#818CF8' },
                      { step: '03', icon: IndianRupee, title: 'You earn Rs.249+', desc: 'Once verified, the payout hits your account. Earn more for senior roles.', c: '#FB923C' },
                    ].map((s) => (
                      <div key={s.step} className="flex gap-4">
                        <div className="shrink-0">
                          <span className="text-3xl font-black" style={{ color: '#1F1F1F' }}>{s.step}</span>
                        </div>
                        <div>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: `${s.c}08` }}>
                            <s.icon className="w-5 h-5" style={{ color: s.c }} />
                          </div>
                          <p className="text-sm font-bold mb-1" style={{ color: '#F5F5F5' }}>{s.title}</p>
                          <p className="text-xs leading-relaxed" style={{ color: '#D4D4D4' }}>{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Stats row */}
                <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                  {[
                    { n: assigned.length, l: 'Pending', c: '#FB923C', icon: Target },
                    { n: completed.length, l: 'Completed', c: '#A3E635', icon: CheckCircle2 },
                    { n: `${Array.isArray(referreRequest) && referreRequest.length > 0 ? Math.round((completed.length / referreRequest.length) * 100) : 0}%`, l: 'Success Rate', c: '#818CF8', icon: TrendingUp },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl p-5 text-center group transition-all hover:-translate-y-0.5 relative overflow-hidden"
                      style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: s.c }} />
                      <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.c }} />
                      <p className="text-2xl font-black" style={{ color: s.c }}>{s.n}</p>
                      <p className="text-[9px] font-bold uppercase tracking-[2px] mt-1" style={{ color: '#525252' }}>{s.l}</p>
                    </div>
                  ))}
                </motion.div>

                {/* Assigned */}
                <motion.div variants={fadeUp}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>Candidates waiting</p>
                    {assigned.length > 0 && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#FB923C10', color: '#FB923C' }}>{assigned.length} pending</span>}
                  </div>
                  {referrerLoading ? (
                    <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#141414' }} />)}</div>
                  ) : assigned.length > 0 ? (
                    <div className="space-y-3">{assigned.map((r: any) => (
                      <ReferralCard key={r.referral.id} referral={r} isReferrer onClick={() => openDetails(r)}
                        onUploadProof={() => handleUploadProof(r.assignment?.id)} onDecline={() => handleDecline(r.assignment?.id)} />
                    ))}</div>
                  ) : (
                    <div className="rounded-2xl p-10 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#1C1C1C' }}>
                        <Users className="w-7 h-7" style={{ color: '#525252' }} />
                      </div>
                      <p className="text-base font-bold mb-1" style={{ color: '#F5F5F5' }}>No candidates right now</p>
                      <p className="text-sm" style={{ color: '#737373' }}>We'll automatically match qualified seekers to {user.company || 'your company'}. You'll get notified.</p>
                    </div>
                  )}
                </motion.div>

                {completed.length > 0 && (
                  <motion.div variants={fadeUp}>
                    <p className="text-sm font-bold mb-3" style={{ color: '#737373' }}>Completed referrals</p>
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
      </div>

      <ProofUploadModal isOpen={proofModal.isOpen} onClose={() => setProofModal({ isOpen: false, assignmentId: null })} onSubmit={handleProofSubmit} />
      <Dialog open={detailsModal.isOpen} onOpenChange={(o) => !o && setDetailsModal({ isOpen: false, request: null })}>
        <DialogContent style={{ background: '#1C1C1C', border: '1px solid #2A2A2A' }}>
          <DialogHeader><DialogTitle className="text-lg font-bold" style={{ color: '#F5F5F5' }}>Referral Details</DialogTitle></DialogHeader>
          {detailsModal.request && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CompanyIcon name={detailsModal.request.job?.company || ''} size={40} />
                  <div><p className="font-bold" style={{ color: '#F5F5F5' }}>{detailsModal.request.job?.title}</p><p className="text-sm" style={{ color: '#D4D4D4' }}>{detailsModal.request.job?.company}</p><p className="text-xs" style={{ color: '#737373' }}>{detailsModal.request.job?.location}</p></div>
                </div>
                <span className="text-sm font-bold" style={{ color: '#A3E635' }}>Rs.499</span>
              </div>
              {detailsModal.request.seeker && (
                <div className="rounded-xl p-4" style={{ background: '#141414' }}>
                  <p className="text-[10px] uppercase tracking-[2px] mb-2" style={{ color: '#525252' }}>Candidate</p>
                  <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>{detailsModal.request.seeker.name}</p>
                  {detailsModal.request.referral?.resumeUrl && <Button variant="outline" size="sm" className="mt-3" onClick={() => window.open(detailsModal.request.referral.resumeUrl, '_blank')}>View Resume</Button>}
                </div>
              )}
              {currentRole === 'referrer' && detailsModal.request.referral?.status === 'assigned' && (
                <div className="flex gap-3">
                  <button className="flex-1 h-10 rounded-xl text-sm font-bold transition-all hover:brightness-110" style={{ background: '#A3E635', color: '#0C0C0C' }}
                    onClick={() => { setDetailsModal({ isOpen: false, request: null }); handleUploadProof(detailsModal.request.assignment.id); }}>Upload Proof</button>
                  <button className="flex-1 h-10 rounded-xl text-sm font-medium" style={{ background: '#EF444410', color: '#EF4444', border: '1px solid #EF444420' }}
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
