import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MentorCard from '@/components/mentor-card';
import SearchFilters from '@/components/search-filters';
import BookingModal from '@/components/booking-modal';
import RequestsPanel from '@/components/requests-panel';
import { MentorSchedule } from '@/components/mentor-schedule';
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

export default function CoachingDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'browse' | 'requests' | 'schedule'>('browse');
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
      
        const mapped: Mentor[] = (data.items || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          company: u.company,
          position: u.position,
          photoUrl: u.photoUrl,
          rating: Number(u.rating || 0),
          sessions: u.sessions || 0,
          skills: Array.isArray(u.skills) ? u.skills : [],
          workExperience: u.workExperience,
          department: u.department,
        }));
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
      (mentor.company && mentor.company.toLowerCase().includes(filters.search.toLowerCase())) ||
      (mentor.skills && mentor.skills.some(skill =>
        skill.toLowerCase().includes(filters.search.toLowerCase())
      ));

    const matchesCompany =
      filters.company === '' || mentor.company === filters.company;
    const matchesRole =
      filters.role === '' || (mentor.position && mentor.position.includes(filters.role));
    const matchesExpertise =
      filters.expertise.length === 0 ||
      (mentor.skills && filters.expertise.some(skill => mentor.skills!.includes(skill)));

    return (
      matchesSearch &&
      matchesCompany &&
      matchesRole &&
      matchesExpertise
    );
  });

  const handleBookSessionClick = (mentorId: number) => {
    console.log('Book session for mentor:', mentorId);
    const mentor = mentors.find(m => m.id === mentorId);
    if (mentor) {
      setSelectedMentor(mentor);
      setIsBookingModalOpen(true);
    }
  };

  const handleViewProfile = (mentorId: number) => {
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
      value: mentors.length.toString(),
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
    <div className="min-h-screen bg-gray-50" data-testid="dashboard-coaching">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1
              className="text-2xl font-bold"
              data-testid="text-dashboard-title"
            >
              1v1 Coaching
            </h1>
            <p className="text-muted-foreground">
              Connect with industry professionals for career guidance
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeView === 'browse' ? 'default' : 'outline'}
              onClick={() => setActiveView('browse')}
              data-testid="button-browse-mentors"
            >
              <Search className="h-4 w-4 mr-2" />
              Browse Mentors
            </Button>
            <Button
              variant={activeView === 'requests' ? 'default' : 'outline'}
              onClick={() => setActiveView('requests')}
              data-testid="button-manage-requests"
            >
              <Calendar className="h-4 w-4 mr-2" />
              My Sessions
            </Button>
            <Button
              variant={activeView === 'schedule' ? 'default' : 'outline'}
              onClick={() => setActiveView('schedule')}
              data-testid="button-manage-schedule"
            >
              <Calendar className="h-4 w-4 mr-2" />
              My Schedule
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map(stat => (
            <Card key={stat.title} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {stat.title}
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
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
                  className="text-sm text-muted-foreground"
                  data-testid="text-results-count"
                >
                  {filteredMentors.length} mentors found
                </p>
                <Badge variant="outline" className="text-xs">
                  Sorted by relevance
                </Badge>
              </div>

              {isLoadingMentors ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading mentors...</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMentors.map(mentor => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor}
                      onViewProfile={handleViewProfile}
                    />
                  ))}
                </div>
              )}

              {!isLoadingMentors && filteredMentors.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No mentors found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try adjusting your filters or search terms
                    </p>
                    <Button
                      variant="outline"
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
        ) : activeView === 'requests' ? (
          <div className="max-w-2xl mx-auto">
            {isLoadingRequests ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">
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
        ) : (
          <div className="max-w-4xl mx-auto">
            {user?.id && <MentorSchedule mentorId={user.id} />}
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
  );
}
