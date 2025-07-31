import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit3, Mail, MapPin, Building2, Calendar, Award, DollarSign } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-lg font-semibold text-[var(--dark-gray)]">Profile</h1>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Profile Header */}
        <Card className="modern-card border-0">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] p-1">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-[var(--dark-gray)] mb-1">{user.name}</h2>
            <p className="text-gray-600 mb-4">{user.email}</p>
            
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-[var(--purple-primary)]/10 to-[var(--emerald-success)]/10 border-[var(--purple-primary)] text-[var(--purple-primary)]"
            >
              {user.role === 'both' ? 'Seeker & Referrer' : user.role}
            </Badge>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="modern-card border-0">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-[var(--emerald-success)]" />
              <div className="text-2xl font-bold text-[var(--emerald-success)]">${user.totalEarnings}</div>
              <div className="text-xs text-gray-600">Total Earned</div>
            </CardContent>
          </Card>
          
          <Card className="modern-card border-0">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-[var(--orange-accent)]" />
              <div className="text-2xl font-bold text-[var(--orange-accent)]">{user.successfulReferrals}</div>
              <div className="text-xs text-gray-600">Successful Referrals</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <Card className="modern-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[var(--dark-gray)]">Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-[var(--dark-gray)]">Email</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            </div>
            
            {user.company && (
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-[var(--dark-gray)]">Company</div>
                  <div className="text-sm text-gray-600">{user.company}</div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-[var(--dark-gray)]">Member Since</div>
                <div className="text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="modern-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[var(--dark-gray)]">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setLocation('/analytics')}
            >
              📊 View Analytics
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setLocation('/profile-settings')}
            >
              ⚙️ Profile Settings
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={signOut}
            >
              🚪 Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}