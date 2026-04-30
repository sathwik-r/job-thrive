import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { Search, X, Briefcase, TrendingUp, Zap } from 'lucide-react';
import JobCard from '@/components/job-card';
import AppLayout from '@/components/app-layout';
import { type Job } from '@shared/schema';
import { motion } from 'framer-motion';
import React from 'react';

export default function JobSearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/jobs', searchQuery, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      return (await apiRequest('GET', `/api/jobs?${params.toString()}`)).json();
    },
  });

  const filters = ['All', 'Tech', 'Finance', 'Remote'];
  const items = (data && Array.isArray((data as any).items)) ? (data as any).items as Job[] : [];
  const total = (data as any)?.total ?? 0;
  const totalPages = (data as any)?.totalPages ?? 1;

  const filteredJobs = items.filter((job: Job) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Tech') return ['engineer', 'developer', 'tech', 'software', 'data'].some(k => job.title.toLowerCase().includes(k) || job.description.toLowerCase().includes(k));
    if (activeFilter === 'Finance') return ['finance', 'financial', 'analyst'].some(k => job.title.toLowerCase().includes(k) || job.description.toLowerCase().includes(k));
    if (activeFilter === 'Remote') return job.remote;
    return true;
  });

  useEffect(() => { setPage(1); }, [searchQuery]);

  return (
    <AppLayout>
      {/* Ambient */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.02) 0%, transparent 70%)' }} />

      <div className="max-w-3xl mx-auto p-4 md:p-6 relative">
        {/* ── Header ──────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#F5F5F5' }}>Find Jobs</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#A3E635' }} />
              <span className="text-xs font-bold" style={{ color: '#A3E635' }}>{total} live</span>
            </div>
          </div>
          <p className="text-sm" style={{ color: '#525252' }}>Browse opportunities and get referred for Rs.499</p>
        </div>

        {/* ── Search ──────────────────────── */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: '#525252' }} />
          <input type="text" placeholder="Search by title, company, or skill..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-10 rounded-xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#A3E635]/20"
            style={{ background: '#141414', border: '1px solid #1F1F1F', color: '#F5F5F5' }}
            onFocus={(e) => e.target.style.borderColor = '#A3E635'}
            onBlur={(e) => e.target.style.borderColor = '#1F1F1F'} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center"
              style={{ background: '#1C1C1C', color: '#525252' }}><X className="w-3 h-3" /></button>
          )}
        </div>

        {/* ── Filters ─────────────────────── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
              style={{
                background: activeFilter === f ? '#A3E635' : '#141414',
                color: activeFilter === f ? '#0C0C0C' : '#525252',
                border: `1px solid ${activeFilter === f ? '#A3E635' : '#1F1F1F'}`,
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* ── Results ─────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse flex gap-3.5" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
                <div className="w-10 h-10 rounded-lg shrink-0" style={{ background: '#1C1C1C' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded w-3/5" style={{ background: '#1C1C1C' }} />
                  <div className="h-3 rounded w-2/5" style={{ background: '#1C1C1C' }} />
                  <div className="h-3 rounded w-4/5" style={{ background: '#1F1F1F' }} />
                </div>
                <div className="w-20 h-8 rounded-lg shrink-0" style={{ background: '#1C1C1C' }} />
              </div>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {filteredJobs.map((job: Job, i: number) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <JobCard job={job} />
              </motion.div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="h-8 px-3 rounded-lg text-xs font-bold disabled:opacity-30 transition-all"
                  style={{ background: '#141414', border: '1px solid #1F1F1F', color: '#A3A3A3' }}>Prev</button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                      style={{ background: p === page ? '#A3E635' : '#141414', color: p === page ? '#0C0C0C' : '#525252', border: `1px solid ${p === page ? '#A3E635' : '#1F1F1F'}` }}>
                      {p}
                    </button>
                  );
                })}

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="h-8 px-3 rounded-lg text-xs font-bold disabled:opacity-30 transition-all"
                  style={{ background: '#141414', border: '1px solid #1F1F1F', color: '#A3A3A3' }}>Next</button>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="rounded-2xl p-12 text-center relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(163,230,53,0.03) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#1C1C1C' }}>
                <Search className="w-7 h-7" style={{ color: '#525252' }} />
              </div>
              <p className="text-base font-bold mb-1" style={{ color: '#F5F5F5' }}>No jobs found</p>
              <p className="text-sm mb-5" style={{ color: '#525252' }}>Try adjusting your search or filters</p>
              <button onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                style={{ background: '#A3E635', color: '#0C0C0C' }}>
                Show all jobs
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
