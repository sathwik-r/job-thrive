import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Mail, Building2, Calendar, Settings, LogOut, ChevronRight, Briefcase, GraduationCap, Target, Award } from 'lucide-react';
import { useLocation } from 'wouter';
import AppLayout from '@/components/app-layout';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return null;

  const fields = [user.company, user.position, user.education, user.targetDomain, user.experience, user.skills?.length];
  const filled = fields.filter(Boolean).length;
  const strength = Math.round((filled / fields.length) * 100);

  return (
    <AppLayout>
      <div className="fixed top-20 right-10 w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.025) 0%, transparent 70%)' }} />

      <div className="max-w-lg mx-auto p-4 md:p-6 relative">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">

          {/* ── Profile Header ───────────────── */}
          <motion.div variants={fadeUp} className="rounded-2xl p-6 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #141414, #1C1C1C)', border: '1px solid #1F1F1F' }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #A3E635, #818CF8)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.06) 0%, transparent 70%)' }} />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-black mb-3 ring-2 ring-offset-2"
                style={{ background: '#A3E635', color: '#0C0C0C' }}>
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : user.name?.charAt(0) || 'U'}
              </div>
              <h1 className="text-xl font-black" style={{ color: '#F5F5F5' }}>{user.name}</h1>
              <p className="text-sm mt-0.5" style={{ color: '#737373' }}>{user.email}</p>
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-[2px] px-3 py-1 rounded-full"
                style={{ background: '#A3E63510', color: '#A3E635', border: '1px solid #A3E63520' }}>
                {user.role === 'both' ? 'Seeker & Referrer' : user.role}
              </span>
            </div>
          </motion.div>

          {/* ── Profile Strength ──────────────── */}
          <motion.div variants={fadeUp}>
            <button onClick={() => setLocation('/profile-settings')}
              className="w-full rounded-xl p-4 flex items-center gap-4 group transition-all hover:border-[#2A2A2A]"
              style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
              <div className="relative w-14 h-14 shrink-0">
                <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1F1F1F" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke={strength >= 80 ? '#A3E635' : strength >= 50 ? '#FB923C' : '#EF4444'} strokeWidth="2.5"
                    strokeDasharray={`${strength * 0.94} 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black" style={{ color: '#F5F5F5' }}>{strength}%</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>Profile strength</p>
                <p className="text-xs mt-0.5" style={{ color: '#737373' }}>
                  {strength >= 100 ? 'Your profile is complete!' : strength >= 70 ? 'Almost there! Add a few more details.' : 'Complete your profile to get matched 3x faster'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#737373' }} />
            </button>
          </motion.div>

          {/* ── Stats ────────────────────────── */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
            {[
              { n: user.successfulReferrals || 0, l: 'Referrals', icon: Award, c: '#A3E635' },
              { n: `Rs.${user.totalSpent || 0}`, l: 'Invested', icon: Target, c: '#818CF8' },
              { n: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '—', l: 'Joined', icon: Calendar, c: '#FB923C' },
            ].map((s) => (
              <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${s.c}10` }}>
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.c }} />
                </div>
                <p className="text-sm font-black" style={{ color: '#F5F5F5' }}>{s.n}</p>
                <p className="text-[9px] font-bold uppercase tracking-[2px] mt-0.5" style={{ color: '#525252' }}>{s.l}</p>
              </div>
            ))}
          </motion.div>

          {/* ── Info ─────────────────────────── */}
          <motion.div variants={fadeUp} className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <p className="text-[10px] font-bold uppercase tracking-[2px] px-4 pt-4 pb-2" style={{ color: '#525252' }}>Details</p>
            {[
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Building2, label: 'Company', value: user.company || 'Not set' },
              { icon: Briefcase, label: 'Position', value: user.position || 'Not set' },
              { icon: GraduationCap, label: 'Education', value: user.education || 'Not set' },
              { icon: Target, label: 'Target Domain', value: user.targetDomain || 'Not set' },
            ].map((item, i, arr) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #1F1F1F' : 'none' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1C1C1C' }}>
                  <item.icon className="w-4 h-4" style={{ color: '#737373' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[2px]" style={{ color: '#525252' }}>{item.label}</p>
                  <p className="text-sm font-medium truncate" style={{ color: item.value === 'Not set' ? '#3F3F3F' : '#F5F5F5' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── Skills ───────────────────────── */}
          {user.skills && user.skills.length > 0 && (
            <motion.div variants={fadeUp} className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
              <p className="text-[10px] font-bold uppercase tracking-[2px] mb-3" style={{ color: '#525252' }}>Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((s) => (
                  <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#818CF810', color: '#818CF8', border: '1px solid #818CF820' }}>{s}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Actions ──────────────────────── */}
          <motion.div variants={fadeUp} className="space-y-2">
            <button onClick={() => setLocation('/profile-settings')}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all hover:border-[#2A2A2A]"
              style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#A3E63510' }}>
                <Settings className="w-4 h-4" style={{ color: '#A3E635' }} />
              </div>
              <span className="text-sm font-medium flex-1 text-left" style={{ color: '#F5F5F5' }}>Edit Profile</span>
              <ChevronRight className="w-4 h-4" style={{ color: '#525252' }} />
            </button>

            <button onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all hover:bg-[#EF444405]"
              style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EF444410' }}>
                <LogOut className="w-4 h-4" style={{ color: '#EF4444' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#EF4444' }}>Sign Out</span>
            </button>
          </motion.div>

        </motion.div>
      </div>
    </AppLayout>
  );
}
