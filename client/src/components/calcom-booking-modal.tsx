import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Clock, Video, MapPin } from 'lucide-react';
import { format, addDays, isSameDay, isAfter, isBefore } from 'date-fns';
import { cn } from '../lib/utils';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

interface Mentor {
  id: number;
  name: string;
  email: string;
  company?: string;
  position?: string;
  photoUrl?: string;
}

interface CalComBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
  onBookingSuccess?: (bookingData: any) => void;
}

const SESSION_TYPES = [
  { value: 'career-advice', label: 'Career Advice', duration: 30, price: 500 },
  { value: 'mock-interview', label: 'Mock Interview', duration: 60, price: 1000 },
  { value: 'technical-review', label: 'Technical Review', duration: 45, price: 750 },
  { value: 'project-guidance', label: 'Project Guidance', duration: 60, price: 1000 },
];

export function CalComBookingModal({ isOpen, onClose, mentor, onBookingSuccess }: CalComBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [menteeName, setMenteeName] = useState('');
  const [menteeEmail, setMenteeEmail] = useState('');
  const { toast } = useToast();

  // Get session type details
  const sessionTypeDetails = SESSION_TYPES.find(type => type.value === selectedSessionType);

  // Fetch availability when date is selected
  useEffect(() => {
    if (selectedDate && mentor.id) {
      fetchAvailability();
    }
  }, [selectedDate, mentor.id]);

  const fetchAvailability = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const dateFrom = format(selectedDate, 'yyyy-MM-dd');
      const dateTo = format(addDays(selectedDate, 1), 'yyyy-MM-dd');

      const response = await apiRequest(
        'GET',
        `/api/calcom/mentor/${mentor.id}/availability?dateFrom=${dateFrom}&dateTo=${dateTo}`
      );

      if (response.ok) {
        const data = await response.json();
        // Filter slots for the selected date
        const daySlots = data.filter((slot: AvailabilitySlot) => 
          isSameDay(new Date(slot.start), selectedDate) && slot.available
        );
        setAvailability(daySlots);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch availability",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to fetch availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !selectedSessionType || !menteeName || !menteeEmail) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);
    try {
      const response = await apiRequest('POST', '/api/calcom/create-booking', {
        mentorId: mentor.id,
        sessionType: selectedSessionType,
        startTime: selectedSlot.start,
        duration: sessionTypeDetails?.duration || 30,
        menteeEmail,
        menteeName,
      });

      if (response.ok) {
        const bookingData = await response.json();
        toast({
          title: "Success",
          description: "Booking created successfully! You'll receive a confirmation email shortly.",
        });
        onBookingSuccess?.(bookingData);
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create booking",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSelectedSessionType('');
    setMenteeName('');
    setMenteeEmail('');
    setAvailability([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Filter out past dates
  const isDateDisabled = (date: Date) => {
    return isBefore(date, new Date());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Session with {mentor.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="session-type">Session Type</Label>
            <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {type.duration}min - ₹{type.price}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              {loading ? (
                <div className="text-center py-4">Loading availability...</div>
              ) : availability.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {availability.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedSlot === slot ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {format(new Date(slot.start), "HH:mm")} - {format(new Date(slot.end), "HH:mm")}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No available slots for this date
                </div>
              )}
            </div>
          )}

          {/* Mentee Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mentee-name">Your Name *</Label>
              <Input
                id="mentee-name"
                value={menteeName}
                onChange={(e) => setMenteeName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentee-email">Your Email *</Label>
              <Input
                id="mentee-email"
                type="email"
                value={menteeEmail}
                onChange={(e) => setMenteeEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Session Details Summary */}
          {selectedSlot && sessionTypeDetails && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Session Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Video className="mr-2 h-4 w-4" />
                  <span>{sessionTypeDetails.label}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>{format(new Date(selectedSlot.start), "PPP 'at' HH:mm")}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{sessionTypeDetails.duration} minutes</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>Online (Zoom/Meet)</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost:</span>
                  <span className="font-bold">₹{sessionTypeDetails.price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={!selectedSlot || !selectedSessionType || !menteeName || !menteeEmail || bookingLoading}
            >
              {bookingLoading ? "Booking..." : "Book Session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
