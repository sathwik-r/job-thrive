import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Star, MapPin, Briefcase } from "lucide-react";
import type { Mentor } from "@/components/mentor-card";
import React from "react";

interface BookingModalProps {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
  onBookSession: (bookingData: BookingData) => void;
}

export interface BookingData {
  mentorId: string;
  date: Date;
  duration: number;
  timeSlot: string;
  sessionType: string;
  objectives: string;
}

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

const sessionTypes = [
  { value: 'career-advice', label: 'Career Advice', duration: 30 },
  { value: 'technical-review', label: 'Technical Review', duration: 45 },
  { value: 'mock-interview', label: 'Mock Interview', duration: 60 },
  { value: 'project-guidance', label: 'Project Guidance', duration: 60 }
];

export default function BookingModal({ mentor, isOpen, onClose, onBookSession }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('');
  const [objectives, setObjectives] = useState<string>('');

  const handleBooking = () => {
    if (!mentor || !selectedDate || !selectedTime || !sessionType) return;

    const selectedSessionType = sessionTypes.find(t => t.value === sessionType);
    
    const bookingData: BookingData = {
      mentorId: mentor.id,
      date: selectedDate,
      duration: selectedSessionType?.duration || 30,
      timeSlot: selectedTime,
      sessionType,
      objectives
    };

    onBookSession(bookingData);
    
    // Reset form
    setSelectedDate(undefined);
    setSelectedTime('');
    setSessionType('');
    setObjectives('');
    onClose();
  };

  const selectedSessionTypeData = sessionTypes.find(t => t.value === sessionType);
  const estimatedCost = selectedSessionTypeData && mentor?.pricePerHour 
    ? Math.round((mentor.pricePerHour * selectedSessionTypeData.duration) / 60)
    : 0;

  if (!mentor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-booking">
        <DialogHeader>
          <DialogTitle>Book a Session</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mentor Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{mentor.name}</h3>
                    <p className="text-muted-foreground">{mentor.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{mentor.company}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{mentor.location}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{mentor.rating}</span>
                  <span className="text-muted-foreground">({mentor.reviews} reviews)</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {mentor.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">{mentor.bio}</p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="space-y-4">
            {/* Session Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Session Type</label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger data-testid="select-session-type">
                  <SelectValue placeholder="Choose session type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex justify-between items-center w-full">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {type.duration} min
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                className="rounded-md border"
                data-testid="calendar-booking"
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="text-sm font-medium mb-2 block">Available Times</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      data-testid={`button-time-${time.replace(/[:\s]/g, '-').toLowerCase()}`}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Session Objectives */}
            <div>
              <label className="text-sm font-medium mb-2 block">Session Objectives (Optional)</label>
              <Textarea
                placeholder="What would you like to discuss or achieve in this session?"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                className="min-h-[80px]"
                data-testid="textarea-objectives"
              />
            </div>

            {/* Cost Summary */}
            {selectedSessionTypeData && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{selectedSessionTypeData.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">${estimatedCost}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Policy Links */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                By booking this session, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                  Terms & Conditions
                </a>
                ,{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </a>
                , and{' '}
                <a href="/refund" className="text-blue-600 hover:text-blue-800 underline">
                  Refund Policy
                </a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-booking">
                Cancel
              </Button>
              <Button 
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || !sessionType}
                className="flex-1"
                data-testid="button-confirm-booking"
              >
                Book Session
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}