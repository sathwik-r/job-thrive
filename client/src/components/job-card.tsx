import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Job } from '@shared/schema';
import { useLocation } from 'wouter';
import React, { useState } from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const [, setLocation] = useLocation();
  const [logoError, setLogoError] = useState(false);

  const handleApplyForReferral = () => {
    setLocation(`/referral-request/${job.id}`);
  };

  const formatTimeAgo = (date: Date | string) => {
    const createdDate = date instanceof Date ? date : new Date(date);
    const now = new Date();

    // Check if date is valid
    if (isNaN(createdDate.getTime())) {
      return 'Recently';
    }

    const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 0) return 'Recently';
    return `${diffInDays} days ago`;
  };

  const companyDomain = job.company.toLowerCase().replace(/\s+/g, '');
  const logoUrl = `https://logo.clearbit.com/${companyDomain}.com`;
  const companyInitial = job.company.charAt(0).toUpperCase();

  return (
    <Card className="group relative overflow-hidden rounded-xl border border-[#252336] bg-[#1A1828] transition-all duration-300 hover:border-[#302D45]">
      {/* Subtle left accent bar - gradient, visible on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(180deg, #6D5BF7, #1DB954)' }}
      />

      <CardContent className="p-6">
        {/* Top row: logo + info + badge */}
        <div className="flex items-start gap-4 mb-4">
          {/* Company logo */}
          <div className="flex-shrink-0">
            {!logoError ? (
              <img
                src={logoUrl}
                alt={`${job.company} logo`}
                className="w-12 h-12 rounded-xl object-contain bg-[#13121D] border border-[#252336] p-1.5"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#211F30] border border-[#252336] flex items-center justify-center">
                <span className="text-lg font-bold text-[#5C5A72]">{companyInitial}</span>
              </div>
            )}
          </div>

          {/* Title & company */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#FAFAFA] leading-snug mb-0.5 truncate">
              {job.title}
            </h3>
            <p className="text-[#6D5BF7] font-medium text-sm">{job.company}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-[#5C5A72]">
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#3F3D52]">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(job.createdAt)}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.remote
                ? 'bg-[#1DB95420] text-[#1DB954]'
                : 'bg-[#252336] text-[#5C5A72]'
            }`}>
              {job.remote ? 'Remote' : 'On-site'}
            </span>
            {job.salary && (
              <span className="text-sm font-bold text-[#A1A0B3]">{job.salary}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[#A1A0B3] text-sm leading-relaxed mb-5 line-clamp-2">
          {job.description}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-4 border-t border-[#252336]">
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-[#FF7262]">
              Rs.{job.referralFee}
            </span>
          </div>
          <Button
            onClick={handleApplyForReferral}
            className="text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center gap-2 border-0"
            style={{ background: 'linear-gradient(135deg, #6D5BF7, #1DB954)' }}
          >
            Apply
            <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
