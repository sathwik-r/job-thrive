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
    return <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center text-[#F5F5F5]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      {/* Header */}
      <div className="bg-[#141414]/80 backdrop-blur-md border-b border-[#1F1F1F] sticky top-0 z-10">
        <div className="relative flex items-center justify-center p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/dashboard')}
            className="absolute left-4 flex items-center space-x-2 text-[#A3A3A3] hover:text-[#A3E635] hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <span className="text-[#F5F5F5] text-base font-semibold tracking-tight">Profile</span>

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
          <Card className="bg-[#1C1C1C] border border-[#1F1F1F] rounded-2xl overflow-hidden shadow-none">
            <CardContent className="p-8 text-center">
              {/* Avatar with gradient border */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#A3E635] via-[#818CF8] to-[#A3E635] p-[3px]">
                  <div className="w-full h-full rounded-full bg-[#1C1C1C] flex items-center justify-center overflow-hidden">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br bg-[#A3E635] flex items-center justify-center text-white text-3xl font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-[900] text-[#F5F5F5] mb-1 tracking-tight">{user.name}</h2>
              <p className="text-[#A3A3A3] text-sm mb-5">{user.email}</p>

              <Badge
                variant="outline"
                className="bg-[#A3E635]/10 border-[#A3E635]/30 text-[#A3E635] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full"
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
          <Card className="bg-[#1C1C1C] border border-[#1F1F1F] rounded-2xl shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#525252] uppercase tracking-wider">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-2">
              <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-[#242424]/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#242424] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4.5 h-4.5 text-[#A3E635]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#525252] uppercase tracking-wider">Email</div>
                  <div className="text-sm font-medium text-[#F5F5F5] truncate">{user.email}</div>
                </div>
              </div>

              {user.company && (
                <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-[#242424]/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#242424] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4.5 h-4.5 text-[#A3E635]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#525252] uppercase tracking-wider">Company</div>
                    <div className="text-sm font-medium text-[#F5F5F5]">{user.company}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-[#242424]/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#242424] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-[#FB923C]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#525252] uppercase tracking-wider">Member Since</div>
                  <div className="text-sm font-medium text-[#F5F5F5]">
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
          <Card className="bg-[#1C1C1C] border border-[#1F1F1F] rounded-2xl shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#525252] uppercase tracking-wider">Account</CardTitle>
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
                className="w-full justify-start h-12 rounded-xl text-[#F5F5F5] hover:bg-[#242424] font-medium group transition-all"
                onClick={() => setLocation('/profile-settings')}
              >
                <div className="w-9 h-9 rounded-lg bg-[#242424] flex items-center justify-center mr-3 group-hover:bg-[#A3E635]/15 transition-colors">
                  <Settings className="w-4 h-4 text-[#A3E635]" />
                </div>
                Profile Settings
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl text-[#A3A3A3] hover:bg-[#FB923C]/10 hover:text-[#FB923C] font-medium group transition-all"
                onClick={signOut}
              >
                <div className="w-9 h-9 rounded-lg bg-[#242424] flex items-center justify-center mr-3 group-hover:bg-[#FB923C]/15 transition-colors">
                  <LogOut className="w-4 h-4 text-[#525252] group-hover:text-[#FB923C] transition-colors" />
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
