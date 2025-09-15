import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { type Referral, type Job, type User } from '@shared/schema';

interface ReferralCardProps {
  referral: any;
  isReferrer?: boolean;
  onViewResume?: () => void;
  onUploadProof?: () => void;
  onClick?: () => void;
  onDecline?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-[var(--orange-accent)]/20 text-[var(--orange-accent)]';
    case 'assigned':
      return 'bg-blue-100 text-blue-600';
    case 'verification_pending':
      return 'bg-[var(--orange-accent)]/20 text-[var(--orange-accent)]';
    case 'completed':
      return 'bg-[var(--emerald-success)]/20 text-[var(--emerald-success)]';
    case 'verification_pending':
      return 'bg-yellow-100 text-yellow-600';
    case 'expired':
      return 'bg-red-100 text-red-500';
    case 'cancelled':
      return 'bg-gray-100 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getProgressValue = (status: string) => {
  switch (status) {
    case 'pending':
      return 20;
    case 'assigned':
      return 50;
    case 'verification_pending':
      return 80;
    case 'completed':
      return 100;
    case 'verification_pending':
      return 90;
    case 'expired':
    case 'cancelled':
      return 0;
    default:
      return 0;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending assignment';
    case 'assigned':
      return 'Referrer assigned';
    case 'verification_pending':
      return 'Proof submitted';
    case 'completed':
      return 'Completed';
    case 'verification_pending':
      return 'Pending verification';
    case 'expired':
      return 'Expired';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function ReferralCard({ referral, isReferrer = false, onViewResume, onUploadProof, onClick, onDecline }: ReferralCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Normalize data shape from either flat Referral or { assignment, referral, job, seeker }
  const referralData: Referral | undefined = referral?.referral;
  const assignment = referral?.assignment;
  const job: Job | undefined = referral?.job ;
  const seeker: User | undefined = referral?.seeker ;
  const displayStatus: string = referralData?.status ?? 'pending';

  return (
    <Card className={`card-hover ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-[var(--dark-gray)] mb-1">
              {job?.title || 'Unknown Position'}
            </h4>
            <p className="text-gray-600 text-sm mb-1">
              {job?.company || 'Unknown Company'}
            </p>
            {isReferrer && seeker && (
              <p className="text-gray-500 text-xs">
                Candidate: <span className="font-medium">{seeker.name}</span>
              </p>
            )}
            <p className="text-gray-500 text-xs">
              {job?.location || 'Location not specified'}
            </p>
          </div>
          <div className="text-right">
            <Badge className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(displayStatus)}`}>
              {(displayStatus.replace('_', ' ')).charAt(0).toUpperCase() + (displayStatus.replace('_', ' ')).slice(1)}
            </Badge>
            <p className={`text-sm font-semibold ${isReferrer ? 'text-[var(--emerald-success)]' : 'text-[var(--dark-gray)]'}`}>
              {isReferrer ? '+' : ''}₹ 499
            </p>
          </div>
        </div>

        {!isReferrer && referralData && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className={`font-medium ${displayStatus === 'completed' ? 'text-[var(--emerald-success)]' : 'text-[var(--purple-primary)]'}`}>
                {getStatusText(displayStatus)}
              </span>
            </div>
            <Progress value={getProgressValue(displayStatus)} className="h-2" />
          </div>
        )}

        {isReferrer && assignment?.status === 'assigned' && (
          <div className="flex items-center space-x-3 mt-4">
            {onUploadProof && (
              <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); onUploadProof(); }}
                className="flex-1 bg-[var(--purple-primary)] text-white font-medium py-2 px-4 rounded-xl hover:bg-[var(--purple-primary)]/90 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Proof
              </Button>
            )}
            {onDecline && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onDecline(); }}
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                Decline
              </Button>
            )}
          </div>
        )}

        {referralData?.completedAt && (
          <div className="mt-2 text-xs text-gray-500">
            Completed on {formatDate(referralData.completedAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
