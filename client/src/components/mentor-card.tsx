import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, Clock, Star } from "lucide-react";
import React from "react";

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  experience: number;
  rating: number;
  reviews: number;
  expertise: string[];
  avatar: string;
  availability: 'available' | 'busy' | 'offline';
  pricePerHour?: number;
  bio: string;
}

interface MentorCardProps {
  mentor: Mentor;
  onBookSession: (mentorId: string) => void;
  onViewProfile: (mentorId: string) => void;
}

export default function MentorCard({ mentor, onBookSession, onViewProfile }: MentorCardProps) {
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-mentor-${mentor.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getAvailabilityColor(mentor.availability)}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate" data-testid={`text-mentor-name-${mentor.id}`}>
              {mentor.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate" data-testid={`text-mentor-title-${mentor.id}`}>
              {mentor.title}
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
            <span>{mentor.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{mentor.experience}+ years</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{mentor.rating}</span>
            <span className="text-xs text-muted-foreground">({mentor.reviews})</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {mentor.expertise.slice(0, 2).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {mentor.expertise.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{mentor.expertise.length - 2}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {mentor.bio}
        </p>
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewProfile(mentor.id)}
          className="flex-1"
          data-testid={`button-view-profile-${mentor.id}`}
        >
          View Profile
        </Button>
        <Button 
          size="sm" 
          onClick={() => onBookSession(mentor.id)}
          className="flex-1"
          data-testid={`button-book-session-${mentor.id}`}
        >
          Book Session
        </Button>
      </CardFooter>
    </Card>
  );
}