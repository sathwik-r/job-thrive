import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { ArrowLeft, Search, Filter, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import JobCard from '@/components/job-card';
import { type Job } from '@shared/schema';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function SkeletonCard() {
  return (
    <div className="bg-[#1A1828] border border-[#252336] rounded-xl p-6 space-y-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#211F30]" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-[#211F30] rounded-lg w-3/5" />
          <div className="h-4 bg-[#211F30] rounded-lg w-2/5" />
          <div className="h-3 bg-[#211F30] rounded-lg w-1/4" />
        </div>
        <div className="h-6 w-16 bg-[#211F30] rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[#211F30] rounded-lg w-full" />
        <div className="h-3 bg-[#211F30] rounded-lg w-4/5" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="h-3 bg-[#211F30] rounded-lg w-24" />
        <div className="h-10 bg-[#211F30] rounded-xl w-36" />
      </div>
    </div>
  );
}

export default function JobSearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Jobs');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/jobs', searchQuery, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());

      const response = await apiRequest('GET', `/api/jobs?${params.toString()}`);
      return response.json();
    },
  });

  const filters = ['All Jobs', 'Tech', 'Finance', 'Remote'];

  const items_data = (data && Array.isArray((data as any).items)) ? (data as any).items as Job[] : [];
  const total = (data as any)?.total ?? items_data.length;
  const pageSize = (data as any)?.pageSize ?? items_data.length;
  const totalPages = (data as any)?.totalPages ?? 1;

  const filteredJobs = Array.isArray(items_data) ? items_data.filter((job: Job) => {
    if (activeFilter === 'All Jobs') return true;
    if (activeFilter === 'Tech') return ['engineer', 'developer', 'tech', 'software'].some(keyword =>
      job.title.toLowerCase().includes(keyword) || job.description.toLowerCase().includes(keyword)
    );
    if (activeFilter === 'Finance') return ['finance', 'financial', 'analyst', 'accounting'].some(keyword =>
      job.title.toLowerCase().includes(keyword) || job.description.toLowerCase().includes(keyword)
    );
    if (activeFilter === 'Remote') return job.remote;
    return true;
  }) : [];

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getCompanyLogoUrl = (company: string) => {
    const domain = company.toLowerCase().replace(/\s+/g, '');
    return `https://logo.clearbit.com/${domain}.com`;
  };

  return (
    <div className="min-h-screen bg-[#0B0A10]">
      {/* Header */}
      <div className="bg-[#13121D]/80 backdrop-blur-lg border-b border-[#252336] px-6 py-5 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/dashboard')}
              className="flex items-center space-x-2 text-[#5C5A72] hover:text-[#A1A0B3] -ml-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Button>
          </div>

          <div>
            <h2 className="text-3xl font-[900] text-[#FAFAFA] tracking-tight">
              Find Jobs
            </h2>
            <p className="text-[#5C5A72] mt-1 text-sm uppercase tracking-wide">Discover opportunities with referral bonuses</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C5A72] pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by title, company, or keyword..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-[#1A1828] border border-[#252336] rounded-xl h-12 pl-12 pr-6 text-[#FAFAFA] text-base placeholder:text-[#5C5A72] focus:outline-none focus:ring-2 focus:ring-[#6D5BF7]/30 focus:border-[#6D5BF7]/40 transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeFilter === filter
                    ? 'text-white shadow-md'
                    : 'bg-[#1A1828] text-[#5C5A72] hover:text-[#A1A0B3] border border-[#252336]'
                }`}
                style={activeFilter === filter ? { background: 'linear-gradient(135deg, #6D5BF7, #1DB954)' } : undefined}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-3xl mx-auto p-6 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <>
            {/* Results header & pagination */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#5C5A72]">
                <span className="font-semibold text-[#A1A0B3]">{total}</span> {total === 1 ? 'job' : 'jobs'} found
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-lg text-[#5C5A72] hover:text-[#A1A0B3] hover:bg-[#1A1828] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-[#5C5A72] min-w-[80px] text-center">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg text-[#5C5A72] hover:text-[#A1A0B3] hover:bg-[#1A1828] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <motion.div
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
              key={`${searchQuery}-${page}-${activeFilter}`}
            >
              {filteredJobs.map((job: Job) => (
                <motion.div key={job.id} variants={item}>
                  <JobCard job={job} />
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#5C5A72] hover:text-[#A1A0B3] hover:bg-[#1A1828] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                        page === pageNum
                          ? 'text-white shadow-md'
                          : 'text-[#5C5A72] hover:bg-[#1A1828] hover:text-[#A1A0B3]'
                      }`}
                      style={page === pageNum ? { background: 'linear-gradient(135deg, #6D5BF7, #1DB954)' } : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#5C5A72] hover:text-[#A1A0B3] hover:bg-[#1A1828] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto bg-[#1A1828] border border-[#252336] rounded-2xl flex items-center justify-center mb-6">
              <Briefcase className="w-9 h-9 text-[#5C5A72]" />
            </div>
            <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">No jobs found</h3>
            <p className="text-[#5C5A72] mb-6 max-w-sm mx-auto leading-relaxed">
              {searchQuery ?
                `We couldn't find any jobs matching "${searchQuery}" with your current filters.` :
                'No jobs available with the current filters. Try broadening your search.'
              }
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All Jobs');
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-[#6D5BF7] bg-[#6D5BF7]/10 hover:bg-[#6D5BF7]/20 border border-[#6D5BF7]/20 transition-colors duration-200"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
