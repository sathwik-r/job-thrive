import { type Job } from '@shared/schema';
import { useLocation } from 'wouter';
import { MapPin, Clock, ArrowRight, Wifi } from 'lucide-react';
import React, { useState } from 'react';

function getCompanyDomain(company: string): string {
  const c = company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const map: Record<string, string> = {
    google:'google.com', microsoft:'microsoft.com', amazon:'amazon.com', flipkart:'flipkart.com',
    swiggy:'swiggy.com', meta:'meta.com', apple:'apple.com', netflix:'netflix.com',
    uber:'uber.com', zomato:'zomato.com', paytm:'paytm.com', razorpay:'razorpay.com',
    stripe:'stripe.com', atlassian:'atlassian.com', adobe:'adobe.com', salesforce:'salesforce.com',
    oracle:'oracle.com', ibm:'ibm.com', tcs:'tcs.com', infosys:'infosys.com', wipro:'wipro.com',
  };
  return map[c] || `${c}.com`;
}

export default function JobCard({ job }: { job: Job }) {
  const [, setLocation] = useLocation();
  const [logoErr, setLogoErr] = useState(false);

  const timeAgo = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return 'Recently';
    const days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    if (days < 0) return 'Recently';
    return `${days}d ago`;
  };

  return (
    <button
      onClick={() => setLocation(`/referral-request/${job.id}`)}
      className="w-full text-left rounded-xl p-4 flex gap-3.5 group transition-all hover:-translate-y-0.5 relative overflow-hidden"
      style={{ background: '#141414', border: '1px solid #1F1F1F' }}
    >
      {/* Left accent on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#A3E635' }} />

      {/* Company logo */}
      {!logoErr ? (
        <img src={`https://logo.clearbit.com/${getCompanyDomain(job.company)}`} alt=""
          className="w-10 h-10 rounded-lg p-1 shrink-0 mt-0.5" style={{ background: '#1C1C1C', border: '1px solid #1F1F1F' }}
          onError={() => setLogoErr(true)} />
      ) : (
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
          style={{ background: '#1C1C1C', border: '1px solid #1F1F1F', color: '#737373' }}>
          {job.company.charAt(0)}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate" style={{ color: '#F5F5F5' }}>{job.title}</h3>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#818CF8' }}>{job.company}</p>
          </div>
          {/* Apply button */}
          <div className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105"
            style={{ background: '#A3E635', color: '#0C0C0C' }}>
            Get Referred <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="flex items-center gap-1 text-[11px]" style={{ color: '#737373' }}>
            <MapPin className="w-3 h-3" /> {job.location}
          </span>
          {job.remote && (
            <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded" style={{ background: '#A3E63510', color: '#A3E635' }}>
              <Wifi className="w-3 h-3" /> Remote
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px]" style={{ color: '#525252' }}>
            <Clock className="w-3 h-3" /> {timeAgo(job.createdAt)}
          </span>
          {job.salary && <span className="text-[11px] font-medium" style={{ color: '#D4D4D4' }}>{job.salary}</span>}
          <span className="text-[11px] font-bold ml-auto" style={{ color: '#FB923C' }}>Rs.{job.referralFee}</span>
        </div>

        {/* Description preview */}
        <p className="text-xs mt-2 line-clamp-1" style={{ color: '#525252' }}>{job.description}</p>
      </div>
    </button>
  );
}
