import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, IndianRupee, Award, Calendar, Target } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user's referral data for analytics
  const { data: seekerReferrals = [] } = useQuery({
    queryKey: ['/api/referrals/seeker', user?.id],
    enabled: !!user,
  });

  const { data: referrerReferrals = [] } = useQuery({
    queryKey: ['/api/referrals/referrer', user?.id],
    enabled: !!user,
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  // Calculate analytics data
  const referrals = Array.isArray(referrerReferrals) ? referrerReferrals : [];
  const applications = Array.isArray(seekerReferrals) ? seekerReferrals : [];
  
  const totalReferralsGiven = referrals.length;
  const completedReferrals = referrals.filter((r: any) => r.status === 'completed').length;
  const successRate = totalReferralsGiven > 0 ? Math.round((completedReferrals / totalReferralsGiven) * 100) : 0;
  
  const totalApplications = applications.length;
  const activeApplications = applications.filter((r: any) => ['pending', 'assigned', 'verification_pending'].includes(r.status)).length;
  
  // Monthly earnings simulation
  const monthlyEarnings = parseFloat(user.totalEarnings) * 0.3; // Simulate 30% earned this month
  const avgReferralValue = totalReferralsGiven > 0 ? parseFloat(user.totalEarnings) / completedReferrals : 0;

  return (
    <div className="min-h-screen bg-[#0B0A10]">
      {/* Header */}
      <div className="bg-[#13121D] border-b border-[#252336] sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/profile')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-lg font-semibold text-[#FAFAFA]">Analytics</h1>
          
          <div className="w-12"></div> {/* Spacer */}
        </div>
      </div>

    </div>
  );
}