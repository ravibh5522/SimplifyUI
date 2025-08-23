// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
// import { format, addDays, isSameDay, parseISO, startOfDay, addMinutes } from 'date-fns';

// interface CandidateSlot {
//   end: string;
//   date: string;
//   start: string;
// }

// interface InterviewerSlot {
//   id: string;
//   end_time: string;
//   priority: string;
//   slot_type: string;
//   start_time: string;
//   duration_minutes: number;
//   constraints: {
//     can_be_split: boolean;
//     min_notice_hours: number;
//     requires_confirmation: boolean;
//   };
//   preferences: {
//     buffer_after: number;
//     max_duration: number;
//     buffer_before: number;
//     interview_types: string[];
//   };
// }

// interface Candidate {
//   id: string;
//   candidates: {
//     first_name: string;
//     last_name: string;
//     email: string;
//   } | null;
// }

// interface Interviewer {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
// }

// interface MergedCalendarViewProps {
//   candidates: Candidate[];
//   interviewers: Interviewer[];
//   duration: number; // in minutes
//   onSlotsSelected: (slots: any[]) => void;
// }

// interface MergedSlot {
//   start: Date;
//   end: Date;
//   candidateIds: string[];
//   interviewerIds: string[];
//   score: number; // compatibility score
// }

// const MergedCalendarView: React.FC<MergedCalendarViewProps> = ({
//   candidates,
//   interviewers,
//   duration,
//   onSlotsSelected
// }) => {
//   const [selectedSlots, setSelectedSlots] = useState<MergedSlot[]>([]);
//   const [availableSlots, setAvailableSlots] = useState<MergedSlot[]>([]);
//   const [currentWeek, setCurrentWeek] = useState(0);

//   useEffect(() => {
//     calculateMergedSlots();
//   }, [candidates, interviewers, duration]);

//   useEffect(() => {
//     onSlotsSelected(selectedSlots);
//   }, [selectedSlots, onSlotsSelected]);

//   const calculateMergedSlots = () => {
//     if (candidates.length === 0 || interviewers.length === 0) {
//       setAvailableSlots([]);
//       return;
//     }

//     const merged: MergedSlot[] = [];
//     const today = new Date();
//     const daysToCheck = 14; // Check next 2 weeks

//     for (let dayOffset = 1; dayOffset < daysToCheck; dayOffset++) { // Start from tomorrow
//       const currentDate = addDays(today, dayOffset);
      
//       // Skip weekends for now
//       if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
      
//       const daySlots = generateSlotsForDay(currentDate);
//       merged.push(...daySlots);
//     }

//     // Sort by time
//     merged.sort((a, b) => a.start.getTime() - b.start.getTime());

//     setAvailableSlots(merged);
//   };

//   const generateSlotsForDay = (date: Date): MergedSlot[] => {
//     const slots: MergedSlot[] = [];
    
//     // Generate common business hours slots (9 AM to 6 PM)
//     const startHour = 9;
//     const endHour = 18;
    
//     for (let hour = startHour; hour < endHour; hour++) {
//       // Skip lunch hour (12-1 PM)
//       if (hour === 12) continue;
      
//       const slotStart = new Date(date);
//       slotStart.setHours(hour, 0, 0, 0);
      
//       const slotEnd = addMinutes(slotStart, duration);
      
//       // Only add slot if it fits within working hours
//       if (slotEnd.getHours() <= endHour) {
//         const score = calculateTimeScore(slotStart);
        
//         slots.push({
//           start: slotStart,
//           end: slotEnd,
//           candidateIds: candidates.map(c => c.id),
//           interviewerIds: interviewers.map(i => i.id),
//           score
//         });
//       }
//     }
    
//     return slots;
//   };

//   const calculateTimeScore = (time: Date): number => {
//     const hour = time.getHours();
    
//     // Preferred times: 10-11 AM (score 100), 2-4 PM (score 90), others (score 70)
//     if (hour >= 10 && hour < 11) return 100;
//     if (hour >= 14 && hour < 16) return 90;
//     if (hour >= 9 && hour < 12) return 85;
//     if (hour >= 16 && hour < 18) return 75;
    
//     return 70;
//   };

//   const handleSlotToggle = (slot: MergedSlot) => {
//     setSelectedSlots(prev => {
//       const existing = prev.find(s => 
//         s.start.getTime() === slot.start.getTime() && 
//         s.end.getTime() === slot.end.getTime()
//       );
      
//       if (existing) {
//         return prev.filter(s => s !== existing);
//       } else {
//         return [...prev, slot];
//       }
//     });
//   };

//   const isSlotSelected = (slot: MergedSlot): boolean => {
//     return selectedSlots.some(s => 
//       s.start.getTime() === slot.start.getTime() && 
//       s.end.getTime() === slot.end.getTime()
//     );
//   };

//   const getScoreColor = (score: number): string => {
//     if (score >= 80) return 'bg-green-100 text-green-800';
//     if (score >= 60) return 'bg-yellow-100 text-yellow-800';
//     return 'bg-red-100 text-red-800';
//   };

//   const weekStart = addDays(new Date(), currentWeek * 7);
//   const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <div>
//           <h3 className="text-lg font-semibold flex items-center gap-2">
//             <Calendar className="w-5 h-5" />
//             Available Time Slots
//           </h3>
//           <p className="text-sm text-muted-foreground">
//             Showing common availability for {candidates.length} candidate(s) and {interviewers.length} interviewer(s)
//           </p>
//         </div>
//         <div className="flex items-center space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
//             disabled={currentWeek === 0}
//           >
//             Previous Week
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentWeek(currentWeek + 1)}
//           >
//             Next Week
//           </Button>
//         </div>
//       </div>

//       {selectedSlots.length > 0 && (
//         <Card className="bg-green-50 border-green-200">
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm text-green-800 flex items-center gap-2">
//               <CheckCircle className="w-4 h-4" />
//               Selected Slots ({selectedSlots.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-2">
//             {selectedSlots.map((slot, index) => (
//               <div key={index} className="flex items-center justify-between text-sm">
//                 <span>
//                   {format(slot.start, 'MMM dd, yyyy')} • {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
//                 </span>
//                 <Badge className={getScoreColor(slot.score)}>
//                   {slot.score}% match
//                 </Badge>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
//         {weekDays.map((day) => {
//           const daySlots = availableSlots.filter(slot => isSameDay(slot.start, day));
          
//           return (
//             <Card key={day.toISOString()} className="min-h-[300px]">
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-sm">
//                   {format(day, 'EEE, MMM dd')}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 {daySlots.length > 0 ? (
//                   daySlots.map((slot, index) => (
//                     <div
//                       key={index}
//                       className={`p-2 rounded-lg border cursor-pointer transition-all ${
//                         isSlotSelected(slot)
//                           ? 'bg-primary text-primary-foreground border-primary'
//                           : 'bg-background hover:bg-muted border-border'
//                       }`}
//                       onClick={() => handleSlotToggle(slot)}
//                     >
//                       <div className="text-xs font-medium">
//                         {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
//                       </div>
//                       <div className="flex items-center gap-1 mt-1">
//                         <Clock className="w-3 h-3" />
//                         <span className="text-xs">{duration}m</span>
//                       </div>
//                       <div className="flex items-center gap-1 mt-1">
//                         <Users className="w-3 h-3" />
//                         <span className="text-xs">
//                           {slot.candidateIds.length}C + {slot.interviewerIds.length}I
//                         </span>
//                       </div>
//                       <Badge 
//                         className={`${getScoreColor(slot.score)} mt-1 text-xs`}
//                       >
//                         {slot.score}%
//                       </Badge>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center text-muted-foreground text-xs py-4">
//                     No available slots
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {availableSlots.length === 0 && (
//         <Card className="bg-yellow-50 border-yellow-200">
//           <CardContent className="p-6 text-center">
//             <Calendar className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
//             <h3 className="font-semibold text-yellow-800 mb-2">No Available Slots</h3>
//             <p className="text-sm text-yellow-700">
//               No common availability found between selected candidates and interviewers. 
//               Try selecting different participants or check their availability settings.
//             </p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default MergedCalendarView;

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { format, addDays, isSameDay, parseISO, startOfDay, addMinutes, isAfter } from 'date-fns';

// --- STEP 1: Update Interfaces to Match Real Data ---
// These interfaces now accurately reflect the structure of the props being passed in.

interface Candidate {
  id: string;
  candidates: {
    first_name: string;
    last_name: string;
    email: string;
    free_slots?: { start: string; end: string }[];
  } | null;
}

interface Interviewer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  free_slots?: {
    free_slots?: { start_time: string; end_time: string }[];
  };
}

interface MergedCalendarViewProps {
  candidates: Candidate[];
  interviewers: Interviewer[];
  duration: number; // in minutes
  onSlotsSelected: (slots: any[]) => void;
}

interface MergedSlot {
  start: Date;
  end: Date;
  candidateIds: string[];
  interviewerIds: string[];
  score: number; // compatibility score
}

// Helper type for our internal algorithm
type NormalizedSlot = { start: Date; end: Date };
type Participant = { id: string; slots: NormalizedSlot[] };


const MergedCalendarView: React.FC<MergedCalendarViewProps> = ({
  candidates,
  interviewers,
  duration,
  onSlotsSelected
}) => {
  const [selectedSlots, setSelectedSlots] = useState<MergedSlot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<MergedSlot[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);

  // --- STEP 2: The Core Algorithm ---
  // We use useMemo to re-calculate only when participants or duration change.
  // useEffect(() => {
  //   // Guard clause: Don't run if we don't have participants from both sides.
  //   if (candidates.length === 0 || interviewers.length === 0 || !duration) {
  //     setAvailableSlots([]);
  //     return;
  //   }

  //   // 1. GATHER & NORMALIZE ALL SLOTS
  //   const allParticipants: Participant[] = [];

  //   candidates.forEach(c => {
  //     const candidateSlots = c.candidates?.free_slots?.map(s => ({
  //       start: parseISO(s.start),
  //       end: parseISO(s.end),
  //     })) || [];
  //     allParticipants.push({ id: c.id, slots: candidateSlots });
  //   });

  //   interviewers.forEach(i => {
  //     const interviewerSlots = i.free_slots?.free_slots?.map(s => ({
  //       start: parseISO(s.start_time),
  //       end: parseISO(s.end_time),
  //     })) || [];
  //     allParticipants.push({ id: i.id, slots: interviewerSlots });
  //   });

  //   // 2. GENERATE POTENTIAL START TIMES
  //   // We only need to check for common slots starting at times when someone's availability begins.
  //   const potentialStartTimes = new Set<number>();
  //   allParticipants.forEach(p => {
  //     p.slots.forEach(s => {
  //       // We can create interview slots that start on the hour, half-hour, etc. inside a free block.
  //       let currentTime = s.start;
  //       while (addMinutes(currentTime, duration) <= s.end) {
  //         potentialStartTimes.add(currentTime.getTime());
  //         currentTime = addMinutes(currentTime, 15); // Check every 15 minutes for a potential start
  //       }
  //     });
  //   });

  //   // 3. VALIDATE EACH POTENTIAL SLOT
  //   const commonSlots: MergedSlot[] = [];
  //   const now = new Date();

  //   Array.from(potentialStartTimes)
  //     .sort()
  //     .forEach(timeValue => {
  //       const potentialStart = new Date(timeValue);

  //       // Skip slots that are in the past
  //       if (!isAfter(potentialStart, now)) {
  //         return;
  //       }

  //       const potentialEnd = addMinutes(potentialStart, duration);

  //       // Check if EVERY participant is available during this potential slot
  //       const isEveryoneAvailable = allParticipants.every(participant => {
  //         // Check if any of the participant's slots contain the potential interview slot
  //         return participant.slots.some(
  //           freeSlot =>
  //             freeSlot.start.getTime() <= potentialStart.getTime() &&
  //             freeSlot.end.getTime() >= potentialEnd.getTime()
  //         );
  //       });

  //       if (isEveryoneAvailable) {
  //         commonSlots.push({
  //           start: potentialStart,
  //           end: potentialEnd,
  //           candidateIds: candidates.map(c => c.id),
  //           interviewerIds: interviewers.map(i => i.id),
  //           score: calculateTimeScore(potentialStart)
  //         });
  //       }
  //     });

  //   setAvailableSlots(commonSlots);
    
  // }, [candidates, interviewers, duration]);

  // -------------------- CORRECTED CODE TO COPY --------------------

  // This is the updated useEffect hook with better null-checking.
// -------------------- FINAL CORRECTED CODE TO COPY --------------------

  // This is the final, most robust version of the useEffect hook.
  // better 
//   useEffect(() => {
//     // Guard clause: Don't run if we don't have participants from both sides.
//     if (candidates.length === 0 || interviewers.length === 0 || !duration) {
//       setAvailableSlots([]);
//       return;
//     }
//     console.log("--- MergedCalendarView: Raw Inputs ---", { candidates, interviewers, duration });

//     // 1. GATHER & NORMALIZE ALL SLOTS (WITH FILTERING FOR BAD DATA)
//     const allParticipants: Participant[] = [];

//     candidates.forEach(c => {
//       // Step A: Safely access the array, defaulting to [].
//       // Step B: Filter out any null/undefined slots or slots missing 'start'/'end' properties.
//       const validSlots = (c.candidates?.free_slots || []).filter(
//         slot => slot && slot.start && slot.end
//       );
      
//       const candidateSlots = validSlots.map(s => ({
//         start: parseISO(s.start),
//         end: parseISO(s.end),
//       }));
//       allParticipants.push({ id: c.id, slots: candidateSlots });
//     });

//     interviewers.forEach(i => {
//       // Step A: Safely access the nested array, defaulting to [].
//       // Step B: Filter out any null/undefined slots or slots missing 'start_time'/'end_time'.
//       const validSlots = (i.free_slots?.free_slots || []).filter(
//         slot => slot && slot.start_time && slot.end_time
//       );
      
//       const interviewerSlots = validSlots.map(s => ({
//         start: parseISO(s.start_time),
//         end: parseISO(s.end_time),
//       }));
//       allParticipants.push({ id: i.id, slots: interviewerSlots });
//     });
    
//     // --- The rest of the logic remains the same ---
// console.log("--- MergedCalendarView: Normalized Participants & Slots ---", allParticipants);

//     // 2. GENERATE POTENTIAL START TIMES
//     const potentialStartTimes = new Set<number>();
//     allParticipants.forEach(p => {
//       p.slots.forEach(s => {
//         let currentTime = s.start;
//         while (addMinutes(currentTime, duration) <= s.end) {
//           potentialStartTimes.add(currentTime.getTime());
//           currentTime = addMinutes(currentTime, 15);
//         }
//       });
//     });

//     // 3. VALIDATE EACH POTENTIAL SLOT
//     const commonSlots: MergedSlot[] = [];
//     const now = new Date();

//     Array.from(potentialStartTimes)
//       .sort()
//       .forEach(timeValue => {
//         const potentialStart = new Date(timeValue);
//         if (!isAfter(potentialStart, now)) {
//           return;
//         }
//         const potentialEnd = addMinutes(potentialStart, duration);
//         const isEveryoneAvailable = allParticipants.every(participant => {
//           return participant.slots.some(
//             freeSlot =>
//               freeSlot.start.getTime() <= potentialStart.getTime() &&
//               freeSlot.end.getTime() >= potentialEnd.getTime()
//           );
//         });

//         if (isEveryoneAvailable) {
//           commonSlots.push({
//             start: potentialStart,
//             end: potentialEnd,
//             candidateIds: candidates.map(c => c.id),
//             interviewerIds: interviewers.map(i => i.id),
//             score: calculateTimeScore(potentialStart)
//           });
//         }
//       });
//  console.log(`--- MergedCalendarView: Found ${commonSlots.length} Common Slots ---`, commonSlots);
//     setAvailableSlots(commonSlots);
    
//   }, [candidates, interviewers, duration]);

  // -------------------- FINAL, DATA-ACCURATE CODE --------------------
// -------------------- CODE WITH DIAGNOSTIC LOGS --------------------

  useEffect(() => {
    // Guard clause
    if (candidates.length === 0 || interviewers.length === 0 || !duration) {
      setAvailableSlots([]);
      return;
    }

    // ★★★ LOG #1: RAW INPUT DATA ★★★
    // This shows us the props exactly as they come into the component.
    console.log("--- MergedCalendarView: Raw Inputs ---", { 
      candidates: JSON.parse(JSON.stringify(candidates)), 
      interviewers: JSON.parse(JSON.stringify(interviewers)), 
      duration 
    });

    // 1. GATHER & NORMALIZE ALL SLOTS
    const allParticipants: Participant[] = [];
    
    candidates.forEach(c => {
      const candidateSlotsData = c.candidates?.free_slots?.[0]?.free_slots || [];
      const validSlots = candidateSlotsData.filter(
        slot => slot && slot.start && slot.end && isAfter(parseISO(slot.end), parseISO(slot.start))
      );
      const candidateSlots = validSlots.map(s => ({
        start: parseISO(s.start),
        end: parseISO(s.end),
      }));
      allParticipants.push({ id: c.id, slots: candidateSlots });
    });

    interviewers.forEach(i => {
      const interviewerSlotsData = i.free_slots?.free_slots || [];
      const validSlots = interviewerSlotsData.filter(
        slot => slot && slot.start_time && slot.end_time && isAfter(parseISO(slot.end_time), parseISO(slot.start_time))
      );
      const interviewerSlots = validSlots.map(s => ({
        start: parseISO(s.start_time),
        end: parseISO(s.end_time),
      }));
      allParticipants.push({ id: i.id, slots: interviewerSlots });
    });

    // ★★★ LOG #2: NORMALIZED DATA FOR THE ALGORITHM ★★★
    // This is the most important log. It shows the clean Date objects the algorithm will process.
    console.log("--- MergedCalendarView: Normalized Participants & Slots ---", allParticipants);
    
    // 2. GENERATE POTENTIAL START TIMES
    const potentialStartTimes = new Set<number>();
    allParticipants.forEach(p => {
      p.slots.forEach(s => {
        let currentTime = s.start;
        while (addMinutes(currentTime, duration) <= s.end) {
          potentialStartTimes.add(currentTime.getTime());
          currentTime = addMinutes(currentTime, 15);
        }
      });
    });

    // 3. VALIDATE EACH POTENTIAL SLOT
    const commonSlots: MergedSlot[] = [];
    const now = new Date();

    Array.from(potentialStartTimes)
      .sort()
      .forEach(timeValue => {
        const potentialStart = new Date(timeValue);
        if (!isAfter(potentialStart, now)) return;

        const potentialEnd = addMinutes(potentialStart, duration);
        const isEveryoneAvailable = allParticipants.every(participant => {
          return participant.slots.some(
            freeSlot =>
              freeSlot.start.getTime() <= potentialStart.getTime() &&
              freeSlot.end.getTime() >= potentialEnd.getTime()
          );
        });

        if (isEveryoneAvailable) {
          commonSlots.push({
            start: potentialStart,
            end: potentialEnd,
            candidateIds: candidates.map(c => c.id),
            interviewerIds: interviewers.map(i => i.id),
            score: calculateTimeScore(potentialStart)
          });
        }
      });
    
    // ★★★ LOG #3: FINAL OUTPUT ★★★
    // This shows us the final result of the algorithm.
    console.log(`--- MergedCalendarView: Found ${commonSlots.length} Common Slots ---`, commonSlots);

    setAvailableSlots(commonSlots);
    
  }, [candidates, interviewers, duration]);

// -------------------- END OF CODE WITH LOGS --------------------```

// was working fine with assigned profile issue 
  // useEffect(() => {
  //   // Guard clause
  //   if (candidates.length === 0 || interviewers.length === 0 || !duration) {
  //     setAvailableSlots([]);
  //     return;
  //   }

  //   console.log("--- MergedCalendarView: Raw Inputs ---", { candidates, interviewers, duration });

  //   // 1. GATHER & NORMALIZE ALL SLOTS
  //   const allParticipants: Participant[] = [];
    
  //   candidates.forEach(c => {
  //     // ▼▼▼ THIS IS THE FIX ▼▼▼
  //     // The candidate's real slots are nested one level deeper.
  //     // We safely access this nested array.
  //     const candidateSlotsData = c.candidates?.free_slots?.[0]?.free_slots || [];
      
  //     const validSlots = candidateSlotsData.filter(
  //       slot => slot && slot.start && slot.end
  //     );
      
  //     const candidateSlots = validSlots.map(s => ({
  //       start: parseISO(s.start),
  //       end: parseISO(s.end),
  //     }));
  //     allParticipants.push({ id: c.id, slots: candidateSlots });
  //   });

  //   interviewers.forEach(i => {
  //     const interviewerSlotsData = i.free_slots?.free_slots || [];
  //     const validSlots = interviewerSlotsData.filter(
  //       slot => slot && slot.start_time && slot.end_time
  //     );
  //     const interviewerSlots = validSlots.map(s => ({
  //       start: parseISO(s.start_time),
  //       end: parseISO(s.end_time),
  //     }));
  //     allParticipants.push({ id: i.id, slots: interviewerSlots });
  //   });

  //   console.log("--- MergedCalendarView: Normalized Participants & Slots ---", allParticipants);
    
  //   // --- The rest of the logic remains the same ---
  //   const potentialStartTimes = new Set<number>();
  //   allParticipants.forEach(p => {
  //     p.slots.forEach(s => {
  //       let currentTime = s.start;
  //       while (addMinutes(currentTime, duration) <= s.end) {
  //         potentialStartTimes.add(currentTime.getTime());
  //         currentTime = addMinutes(currentTime, 15);
  //       }
  //     });
  //   });

  //   const commonSlots: MergedSlot[] = [];
  //   const now = new Date();

  //   Array.from(potentialStartTimes)
  //     .sort()
  //     .forEach(timeValue => {
  //       const potentialStart = new Date(timeValue);
  //       if (!isAfter(potentialStart, now)) return;

  //       const potentialEnd = addMinutes(potentialStart, duration);
  //       const isEveryoneAvailable = allParticipants.every(participant => {
  //         return participant.slots.some(
  //           freeSlot =>
  //             freeSlot.start.getTime() <= potentialStart.getTime() &&
  //             freeSlot.end.getTime() >= potentialEnd.getTime()
  //         );
  //       });

  //       if (isEveryoneAvailable) {
  //         commonSlots.push({
  //           start: potentialStart,
  //           end: potentialEnd,
  //           candidateIds: candidates.map(c => c.id),
  //           interviewerIds: interviewers.map(i => i.id),
  //           score: calculateTimeScore(potentialStart)
  //         });
  //       }
  //     });
    
  //   console.log(`--- MergedCalendarView: Found ${commonSlots.length} Common Slots ---`, commonSlots);

  //   setAvailableSlots(commonSlots);
    
  // }, [candidates, interviewers, duration]);

// -------------------- END OF FINAL CODE --------------------
// -------------------- END OF FINAL CORRECTED CODE --------------------
// -------------------- END OF CORRECTED CODE --------------------

  useEffect(() => {
    onSlotsSelected(selectedSlots);
  }, [selectedSlots, onSlotsSelected]);

  // This scoring function is a nice-to-have and can be kept as is
  const calculateTimeScore = (time: Date): number => {
    const hour = time.getHours();
    if (hour >= 10 && hour < 12) return 100;
    if (hour >= 14 && hour < 16) return 90;
    if (hour >= 9 && hour < 13) return 85;
    if (hour >= 16 && hour < 18) return 75;
    return 70;
  };

  const handleSlotToggle = (slot: MergedSlot) => {
    setSelectedSlots(prev => {
      const existing = prev.find(s => s.start.getTime() === slot.start.getTime());
      if (existing) {
        return prev.filter(s => s !== existing);
      } else {
        // For now, allow selecting multiple slots. Could be changed to single-select.
        return [...prev, slot];
      }
    });
  };

  const isSlotSelected = (slot: MergedSlot): boolean => {
    return selectedSlots.some(s => s.start.getTime() === slot.start.getTime());
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const weekStart = startOfDay(addDays(new Date(), currentWeek * 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // --- STEP 3: The UI (No changes needed here) ---
  // The existing UI code is well-structured to display the data we generate.
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Available Time Slots
          </h3>
          <p className="text-sm text-muted-foreground">
            Showing common availability for {candidates.length} candidate(s) and {interviewers.length} interviewer(s)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
            disabled={currentWeek === 0}
          >
            Previous Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(currentWeek + 1)}
          >
            Next Week
          </Button>
        </div>
      </div>

      {/* Selected Slots display remains the same */}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const daySlots = availableSlots.filter(slot => isSameDay(slot.start, day));
          
          return (
            <div key={day.toISOString()}>
              <p className="text-center font-medium text-sm mb-2">
                {format(day, 'EEE dd')}
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {daySlots.length > 0 ? (
                  daySlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg border cursor-pointer transition-all text-center ${
                        isSlotSelected(slot)
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                          : 'bg-background hover:bg-muted/50'
                      }`}
                      onClick={() => handleSlotToggle(slot)}
                    >
                      <div className="text-sm font-semibold">
                        {format(slot.start, 'HH:mm')}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span><Users className="w-3 h-3 inline-block mr-1" />{candidates.length + interviewers.length}</span>
                        <span><Clock className="w-3 h-3 inline-block mr-1" />{duration}m</span>
                      </div>
                      <Badge 
                        className={`${getScoreColor(slot.score)} mt-2 text-xs`}
                      >
                        {slot.score}%
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-xs py-10">
                    No common slots
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {availableSlots.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200 mt-4">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
            <h3 className="font-semibold text-yellow-800 mb-2">No Common Availability Found</h3>
            <p className="text-sm text-yellow-700">
              There are no overlapping time slots between the selected candidates and interviewers for the next two weeks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MergedCalendarView;