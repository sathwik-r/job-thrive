import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { ArrowLeft, Search, X } from 'lucide-react';
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
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <button onClick={() => setLocation('/dashboard')} className="flex items-center gap-1.5 text-xs font-medium mb-4" style={{ color: '#525252' }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="text-2xl font-black" style={{ color: '#F5F5F5' }}>Find Jobs</h1>
          <p className="text-sm mt-1" style={{ color: '#525252' }}>{total} opportunities available</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#525252' }} />
          <input type="text" placeholder="Search by title, company, or skill..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-10 rounded-xl text-sm font-medium outline-none transition-colors"
            style={{ background: '#141414', border: '1px solid #1F1F1F', color: '#F5F5F5' }}
            onFocus={(e) => (e.target.style.borderColor = '#A3E635')} onBlur={(e) => (e.target.style.borderColor = '#1F1F1F')} />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#525252' }}><X className="w-4 h-4" /></button>}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className="px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
              style={{ background: activeFilter === f ? '#A3E635' : '#1C1C1C', color: activeFilter === f ? '#0C0C0C' : '#525252', border: `1px solid ${activeFilter === f ? '#A3E635' : '#1F1F1F'}` }}>
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: '#1C1C1C', border: '1px solid #1F1F1F' }}>
              <div className="flex gap-3"><div className="w-10 h-10 rounded-lg" style={{ background: '#242424' }} /><div className="flex-1 space-y-2"><div className="h-4 rounded w-3/4" style={{ background: '#242424' }} /><div className="h-3 rounded w-1/2" style={{ background: '#1F1F1F' }} /></div></div>
            </div>
          ))}</div>
        ) : filteredJobs.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {filteredJobs.map((job: Job, i: number) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <JobCard job={job} />
              </motion.div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30" style={{ background: '#1C1C1C', border: '1px solid #1F1F1F', color: '#A3A3A3' }}>Prev</button>
                <span className="text-xs font-medium" style={{ color: '#525252' }}>{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30" style={{ background: '#1C1C1C', border: '1px solid #1F1F1F', color: '#A3A3A3' }}>Next</button>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="rounded-xl p-12 text-center" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#1C1C1C' }}><Search className="w-6 h-6" style={{ color: '#525252' }} /></div>
            <p className="text-sm font-bold mb-1" style={{ color: '#F5F5F5' }}>No jobs found</p>
            <p className="text-xs mb-4" style={{ color: '#525252' }}>Try different search terms</p>
            <button onClick={() => { setSearchQuery(''); setActiveFilter('All'); }} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: '#1C1C1C', border: '1px solid #1F1F1F', color: '#A3E635' }}>Clear filters</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
