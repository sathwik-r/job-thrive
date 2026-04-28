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
    <Card className="modern-card card-hover group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:border-[var(--purple-primary)]/20 hover:shadow-lg hover:shadow-[var(--purple-primary)]/5">
      {/* Accent border on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--purple-primary)] rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="p-6">
        {/* Top row: logo + info + badge */}
        <div className="flex items-start gap-4 mb-4">
          {/* Company logo */}
          <div className="flex-shrink-0">
            {!logoError ? (
              <img
                src={logoUrl}
                alt={`${job.company} logo`}
                className="company-logo w-12 h-12 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1.5"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--purple-primary)]/10 to-[var(--purple-primary)]/5 border border-[var(--purple-primary)]/10 flex items-center justify-center">
                <span className="text-lg font-bold text-[var(--purple-primary)]">{companyInitial}</span>
              </div>
            )}
          </div>

          {/* Title & company */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--dark-gray)] leading-snug mb-0.5 truncate">
              {job.title}
            </h3>
            <p className="text-[var(--purple-primary)] font-medium text-sm">{job.company}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(job.createdAt)}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`pill-badge px-3 py-1 rounded-full text-xs font-medium ${
              job.remote
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-gray-50 text-gray-500 border border-gray-100'
            }`}>
              {job.remote ? 'Remote' : 'On-site'}
            </span>
            {job.salary && (
              <span className="text-sm font-bold text-[var(--dark-gray)]">{job.salary}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">
          {job.description}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center">
            <span className="pill-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--orange-accent)]/10 text-[var(--orange-accent)] border border-[var(--orange-accent)]/15">
              Referral Bonus: ₹{job.referralFee}
            </span>
          </div>
          <Button
            onClick={handleApplyForReferral}
            className="bg-[var(--purple-primary)] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[var(--purple-primary)]/90 transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] shadow-sm hover:shadow-md hover:shadow-[var(--purple-primary)]/20 flex items-center gap-2"
          >
            Apply for Referral
            <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
