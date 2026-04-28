import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit3, Mail, MapPin, Building2, Calendar, Award, IndianRupee, Settings, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/logo';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="relative flex items-center justify-center p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/dashboard')}
            className="absolute left-4 flex items-center space-x-2 text-gray-500 hover:text-[var(--purple-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <Logo size={28} showText={false} />

          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="w-4 h-4" />
          </Button> */}
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-md mx-auto pb-12">
        {/* Profile Header */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="modern-card border-0 overflow-hidden">
            <CardContent className="p-8 text-center">
              {/* Avatar with gradient border */}
              <div className="relative w-28 h-28 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--purple-primary)] via-[var(--purple-light)] to-[var(--emerald-success)] p-[3px] animate-fade-in">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--purple-primary)] to-[var(--emerald-success)] flex items-center justify-center text-white text-3xl font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[var(--dark-gray)] mb-1 tracking-tight">{user.name}</h2>
              <p className="text-gray-400 text-sm mb-5">{user.email}</p>

              <Badge
                variant="outline"
                className="pill-badge bg-gradient-to-r from-[var(--purple-primary)]/8 to-[var(--emerald-success)]/8 border-[var(--purple-primary)]/30 text-[var(--purple-primary)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
              >
                {user.role === 'both' ? 'Seeker & Referrer' : user.role}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="modern-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-400 uppercase tracking-wider text-xs">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-2">
              <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[var(--purple-primary)]/8 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4.5 h-4.5 text-[var(--purple-primary)]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</div>
                  <div className="text-sm font-medium text-[var(--dark-gray)] truncate">{user.email}</div>
                </div>
              </div>

              {user.company && (
                <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[var(--emerald-success)]/8 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4.5 h-4.5 text-[var(--emerald-success)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Company</div>
                    <div className="text-sm font-medium text-[var(--dark-gray)]">{user.company}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/8 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Member Since</div>
                  <div className="text-sm font-medium text-[var(--dark-gray)]">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="modern-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-400 uppercase tracking-wider text-xs">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              {/* <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation('/analytics')}
              >
                View Analytics
              </Button> */}

              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl text-[var(--dark-gray)] hover:bg-gray-50 font-medium group transition-all"
                onClick={() => setLocation('/profile-settings')}
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--purple-primary)]/8 flex items-center justify-center mr-3 group-hover:bg-[var(--purple-primary)]/12 transition-colors">
                  <Settings className="w-4 h-4 text-[var(--purple-primary)]" />
                </div>
                Profile Settings
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl text-gray-500 hover:bg-red-50/60 hover:text-red-500 font-medium group transition-all"
                onClick={signOut}
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-red-100/80 transition-colors">
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                </div>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
