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
  const availColor = mentor.availability === 'available' ? '#A3E635' : mentor.availability === 'busy' ? '#FB923C' : '#525252';

  return (
    <Card className="border-0 overflow-hidden card-hover" style={{ background: '#1C1C1C', border: '1px solid #1F1F1F' }} data-testid={`card-mentor-${mentor.id}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-11 w-11 ring-2 ring-[#1F1F1F]">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback style={{ background: 'linear-gradient(135deg, #A3E635, #818CF8)' }} className="text-white text-sm font-bold">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2" style={{ borderColor: '#1C1C1C', background: availColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-[#F5F5F5] truncate" data-testid={`text-mentor-name-${mentor.id}`}>{mentor.name}</h3>
            <p className="text-xs text-[#A3A3A3] truncate" data-testid={`text-mentor-title-${mentor.id}`}>{mentor.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3 text-[#525252]" />
              <span className="text-[11px] text-[#525252] truncate">{mentor.company}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-2 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-[#525252]">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{mentor.experience}+ yrs</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{mentor.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-[#F5F5F5]">{mentor.rating}</span>
            <span className="text-[10px] text-[#525252]">({mentor.reviews})</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {mentor.expertise.slice(0, 3).map((skill) => (
            <span key={skill} className="pill-badge text-[#818CF8] border" style={{ background: '#818CF815', borderColor: '#818CF830' }}>{skill}</span>
          ))}
          {mentor.expertise.length > 3 && (
            <span className="pill-badge text-[#525252] border" style={{ background: '#1C1C1C', borderColor: '#1F1F1F' }}>+{mentor.expertise.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[#525252]">Per session</span>
          <span className="text-sm font-black text-[#F5F5F5]">Rs.499</span>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-1 gap-2">
        <Button variant="ghost" size="sm" onClick={() => onViewProfile(mentor.id)}
          className="flex-1 h-8 text-xs rounded-lg text-[#A3A3A3] hover:text-[#F5F5F5]"
          style={{ border: '1px solid #1F1F1F' }}
          data-testid={`button-view-profile-${mentor.id}`}>Profile</Button>
        <Button size="sm" onClick={() => onBookSession(mentor.id)}
          className="flex-1 h-8 text-xs rounded-lg font-bold text-[#0C0C0C] border-0"
          style={{ background: '#A3E635' }}
          data-testid={`button-book-session-${mentor.id}`}>
          <Sparkles className="w-3 h-3 mr-1" />Book
        </Button>
      </CardFooter>
    </Card>
  );
}
