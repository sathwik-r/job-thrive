import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Clock, User, Video, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

interface Booking {
  id: number;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    email: string;
    name: string;
  }>;
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
  location?: string;
  metadata?: {
    mentorId?: number;
    menteeId?: number;
    sessionType?: string;
    platform?: string;
  };
}

interface MentorScheduleProps {
  mentorId: number;
}

export function MentorSchedule({ mentorId }: MentorScheduleProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [isProvisioned, setIsProvisioned] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    checkProvisioningStatus();
  }, [mentorId]);

  const checkProvisioningStatus = async () => {
    try {
      // Check if mentor is provisioned by trying to fetch bookings
      const response = await apiRequest('GET', `/api/calcom/mentor/${mentorId}/bookings`);

      if (response.ok) {
        setIsProvisioned(true);
      } else if (response.status === 400) {
        setIsProvisioned(false);
      }
    } catch (error) {
      console.error('Error checking provisioning status:', error);
      setIsProvisioned(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/calcom/mentor/${mentorId}/bookings`);

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const provisionMentor = async () => {
    setProvisioning(true);
    try {
      const response = await apiRequest('POST', '/api/calcom/provision-mentor');

      if (response.ok) {
        const result = await response.json();
        setIsProvisioned(true);
        toast({
          title: "Success",
          description: "Your Cal.com account has been set up successfully!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to set up Cal.com account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error provisioning mentor:', error);
      toast({
        title: "Error",
        description: "Failed to set up Cal.com account",
        variant: "destructive",
      });
    } finally {
      setProvisioning(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      const response = await apiRequest('POST', `/api/calcom/booking/${bookingId}/cancel`, {
        reason: 'Cancelled by mentor',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        });
        fetchBookings(); // Refresh bookings
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to cancel booking",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSessionTypeLabel = (sessionType: string) => {
    switch (sessionType) {
      case 'career-advice':
        return 'Career Advice';
      case 'mock-interview':
        return 'Mock Interview';
      case 'technical-review':
        return 'Technical Review';
      case 'project-guidance':
        return 'Project Guidance';
      default:
        return sessionType;
    }
  };

  const upcomingBookings = bookings.filter(booking => 
    isFuture(new Date(booking.startTime)) && booking.status === 'ACCEPTED'
  );

  const pastBookings = bookings.filter(booking => 
    isPast(new Date(booking.startTime))
  );

  const pendingBookings = bookings.filter(booking => 
    booking.status === 'PENDING'
  );

  if (!isProvisioned) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Mentor Schedule Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <p>Set up your Cal.com integration to start accepting bookings</p>
              <p className="text-sm mt-2">This will create your scheduling profile and allow mentees to book sessions with you.</p>
            </div>
            <Button 
              onClick={provisionMentor} 
              disabled={provisioning}
              className="mt-4"
            >
              {provisioning ? 'Setting up...' : 'Set Up Cal.com Integration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            My Schedule
          </div>
          <Button variant="outline" size="sm" onClick={fetchBookings}>
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading bookings...</div>
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{booking.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(booking.startTime), "PPP 'at' HH:mm")}
                        <Clock className="ml-2 mr-1 h-4 w-4" />
                        {format(new Date(booking.endTime), "HH:mm")}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-1 h-4 w-4" />
                        {booking.attendees[0]?.name} ({booking.attendees[0]?.email})
                      </div>
                      {booking.metadata?.sessionType && (
                        <Badge variant="outline">
                          {getSessionTypeLabel(booking.metadata.sessionType)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(booking.status)}
                      {booking.location && (
                        <Button variant="outline" size="sm">
                          <Video className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming bookings
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading bookings...</div>
            ) : pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{booking.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(booking.startTime), "PPP 'at' HH:mm")}
                        <Clock className="ml-2 mr-1 h-4 w-4" />
                        {format(new Date(booking.endTime), "HH:mm")}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-1 h-4 w-4" />
                        {booking.attendees[0]?.name} ({booking.attendees[0]?.email})
                      </div>
                      {booking.metadata?.sessionType && (
                        <Badge variant="outline">
                          {getSessionTypeLabel(booking.metadata.sessionType)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(booking.status)}
                      <Button variant="outline" size="sm">
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No pending bookings
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading bookings...</div>
            ) : pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{booking.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(booking.startTime), "PPP 'at' HH:mm")}
                        <Clock className="ml-2 mr-1 h-4 w-4" />
                        {format(new Date(booking.endTime), "HH:mm")}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-1 h-4 w-4" />
                        {booking.attendees[0]?.name} ({booking.attendees[0]?.email})
                      </div>
                      {booking.metadata?.sessionType && (
                        <Badge variant="outline">
                          {getSessionTypeLabel(booking.metadata.sessionType)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No past bookings
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
