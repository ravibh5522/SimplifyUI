// src/components/interviewer/InterviewListItem.tsx

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
// We add Briefcase and Video icons
import { Calendar, User, Briefcase, Eye, Video } from 'lucide-react';


interface Interview {
  id: string;
  scheduled_at: string; // This is the formatted string for display
  raw_scheduled_at: string; // The original ISO string for date logic
  duration_minutes: number; // The duration of the interview
  status: string;
  job_title: string;
  candidate_name: string;
  meeting_urls: { primary?: string }; // The new meeting URL object
  // 'round_type' is no longer available from our new function, so we remove it
}

interface InterviewListItemProps {
  interview: Interview;
  onViewDetails: (interviewId: string) => void;
}

export const InterviewListItem = ({ interview, onViewDetails }: InterviewListItemProps) => {
  //   const isJoinable = () => {
  //   if (!interview.meeting_url || interview.status !== 'scheduled') return false;
    
  //   const now = new Date();
  //   const scheduledTime = new Date(interview.scheduled_at);
  //   const thirtyMinutesBefore = new Date(scheduledTime.getTime() - 30 * 60000); // 30 mins before
  //   const oneHourAfter = new Date(scheduledTime.getTime() + 60 * 60000); // 1 hour after
    
  //   // Show the button from 30 mins before to 1 hour after the scheduled time
  //   return now >= thirtyMinutesBefore && now <= oneHourAfter;
  // };

  // --- START: ADD THIS NEW LOGIC ---
  const now = new Date();
  const startTime = new Date(interview.raw_scheduled_at);
  const duration = interview.duration_minutes || 60; // Default to 60 mins if not provided
  const endTime = new Date(startTime.getTime() + duration * 60000);
  const isHappeningNow =  interview.status === 'scheduled' && startTime <= now && endTime >= now;
  // --- END: ADD THIS NEW LOGIC ---
 const joinableWindowStart = new Date(startTime.getTime() - 15 * 60000);
  const joinableWindowEnd = new Date(endTime.getTime() + 15 * 60000);
  const isJoinable = now >= joinableWindowStart && now <= joinableWindowEnd;

  const showJoinButton = interview.meeting_urls?.primary && interview.status === 'scheduled'&& now >= joinableWindowStart  && now <= joinableWindowEnd;

  return (
    <Card className={`p-4 hover:shadow-lg transition-shadow duration-300 ${isHappeningNow ? 'border-green-500 shadow-lg shadow-green-500/10' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Left Side: Details */}
        <div className="flex-grow space-y-2">
          <h3 className="font-bold text-lg text-primary">{interview.job_title}</h3>
          
          {/* --- NEW: DISPLAY INTERVIEW ROUND --- */}
          {/* <div className="flex items-center text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>Round: <span className="font-medium text-foreground">{interview.round_type}</span></span>
          </div> */}

          <div className="flex items-center text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            <span>Interview with: <span className="font-medium text-foreground">{interview.candidate_name}</span></span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{interview.scheduled_at}</span>
          </div>
        </div>
        
        {/* Right Side: Status & Actions */}
        {/* <div className="flex flex-col sm:items-end items-start gap-2 w-full sm:w-auto">
          <Badge variant={interview.status === 'scheduled' ? 'default' : 'secondary'} className="self-start sm:self-end">
            {interview.status}
          </Badge>
          <div className="flex space-x-2 w-full sm:w-auto">
            
            {isJoinable() && (
              <Button asChild size="sm" variant="outline" className="flex-1">
                <a href={interview.meeting_url!} target="_blank" rel="noopener noreferrer">
                  <Video className="w-4 h-4 mr-2" />
                  Join
                </a>
              </Button>
            )}

            <Button onClick={() => onViewDetails(interview.id)} size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div> */}
                {/* Right Side: Status & Actions */}
        <div className="flex flex-col sm:items-end items-start gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 self-start sm:self-end">
            {isHappeningNow && <Badge variant="destructive">Live Now</Badge>}
            <Badge variant={interview.status === 'scheduled' ? 'default' : 'secondary'}>
              {interview.status}
            </Badge>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            
            {/* The button now uses the correct meeting_urls.primary field */}
           {/* Show the Join button ONLY if the criteria are met */}
            {showJoinButton && (
              <Button asChild size="sm" variant={isHappeningNow ? "default" : "outline"} className="flex-1">
                <a href={interview.meeting_urls.primary} target="_blank" rel="noopener noreferrer">
                  <Video className="w-4 h-4 mr-2" />
                  Join
                </a>
              </Button>
            )}

            <Button onClick={() => onViewDetails(interview.id)} size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};