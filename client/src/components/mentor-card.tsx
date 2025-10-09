import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, Clock, Star } from "lucide-react";
import React, { useState } from "react";
import { CalComBookingModal } from "./calcom-booking-modal";

export interface Mentor {
  id: number;
  name: string;
  email: string;
  company?: string;
  position?: string;
  photoUrl?: string;
  rating?: number;
  sessions?: number;
  skills?: string[];
  workExperience?: string;
  department?: string;
}

interface MentorCardProps {
  mentor: Mentor;
  onViewProfile?: (mentorId: number) => void;
}

export default function MentorCard({ mentor, onViewProfile }: MentorCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookSession = () => {
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (bookingData: any) => {
    console.log('Booking successful:', bookingData);
    // You can add additional logic here, like showing a success message
  };

  return (
    <>
      <Card className="hover-elevate" data-testid={`card-mentor-${mentor.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mentor.photoUrl} alt={mentor.name} />
                <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate" data-testid={`text-mentor-name-${mentor.id}`}>
                {mentor.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate" data-testid={`text-mentor-title-${mentor.id}`}>
                {mentor.position}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Briefcase className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">{mentor.company}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-3 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{mentor.department}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{mentor.workExperience}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{mentor.rating || 0}</span>
              <span className="text-xs text-muted-foreground">({mentor.sessions || 0} sessions)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {mentor.skills?.slice(0, 2).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {mentor.skills && mentor.skills.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.skills.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 gap-2">
          {onViewProfile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewProfile(mentor.id)}
              className="flex-1"
              data-testid={`button-view-profile-${mentor.id}`}
            >
              View Profile
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={handleBookSession}
            className="flex-1"
            data-testid={`button-book-session-${mentor.id}`}
          >
            Book Session
          </Button>
        </CardFooter>
      </Card>

      <CalComBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        mentor={mentor}
        onBookingSuccess={handleBookingSuccess}
      />
    </>
  );
}