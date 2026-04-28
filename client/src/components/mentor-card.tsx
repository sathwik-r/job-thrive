import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, Clock, Star, Sparkles } from "lucide-react";
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
  const getAvailabilityConfig = (status: string) => {
    switch (status) {
      case 'available': return { color: 'bg-emerald-500', ring: 'ring-emerald-200', label: 'Available' };
      case 'busy': return { color: 'bg-amber-500', ring: 'ring-amber-200', label: 'Busy' };
      default: return { color: 'bg-gray-400', ring: 'ring-gray-200', label: 'Offline' };
    }
  };

  const avail = getAvailabilityConfig(mentor.availability);

  return (
    <Card className="modern-card card-hover border-0 overflow-hidden group" data-testid={`card-mentor-${mentor.id}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-11 w-11 ring-2 ring-gray-100">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback className="bg-gradient-to-br from-[var(--purple-primary)] to-[var(--purple-light)] text-white text-sm font-semibold">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${avail.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-[var(--dark-gray)] truncate" data-testid={`text-mentor-name-${mentor.id}`}>
              {mentor.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate" data-testid={`text-mentor-title-${mentor.id}`}>
              {mentor.title}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground truncate">{mentor.company}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-2 space-y-2.5">
        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {mentor.experience}+ yrs
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {mentor.location}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold">{mentor.rating}</span>
            <span className="text-[10px] text-muted-foreground">({mentor.reviews})</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {mentor.expertise.slice(0, 3).map((skill) => (
            <span key={skill} className="pill-badge bg-[var(--purple-50)] text-[var(--purple-primary)] border border-purple-100">
              {skill}
            </span>
          ))}
          {mentor.expertise.length > 3 && (
            <span className="pill-badge bg-gray-50 text-gray-500 border border-gray-100">
              +{mentor.expertise.length - 3}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Per session</span>
          <span className="text-sm font-bold text-[var(--dark-gray)]">Rs.499</span>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-1 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(mentor.id)}
          className="flex-1 h-8 text-xs rounded-lg border-gray-200"
          data-testid={`button-view-profile-${mentor.id}`}
        >
          Profile
        </Button>
        <Button
          size="sm"
          onClick={() => onBookSession(mentor.id)}
          className="flex-1 h-8 text-xs rounded-lg bg-[var(--purple-primary)] hover:bg-[var(--purple-primary)]/90"
          data-testid={`button-book-session-${mentor.id}`}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Book Session
        </Button>
      </CardFooter>
    </Card>
  );
}
