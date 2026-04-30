import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Mail, Building2, Calendar, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import AppLayout from '@/components/app-layout';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return null;

  // Profile strength
  const fields = [user.company, user.position, user.education, user.targetDomain, user.experience, user.skills?.length];
  const filled = fields.filter(Boolean).length;
  const strength = Math.round((filled / fields.length) * 100);

  return (
    <AppLayout>
      <div className="max-w-md mx-auto p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Profile header */}
          <div className="text-center pt-4">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-black mb-4"
              style={{ background: '#A3E635', color: '#0C0C0C' }}>
              {user.photoUrl ? (
                <img src={user.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name?.charAt(0) || 'U'
              )}
            </div>
            <h1 className="text-xl font-black" style={{ color: '#F5F5F5' }}>{user.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: '#525252' }}>{user.email}</p>
            <div className="inline-flex mt-2">
              <span className="pill pill-lime capitalize">{user.role === 'both' ? 'Seeker & Referrer' : user.role}</span>
            </div>
          </div>

          {/* Profile strength */}
          <div className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: '#A3A3A3' }}>Profile strength</span>
              <span className="text-xs font-black" style={{ color: strength >= 80 ? '#A3E635' : strength >= 50 ? '#FB923C' : '#EF4444' }}>{strength}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: '#1F1F1F' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${strength}%`, background: strength >= 80 ? '#A3E635' : strength >= 50 ? '#FB923C' : '#EF4444' }} />
            </div>
            {strength < 100 && (
              <p className="text-[10px] mt-2" style={{ color: '#3F3F3F' }}>Complete your profile to get matched faster</p>
            )}
          </div>

          {/* Info */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest px-4 pt-4 pb-2" style={{ color: '#3F3F3F' }}>Information</p>
            {[
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Building2, label: 'Company', value: user.company || '—' },
              { icon: Calendar, label: 'Joined', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #1F1F1F' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1C1C1C' }}>
                  <item.icon className="w-4 h-4" style={{ color: '#525252' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#3F3F3F' }}>{item.label}</p>
                  <p className="text-sm font-medium truncate" style={{ color: '#F5F5F5' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={() => setLocation('/profile-settings')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
              style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
              <Settings className="w-4 h-4" style={{ color: '#525252' }} />
              <span className="text-sm font-medium flex-1 text-left" style={{ color: '#F5F5F5' }}>Profile Settings</span>
              <ChevronRight className="w-4 h-4" style={{ color: '#3F3F3F' }} />
            </button>

            <button onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-[#EF444408]"
              style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
              <LogOut className="w-4 h-4" style={{ color: '#EF4444' }} />
              <span className="text-sm font-medium" style={{ color: '#EF4444' }}>Sign Out</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
