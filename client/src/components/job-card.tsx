import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Job } from '@shared/schema';
import { useLocation } from 'wouter';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const [, setLocation] = useLocation();

  const handleApplyForReferral = () => {
    setLocation(`/referral-request/${job.id}`);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--dark-gray)] mb-1">{job.title}</h3>
            <p className="text-[var(--purple-primary)] font-medium mb-1">{job.company}</p>
            <p className="text-gray-500 text-sm">{job.location}</p>
          </div>
          <div className="text-right">
            <Badge variant={job.remote ? "default" : "secondary"} className="mb-2">
              {job.remote ? 'Remote OK' : 'On-site'}
            </Badge>
            {job.salary && (
              <p className="text-sm font-bold text-[var(--dark-gray)]">{job.salary}</p>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500">{formatTimeAgo(job.createdAt)}</span>
            <span className="text-xs text-[var(--orange-accent)] font-semibold">
              Referral: ${job.referralFee}
            </span>
          </div>
          <Button
            onClick={handleApplyForReferral}
            className="bg-[var(--purple-primary)] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[var(--purple-primary)]/90 transition-all duration-300 transform hover:scale-105"
          >
            Apply for Referral
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
