import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, DollarSign, Award, Calendar, Target } from 'lucide-react';
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
  const activeApplications = applications.filter((r: any) => ['pending', 'assigned', 'in_review'].includes(r.status)).length;
  
  // Monthly earnings simulation
  const monthlyEarnings = parseFloat(user.totalEarnings) * 0.3; // Simulate 30% earned this month
  const avgReferralValue = totalReferralsGiven > 0 ? parseFloat(user.totalEarnings) / completedReferrals : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
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
          
          <h1 className="text-lg font-semibold text-[var(--dark-gray)]">Analytics</h1>
          
          <div className="w-12"></div> {/* Spacer */}
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="modern-card border-0 bg-gradient-to-br from-[var(--emerald-success)] to-[var(--emerald-success)]/80 text-white">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">${user.totalEarnings}</div>
              <div className="text-xs opacity-90">Total Earned</div>
            </CardContent>
          </Card>
          
          <Card className="modern-card border-0 bg-gradient-to-br from-[var(--purple-primary)] to-[var(--purple-light)] text-white">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{user.successfulReferrals}</div>
              <div className="text-xs opacity-90">Successful Referrals</div>
            </CardContent>
          </Card>
        </div>

        {/* Referrer Analytics */}
        <Card className="modern-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold gradient-text flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Referrer Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[var(--purple-primary)]">{totalReferralsGiven}</div>
                <div className="text-xs text-gray-600">Total Given</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--emerald-success)]">{completedReferrals}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--orange-accent)]">{successRate}%</div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[var(--dark-gray)]">This Month</span>
                <span className="text-sm font-bold text-[var(--emerald-success)]">${monthlyEarnings.toFixed(0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[var(--emerald-success)] to-[var(--orange-accent)] h-2 rounded-full"
                  style={{ width: `${Math.min((monthlyEarnings / 2000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">Goal: $2,000/month</div>
            </div>
          </CardContent>
        </Card>

        {/* Job Seeker Analytics */}
        <Card className="modern-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold gradient-text flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Job Search Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[var(--purple-primary)]">{totalApplications}</div>
                <div className="text-xs text-gray-600">Applications</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--orange-accent)]">{activeApplications}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--dark-gray)]">${user.totalSpent}</div>
                <div className="text-xs text-gray-600">Invested</div>
              </div>
            </div>

            {avgReferralValue > 0 && (
              <div className="bg-gradient-to-r from-[var(--purple-primary)]/10 to-[var(--emerald-success)]/10 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--purple-primary)]">${avgReferralValue.toFixed(0)}</div>
                  <div className="text-xs text-gray-600">Average Referral Value</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="modern-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold gradient-text flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--emerald-success)]/10 to-transparent rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[var(--emerald-success)] rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--dark-gray)]">Referral Completed</div>
                    <div className="text-xs text-gray-600">2 days ago</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-[var(--emerald-success)]">+$250</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--purple-primary)]/10 to-transparent rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[var(--purple-primary)] rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--dark-gray)]">New Referral Request</div>
                    <div className="text-xs text-gray-600">5 days ago</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--orange-accent)]/10 to-transparent rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[var(--orange-accent)] rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--dark-gray)]">Applied for Referral</div>
                    <div className="text-xs text-gray-600">1 week ago</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-[var(--orange-accent)]">-$150</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Badge */}
        <Card className="modern-card border-0 bg-gradient-to-r from-[var(--orange-accent)]/20 to-[var(--emerald-success)]/20">
          <CardContent className="p-6 text-center">
            <Award className="w-12 h-12 mx-auto mb-3 text-[var(--orange-accent)]" />
            <h3 className="font-bold text-[var(--dark-gray)] mb-1">Rising Star</h3>
            <p className="text-sm text-gray-600">You're in the top 25% of referrers this month!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}