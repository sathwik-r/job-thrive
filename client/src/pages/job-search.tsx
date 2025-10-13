import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import JobCard from '@/components/job-card';
import { type Job } from '@shared/schema';
import React from 'react';

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

  const items = (data && Array.isArray((data as any).items)) ? (data as any).items as Job[] : [];
  const total = (data as any)?.total ?? items.length;
  const pageSize = (data as any)?.pageSize ?? items.length;
  const totalPages = (data as any)?.totalPages ?? 1;

  const filteredJobs = Array.isArray(items) ? items.filter((job: Job) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-[var(--purple-primary)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--dark-gray)]">Find Your Dream Job</h2>
          
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by title or company"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-[var(--purple-primary)] text-white hover:bg-[var(--purple-primary)]/90'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="p-6 space-y-4 pb-20">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--purple-primary)] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading jobs...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {total} {total === 1 ? 'job' : 'jobs'} found
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  Next
                </Button>
              </div>
            </div>
            {filteredJobs.map((job: Job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 
                `No jobs match "${searchQuery}" with the current filters.` : 
                'No jobs available with the current filters.'
              }
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All Jobs');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
