import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Clock, CheckCircle2, AlertCircle, Ban } from 'lucide-react';
import { type Referral, type Job, type User } from '@shared/schema';

interface ReferralCardProps {
  referral: any;
  isReferrer?: boolean;
  onViewResume?: () => void;
  onUploadProof?: () => void;
  onClick?: () => void;
  onDecline?: () => void;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string; progress: number }> = {
  pending: {
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-100',
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Pending',
    progress: 20,
  },
  assigned: {
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-100',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Assigned',
    progress: 50,
  },
  verification_pending: {
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-100',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: 'Verifying',
    progress: 80,
  },
  completed: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Completed',
    progress: 100,
  },
  expired: {
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-100',
    icon: <Ban className="w-3.5 h-3.5" />,
    label: 'Expired',
    progress: 0,
  },
  cancelled: {
    color: 'text-gray-500',
    bg: 'bg-gray-50 border-gray-100',
    icon: <X className="w-3.5 h-3.5" />,
    label: 'Cancelled',
    progress: 0,
  },
};

function getCompanyDomain(company: string): string {
  const cleaned = company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const domainMap: Record<string, string> = {
    google: 'google.com', microsoft: 'microsoft.com', amazon: 'amazon.com',
    flipkart: 'flipkart.com', swiggy: 'swiggy.com', meta: 'meta.com',
    apple: 'apple.com', netflix: 'netflix.com', uber: 'uber.com',
    zomato: 'zomato.com', paytm: 'paytm.com', razorpay: 'razorpay.com',
    stripe: 'stripe.com', atlassian: 'atlassian.com', adobe: 'adobe.com',
    salesforce: 'salesforce.com', oracle: 'oracle.com', ibm: 'ibm.com',
    tcs: 'tcs.com', infosys: 'infosys.com', wipro: 'wipro.com',
  };
  return domainMap[cleaned] || `${cleaned}.com`;
}

export default function ReferralCard({ referral, isReferrer = false, onViewResume, onUploadProof, onClick, onDecline }: ReferralCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
  };

  const referralData: Referral | undefined = referral?.referral;
  const assignment = referral?.assignment;
  const job: Job | undefined = referral?.job;
  const seeker: User | undefined = referral?.seeker;
  const displayStatus: string = referralData?.status ?? 'pending';
  const config = statusConfig[displayStatus] || statusConfig.pending;

  return (
    <Card
      className={`modern-card card-hover border-0 overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex">
          {/* Left accent bar */}
          <div
            className={`w-1 shrink-0 ${
              displayStatus === 'completed' ? 'bg-emerald-500' :
              displayStatus === 'assigned' ? 'bg-blue-500' :
              displayStatus === 'pending' ? 'bg-amber-400' :
              displayStatus === 'verification_pending' ? 'bg-violet-500' :
              'bg-gray-300'
            }`}
          />

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Company logo */}
                {job?.company && (
                  <img
                    src={`https://logo.clearbit.com/${getCompanyDomain(job.company)}`}
                    alt=""
                    className="company-logo shrink-0 mt-0.5"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="min-w-0">
                  <h4 className="font-semibold text-[var(--dark-gray)] text-sm leading-tight truncate">
                    {job?.title || 'Unknown Position'}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job?.company || 'Unknown Company'} · {job?.location || 'Remote'}
                  </p>
                  {isReferrer && seeker && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Candidate: <span className="font-medium text-foreground">{seeker.name}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className={`pill-badge ${config.bg} ${config.color} border gap-1`}>
                  {config.icon}
                  {config.label}
                </div>
                <p className={`text-sm font-semibold ${isReferrer ? 'text-emerald-600' : 'text-[var(--dark-gray)]'}`}>
                  {isReferrer ? '+' : ''}Rs.499
                </p>
              </div>
            </div>

            {/* Progress bar for seekers */}
            {!isReferrer && referralData && (
              <div className="mt-3 pt-3 border-t border-gray-100/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={`font-medium ${config.color}`}>{config.label}</span>
                </div>
                <Progress value={config.progress} className="h-1.5" />
              </div>
            )}

            {/* Referrer action buttons */}
            {isReferrer && assignment?.status === 'assigned' && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100/80">
                {onUploadProof && (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onUploadProof(); }}
                    className="flex-1 h-8 text-xs font-medium bg-[var(--purple-primary)] hover:bg-[var(--purple-primary)]/90 rounded-lg"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload Proof
                  </Button>
                )}
                {onDecline && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onDecline(); }}
                    className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Decline
                  </Button>
                )}
              </div>
            )}

            {referralData?.completedAt && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                Completed {formatDate(referralData.completedAt)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
