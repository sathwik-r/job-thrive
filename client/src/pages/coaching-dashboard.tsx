import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MentorCard from '@/components/mentor-card';
import SearchFilters from '@/components/search-filters';
import BookingModal from '@/components/booking-modal';
import RequestsPanel from '@/components/requests-panel';
import {
  Search,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import type { Mentor } from '@/components/mentor-card';
import type { FilterOptions } from '@/components/search-filters';
import type { BookingData } from '@/components/booking-modal';
import type { SessionRequest } from '@/components/requests-panel';
import React, { useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/app-layout';

export default function CoachingDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'browse' | 'requests'>('browse');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    company: '',
    role: '',
    experience: [0, 20],
    expertise: [],
    availability: '',
    priceRange: [0, 500],
  });
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Data state
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SessionRequest[]>(
    []
  );
  const [incomingRequests, setIncomingRequests] = useState<SessionRequest[]>(
    []
  );

  // Loading states
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  const fetchMentors = useCallback(async () => {
    setIsLoadingMentors(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (filters.search) params.set('search', filters.search);
      if (filters.company) params.set('company', filters.company);
      if (filters.experience?.length) params.set('minExperience', String(filters.experience[0]));
      if (filters.expertise.length) params.set('skills', filters.expertise.join(','));
      const response = await apiRequest('GET', `/api/mentors?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
      
        const mapped: Mentor[] = (data.items || []).map((u: any) => 
          {
          let yoe = 0
          if (u.workExperience == '0-1') {
            yoe = 0;
          } else if (u.workExperience == '1-3') {
            yoe = 1;
          } else if (u.workExperience == '3-5') {
            yoe = 3;
          } else if (u.workExperience == '5-8') {
            yoe = 5;
          } else if (u.workExperience == '8-12') {
            yoe = 8;
          } else if (u.workExperience == '12+') {
            yoe = 12;
          }
          return {
            id: String(u.id),
            name: u.name,
            title: u.position || 'Mentor',
            company: u.company || '—',
            location: u.location || '—',
            experience: Number(yoe) || 0,
            rating: Number(u.rating || 0),
            reviews: u.sessions || 0,
            expertise: Array.isArray(u.skills) ? u.skills : [],
            avatar: u.photoUrl || '',
            availability: 'available',
            pricePerHour: 499,
            bio:  '—',
          };
        });
        console.log("mapped", mapped);
        setMentors(mapped);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mentors. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMentors(false);
    }
  }, [page, pageSize, filters.search, filters.company, filters.experience, filters.expertise]);

  // initial load
  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // re-fetch on filter/page changes
  useEffect(() => {
    fetchMentors();
  }, [page, filters.search, filters.company, filters.experience, filters.expertise, fetchMentors]);

  // Fetch session requests data function
  const fetchRequests = async () => {
    if (!user?.id) return;

    setIsLoadingRequests(true);
    try {
      const response = await apiRequest('POST', '/api/coaching/get-requests');
      if (response.ok) {
        const data = await response.json();
        setOutgoingRequests(data.menteeRequests || []);
        setIncomingRequests(data.mentorRequests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session requests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Fetch session requests data on component mount
  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await apiRequest(
        'POST',
        '/api/coaching/update-request/' + requestId,
        {
          status: 'accepted',
        }
      );
      if (response.ok) {
        toast({
          title: 'Request Accepted',
          description: 'Request has been accepted successfully.',
        });
        fetchRequests();
      } else {
        throw new Error('Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const response = await apiRequest(
        'POST',
        '/api/coaching/update-request/' + requestId,
        {
          status: 'declined',
        }
      );
      if (response.ok) {
        toast({
          title: 'Request Declined',
          description: 'Request has been declined successfully.',
        });
        fetchRequests();
      } else {
        throw new Error('Failed to decline request');
      }
    } catch (error) {
      console.error('Error declining request:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const response = await apiRequest(
        'POST',
        '/api/coaching/update-request/' + requestId,
        {
          status: 'cancelled',
        }
      );
      if (response.ok) {
        toast({
          title: 'Request Cancelled',
          description: 'Request has been cancelled successfully.',
        });
        fetchRequests();
      } else {
        throw new Error('Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMessageMentor = (mentorId: string) => {
    console.log('Message mentor:', mentorId);
  };

  const handleBookSession = async (bookingData: BookingData) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'Please log in to book a session.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const request = {
        mentorId: parseInt(bookingData.mentorId),
        menteeId: user.id,
        sessionType: bookingData.sessionType,
        startTime: bookingData.date.toISOString(),
        duration: bookingData.duration,
        cost: 499,
      };

      const response = await apiRequest(
        'POST',
        '/api/coaching/create-request',
        request
      );
      if (response.ok) {
        toast({
          title: 'Session Booked',
          description: 'Session has been booked successfully.',
        });
        // Refresh requests data
        fetchRequests();
      } else {
        throw new Error('Failed to book session');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: 'Error',
        description: 'Failed to book session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch =
      filters.search === '' ||
      mentor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      mentor.company.toLowerCase().includes(filters.search.toLowerCase()) ||
      mentor.expertise.some(skill =>
        skill.toLowerCase().includes(filters.search.toLowerCase())
      );

    const matchesCompany =
      filters.company === '' || mentor.company === filters.company;
    const matchesRole =
      filters.role === '' || mentor.title.includes(filters.role);
    const matchesExperience =
      mentor.experience >= filters.experience[0] &&
      mentor.experience <= filters.experience[1];
    const matchesExpertise =
      filters.expertise.length === 0 ||
      filters.expertise.some(skill => mentor.expertise.includes(skill));
    const matchesAvailability =
      filters.availability === '' ||
      mentor.availability === filters.availability;

    return (
      matchesSearch &&
      matchesCompany &&
      matchesRole &&
      matchesExperience &&
      matchesExpertise &&
      matchesAvailability
    );
  });

  const handleBookSessionClick = (mentorId: string) => {
    console.log('Book session for mentor:', mentorId);
    const mentor = mentors.find(m => m.id === mentorId);
    if (mentor) {
      setSelectedMentor(mentor as Mentor);
      setIsBookingModalOpen(true);
    }
  };

  const handleViewProfile = (mentorId: string) => {
    console.log('View profile for mentor:', mentorId);
    // In a real app, this would navigate to the mentor's detailed profile page
  };

  const handleBookingConfirm = (bookingData: BookingData) => {
    handleBookSession(bookingData);
    setIsBookingModalOpen(false);
    setSelectedMentor(null);
  };

  const statsCards = [
    {
      title: 'Available Mentors',
      value: mentors
        .filter(m => m.availability === 'available')
        .length.toString(),
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Upcoming Sessions',
      value: outgoingRequests
        .filter(r => r.status === 'accepted')
        .length.toString(),
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Pending Requests',
      value: (
        outgoingRequests.filter(r => r.status === 'pending').length +
        incomingRequests.filter(r => r.status === 'pending').length
      ).toString(),
      icon: MessageSquare,
      color: 'text-yellow-600',
    },
    {
      title: 'Success Rate',
      value: '94%',
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-6" data-testid="dashboard-coaching">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight" data-testid="text-dashboard-title">1v1 Coaching</h1>
            <p className="text-sm text-[#525252]">Personalized career guidance from top professionals</p>
          </div>
          <div className="flex gap-1.5 bg-[#1C1C1C]/80 rounded-xl p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('browse')}
              className={`rounded-[10px] text-xs font-semibold px-4 transition-all ${
                activeView === 'browse'
                  ? 'bg-[#818CF8] text-white shadow-sm hover:bg-[#818CF8]'
                  : 'text-[#525252] hover:text-[#A3A3A3]'
              }`}
              data-testid="button-browse-mentors"
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Browse Mentors
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('requests')}
              className={`rounded-[10px] text-xs font-semibold px-4 transition-all ${
                activeView === 'requests'
                  ? 'bg-[#818CF8] text-white shadow-sm hover:bg-[#818CF8]'
                  : 'text-[#525252] hover:text-[#A3A3A3]'
              }`}
              data-testid="button-manage-requests"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              My Sessions
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map(stat => (
            <Card key={stat.title} className="modern-card stat-card border-0 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-[#525252] font-medium uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p
                      className="text-2xl font-extrabold mt-1 text-[#F5F5F5]"
                      data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#141414] flex items-center justify-center">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        {activeView === 'browse' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <SearchFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Mentors Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <p
                  className="text-sm text-[#525252]"
                  data-testid="text-results-count"
                >
                  {filteredMentors.length} mentors found
                </p>
                <Badge variant="outline" className="text-xs">
                  Sorted by relevance
                </Badge>
              </div>

              {isLoadingMentors ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="modern-card border-0 animate-pulse">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex gap-3">
                          <div className="w-11 h-11 rounded-full bg-[#242424]" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-[#242424] rounded w-3/4" />
                            <div className="h-3 bg-[#1C1C1C] rounded w-1/2" />
                          </div>
                        </div>
                        <div className="h-3 bg-[#1C1C1C] rounded w-full" />
                        <div className="flex gap-1">
                          <div className="h-5 bg-[#1C1C1C] rounded-full w-14" />
                          <div className="h-5 bg-[#1C1C1C] rounded-full w-16" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <div className="h-8 bg-[#1C1C1C] rounded-lg flex-1" />
                          <div className="h-8 bg-[#242424] rounded-lg flex-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMentors.map(mentor => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor as Mentor}
                      onBookSession={handleBookSessionClick}
                      onViewProfile={handleViewProfile}
                    />
                  ))}
                </div>
              )}

              {!isLoadingMentors && filteredMentors.length === 0 && (
                <Card className="modern-card border-0">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1C1C1C] flex items-center justify-center">
                      <Search className="h-7 w-7 text-[#525252]" />
                    </div>
                    <h3 className="font-semibold text-[#F5F5F5] mb-1">No mentors found</h3>
                    <p className="text-sm text-[#525252] mb-5">
                      Try adjusting your filters or search terms
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() =>
                        setFilters({
                          search: '',
                          company: '',
                          role: '',
                          experience: [0, 20],
                          expertise: [],
                          availability: '',
                          priceRange: [0, 500],
                        })
                      }
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {isLoadingRequests ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-[#525252]">
                    Loading session requests...
                  </p>
                </CardContent>
              </Card>
            ) : (
              <RequestsPanel
                outgoingRequests={outgoingRequests}
                incomingRequests={incomingRequests}
                onAcceptRequest={handleAcceptRequest}
                onDeclineRequest={handleDeclineRequest}
                onCancelRequest={handleCancelRequest}
                onMessageMentor={handleMessageMentor}
              />
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        mentor={selectedMentor}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedMentor(null);
        }}
        onBookSession={handleBookingConfirm}
      />
      </div>
    </AppLayout>
  );
}
