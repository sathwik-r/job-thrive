import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const statusConfig: Record<string, { color: string; bg: string; accent: string; icon: React.ReactNode; label: string; progress: number }> = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', accent: '#FB923C', icon: <Clock className="w-3 h-3" />, label: 'Pending', progress: 20 },
  assigned: { color: 'text-[#818CF8]', bg: 'bg-[#818CF8]/10 border-[#818CF8]/20', accent: '#818CF8', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Assigned', progress: 50 },
  verification_pending: { color: 'text-[#A3E635]', bg: 'bg-[#A3E635]/10 border-[#A3E635]/20', accent: '#A3E635', icon: <AlertCircle className="w-3 h-3" />, label: 'Verifying', progress: 80 },
  completed: { color: 'text-[#A3E635]', bg: 'bg-[#A3E635]/10 border-[#A3E635]/20', accent: '#A3E635', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Completed', progress: 100 },
  expired: { color: 'text-[#FB923C]', bg: 'bg-[#FB923C]/10 border-[#FB923C]/20', accent: '#FB923C', icon: <Ban className="w-3 h-3" />, label: 'Expired', progress: 0 },
  cancelled: { color: 'text-[#525252]', bg: 'bg-[#525252]/10 border-[#525252]/20', accent: '#525252', icon: <X className="w-3 h-3" />, label: 'Cancelled', progress: 0 },
};

function getCompanyDomain(company: string): string {
  const cleaned = company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const map: Record<string, string> = {
    google:'google.com', microsoft:'microsoft.com', amazon:'amazon.com', flipkart:'flipkart.com',
    swiggy:'swiggy.com', meta:'meta.com', apple:'apple.com', netflix:'netflix.com',
    uber:'uber.com', zomato:'zomato.com', paytm:'paytm.com', razorpay:'razorpay.com',
    stripe:'stripe.com', atlassian:'atlassian.com', adobe:'adobe.com', salesforce:'salesforce.com',
    oracle:'oracle.com', ibm:'ibm.com', tcs:'tcs.com', infosys:'infosys.com', wipro:'wipro.com',
  };
  return map[cleaned] || `${cleaned}.com`;
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
      className={`border-0 overflow-hidden transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ background: '#1C1C1C', borderColor: '#1F1F1F', borderWidth: 1 }}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex">
          {/* Left accent bar */}
          <div className="w-[3px] shrink-0 rounded-l" style={{ background: config.accent }} />

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {job?.company && (
                  <img
                    src={`https://logo.clearbit.com/${getCompanyDomain(job.company)}`}
                    alt=""
                    className="w-9 h-9 rounded-lg object-contain p-1 shrink-0 mt-0.5"
                    style={{ background: '#141414', border: '1px solid #1F1F1F' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-[#F5F5F5] truncate">{job?.title || 'Unknown Position'}</h4>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">{job?.company || 'Unknown'} · {job?.location || 'Remote'}</p>
                  {isReferrer && seeker && (
                    <p className="text-xs text-[#525252] mt-1">Candidate: <span className="font-medium text-[#A3A3A3]">{seeker.name}</span></p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className={`pill-badge ${config.bg} ${config.color} border`}>{config.icon}{config.label}</div>
                <p className={`text-sm font-bold ${isReferrer ? 'text-[#A3E635]' : 'text-[#F5F5F5]'}`}>
                  {isReferrer ? '+' : ''}Rs.499
                </p>
              </div>
            </div>

            {!isReferrer && referralData && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1F1F1F' }}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#525252]">Progress</span>
                  <span className={`font-semibold ${config.color}`}>{config.label}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#141414' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${config.progress}%`, background: config.accent }} />
                </div>
              </div>
            )}

            {isReferrer && assignment?.status === 'assigned' && (
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #1F1F1F' }}>
                {onUploadProof && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); onUploadProof(); }}
                    className="flex-1 h-8 text-xs font-bold rounded-lg text-[#0C0C0C]"
                    style={{ background: '#A3E635' }}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />Upload Proof
                  </Button>
                )}
                {onDecline && (
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDecline(); }}
                    className="h-8 text-xs text-[#FB923C] hover:text-[#FB923C] hover:bg-[#FB923C15]">Decline</Button>
                )}
              </div>
            )}

            {referralData?.completedAt && (
              <p className="mt-2 text-[10px] text-[#3F3F3F]">Completed {formatDate(referralData.completedAt)}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
