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
    return <div className="min-h-screen bg-[#0B0A10] flex items-center justify-center text-[#FAFAFA]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0A10]">
      {/* Header */}
      <div className="bg-[#13121D]/80 backdrop-blur-md border-b border-[#252336] sticky top-0 z-10">
        <div className="relative flex items-center justify-center p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/dashboard')}
            className="absolute left-4 flex items-center space-x-2 text-[#A1A0B3] hover:text-[#6D5BF7] hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <span className="text-[#FAFAFA] text-base font-semibold tracking-tight">Profile</span>

          <div className="absolute right-4">
            <Logo size={28} showText={false} />
          </div>
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
          <Card className="bg-[#1A1828] border border-[#252336] rounded-2xl overflow-hidden shadow-none">
            <CardContent className="p-8 text-center">
              {/* Avatar with gradient border */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6D5BF7] via-[#A259FF] to-[#1DB954] p-[3px]">
                  <div className="w-full h-full rounded-full bg-[#1A1828] flex items-center justify-center overflow-hidden">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6D5BF7] to-[#1DB954] flex items-center justify-center text-white text-3xl font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-[900] text-[#FAFAFA] mb-1 tracking-tight">{user.name}</h2>
              <p className="text-[#A1A0B3] text-sm mb-5">{user.email}</p>

              <Badge
                variant="outline"
                className="bg-[#6D5BF7]/10 border-[#6D5BF7]/30 text-[#6D5BF7] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full"
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
          <Card className="bg-[#1A1828] border border-[#252336] rounded-2xl shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#5C5A72] uppercase tracking-wider">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-2">
              <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-[#211F30]/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#211F30] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4.5 h-4.5 text-[#6D5BF7]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#5C5A72] uppercase tracking-wider">Email</div>
                  <div className="text-sm font-medium text-[#FAFAFA] truncate">{user.email}</div>
                </div>
              </div>

              {user.company && (
                <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-[#211F30]/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#211F30] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4.5 h-4.5 text-[#1DB954]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#5C5A72] uppercase tracking-wider">Company</div>
                    <div className="text-sm font-medium text-[#FAFAFA]">{user.company}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-[#211F30]/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#211F30] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-[#FF7262]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#5C5A72] uppercase tracking-wider">Member Since</div>
                  <div className="text-sm font-medium text-[#FAFAFA]">
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
          <Card className="bg-[#1A1828] border border-[#252336] rounded-2xl shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#5C5A72] uppercase tracking-wider">Account</CardTitle>
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
                className="w-full justify-start h-12 rounded-xl text-[#FAFAFA] hover:bg-[#211F30] font-medium group transition-all"
                onClick={() => setLocation('/profile-settings')}
              >
                <div className="w-9 h-9 rounded-lg bg-[#211F30] flex items-center justify-center mr-3 group-hover:bg-[#6D5BF7]/15 transition-colors">
                  <Settings className="w-4 h-4 text-[#6D5BF7]" />
                </div>
                Profile Settings
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl text-[#A1A0B3] hover:bg-[#FF7262]/10 hover:text-[#FF7262] font-medium group transition-all"
                onClick={signOut}
              >
                <div className="w-9 h-9 rounded-lg bg-[#211F30] flex items-center justify-center mr-3 group-hover:bg-[#FF7262]/15 transition-colors">
                  <LogOut className="w-4 h-4 text-[#5C5A72] group-hover:text-[#FF7262] transition-colors" />
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
