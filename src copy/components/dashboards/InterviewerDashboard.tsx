// // // src/components/dashboards/InterviewerDashboard.tsx

// // import { InterviewCalendar } from '@/components/interviewer/InterviewCalendar';
// // import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// // import { List, Calendar } from 'lucide-react';
// // import DashboardLayout from '@/components/layout/DashboardLayout';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { useAuth } from '@/hooks/useAuth';
// // import { supabase } from '@/integrations/supabase/client';
// // import { useEffect, useState } from 'react';
// // import { InterviewListItem } from '@/components/interviewer/InterviewListItem'; // Import our new component
// // import { InterviewDetailModal } from '@/components/modals/InterviewDetailModal';
// // import { ViewJobModal } from '@/components/modals/ViewJobModal';
// // import { AvailabilitySelector } from '@/components/ui/AvailabilitySelector';
// // // Define the types for our data
// // interface Interview {
// //   id: string;
// //   scheduled_at: string;
// //   status: string;
// //   job_title: string;
// //   candidate_name: string;
// //   round_type: string; // Add this
// //   meeting_url: string | null; // Add this (can be null)
// //    raw_scheduled_at: string; // Add this for calendar
// //    isPast?: boolean; // Optional flag to identify past interviews

// // }
// // const InterviewerDashboard = () => {
// //   const { profile } = useAuth();
// //   const [interviews, setInterviews] = useState<Interview[]>([]);
// //   const [loading, setLoading] = useState(true);
// // // At the top of the InterviewerDashboard component
// // const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);

// // const [calendarInterviews, setCalendarInterviews] = useState<Interview[]>([]);
// //   // We add state to manage which interview detail modal is open
// //   const [viewingInterviewId, setViewingInterviewId] = useState<string | null>(null);

// // const [viewingJobId, setViewingJobId] = useState<string | null>(null); // <-- Add this line
// // // Inside the InterviewerDashboard component
// // const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

// //   useEffect(() => {
// //     const fetchInterviews = async () => {
// //       if (!profile) return;
// //       setLoading(true);

// //       // --- THIS IS THE CORRECTED, SAFE QUERY ---
// //       // We are NOT doing the 'has_passed' comparison here anymore.
// //       const { data, error } = await supabase
// //         .from('interview_participants')
// //         .select(`
// //           id,
// //           scheduled_at,
// //           status,
// //           meeting_url, 
// //           interview_rounds ( round_type ),
// //           job_applications (
// //             jobs ( title ),
// //             candidates ( first_name, last_name )
// //           )
// //         `)
// //         .eq('interviewer_id', profile.id)
// //         .order('scheduled_at', { ascending: true }); // Back to ascending for upcoming

// //       if (error) {
// //         console.error("Error fetching interviews:", error);
// //         setLoading(false);
// //         return;
// //       }
  
// //       const now = new Date();

// //       const allFormattedInterviews = data.map(item => {
// //         if (!item.job_applications?.jobs || !item.job_applications?.candidates) {
// //           return null;
// //         }

// //         return {
// //           id: item.id,
// //           raw_scheduled_at: item.scheduled_at, // We need the raw date string for comparison
// //           scheduled_at: new Date(item.scheduled_at).toLocaleString('en-US', {
// //               dateStyle: 'full',
// //               timeStyle: 'short',
// //           }),
// //           status: item.status,
// //           meeting_url: item.meeting_url,
// //           round_type: item.interview_rounds?.round_type || 'General',
// //           job_title: item.job_applications.jobs.title || 'N/A',
// //           candidate_name: `${item.job_applications.candidates.first_name || ''} ${item.job_applications.candidates.last_name || ''}`.trim()
// //         };
// //       }).filter(Boolean);

// //       // Use the reliable JavaScript date comparison
// //       const upcoming = allFormattedInterviews.filter(interview => 
// //         interview!.status === 'scheduled' && new Date(interview!.raw_scheduled_at) >= now
// //       );
// //       const past = allFormattedInterviews.filter(interview => 
// //         interview!.status !== 'scheduled' || new Date(interview!.raw_scheduled_at) < now
// //       );

// //       setInterviews(upcoming);
// //       // Sort past interviews to show the most recent ones first
// //       setPastInterviews(past.sort((a, b) => new Date(b.raw_scheduled_at).getTime() - new Date(a.raw_scheduled_at).getTime()));

// //       const allCalendarEvents = [
// //         ...upcoming.map(i => ({ ...i, isPast: false })),
// //         ...past.map(i => ({ ...i, isPast: true })),
// //       ];
// //       setCalendarInterviews(allCalendarEvents);

// //       setLoading(false);
// //     };

// //     fetchInterviews();
// //   }, [profile]);


// //   const handleViewDetails = (interviewId: string) => {
// //     setViewingInterviewId(interviewId);
// //     console.log("Should open modal for interview ID:", interviewId); // For testing
// //   };

// //   return (
// //     <>
// //       <DashboardLayout title="Interviewer Dashboard">
// //         <div className="space-y-6">
// //           <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-white">
// //             <h1 className="text-3xl font-bold">My Upcoming Interviews</h1>
// //             <p className="text-white/80">Here are the interviews you are scheduled to conduct.</p>
// //           </div>

// //          <Tabs defaultValue="upcoming" className="w-full">
// //   <TabsList className="grid w-full grid-cols-2">
// //     <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
// //     <TabsTrigger value="past">Past Interviews</TabsTrigger>
// //   </TabsList>

// //   {/* Tab 1: Upcoming Interviews */}
// //   <TabsContent value="upcoming">
// //     <Card>
// //       <CardHeader className="flex flex-row items-center justify-between">
// //   <CardTitle>Interview Schedule</CardTitle>
// //   <ToggleGroup 
// //     type="single" 
// //     defaultValue="list" 
// //     value={viewMode}
// //     onValueChange={(value) => {
// //       if (value) setViewMode(value as 'list' | 'calendar');
// //     }}
// //     aria-label="View mode"
// //   >
// //     <ToggleGroupItem value="list" aria-label="List view">
// //       <List className="h-4 w-4" />
// //     </ToggleGroupItem>
// //     <ToggleGroupItem value="calendar" aria-label="Calendar view">
// //       <Calendar className="h-4 w-4" />
// //     </ToggleGroupItem>
// //   </ToggleGroup>
// // </CardHeader>
// //       <CardContent>
// //   {loading ? (
// //     <p>Loading interviews...</p>
// //   ) : (
// //     // --- THIS IS THE NEW CONDITIONAL LOGIC ---
// //     viewMode === 'list' ? (
// //       // If viewMode is 'list', show our existing list component
// //       interviews.length > 0 ? (
// //         <div className="space-y-4">
// //           {interviews.map(interview => (
// //             <InterviewListItem 
// //               key={interview.id} // <-- THIS IS THE FIX for the warning
// //               interview={interview}
// //               onViewDetails={handleViewDetails}
// //             />
// //           ))}
// //         </div>
// //       ) : (
// //         <div className="text-center py-12">
// //           <p className="text-muted-foreground">You have no upcoming interviews scheduled.</p>
// //         </div>
// //       )
// //     ) : (
// //       // If viewMode is 'calendar', show our new calendar component
// //       <InterviewCalendar 
// //         interviews={calendarInterviews}
// //         onEventClick={handleViewDetails}
// //       />
// //     )
// //   )}
// // </CardContent>
// //     </Card>
// //   </TabsContent>

// //   {/* Tab 2: Past Interviews (Placeholder for now) */}
// //  <TabsContent value="past">
// //   <Card>
// //     <CardHeader>
// //       <CardTitle>Completed Interview History</CardTitle>
// //     </CardHeader>
// //     <CardContent>
// //       {/* We use the new 'pastInterviews' state here */}
// //       {loading ? (
// //         <p>Loading interviews...</p>
// //       ) : pastInterviews.length > 0 ? (
// //         <div className="space-y-4">
// //           {pastInterviews.map(interview => (
// //             <InterviewListItem 
// //               key={interview.id}
// //               interview={interview}
// //               onViewDetails={handleViewDetails}
// //             />
// //           ))}
// //         </div>
// //       ) : (
// //         <div className="text-center py-12">
// //           <p className="text-muted-foreground">You have no past interviews.</p>
// //         </div>
// //       )}
// //     </CardContent>
// //   </Card>
// // </TabsContent>
// // </Tabs>
// //         </div>
// //       </DashboardLayout>

// //       {/* --- Placeholder for our next component --- */}
      
// //             <InterviewDetailModal
// //       interviewId={viewingInterviewId}
// //       open={!!viewingInterviewId}
// //       onOpenChange={(isOpen) => !isOpen && setViewingInterviewId(null)}
// //       onViewJob={(jobId) => setViewingJobId(jobId)} // <-- Pass the handler
// //     />

// //         <ViewJobModal
// //     jobId={viewingJobId}
// //     open={!!viewingJobId}
// //     onOpenChange={(isOpen) => !isOpen && setViewingJobId(null)}
// // />
     
// //     </>
// //   );
// // };

// // export default InterviewerDashboard;


// // src/components/dashboards/InterviewerDashboard.tsx

// // --- NEW: Import necessary components for the modal and availability selector ---
// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Button } from '@/components/ui/button';
// import { AvailabilitySelector } from '@/components/ui/AvailabilitySelector';
// import { useToast } from '@/hooks/use-toast'; // Assuming useToast is available

// import { InterviewCalendar } from '@/components/interviewer/InterviewCalendar';
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// import { List, Calendar ,CalendarDays } from 'lucide-react';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/integrations/supabase/client';
// import { InterviewListItem } from '@/components/interviewer/InterviewListItem';
// import { InterviewDetailModal } from '@/components/modals/InterviewDetailModal';
// import { ViewJobModal } from '@/components/modals/ViewJobModal';




// import { AvailabilityManager } from '@/components/ui/AvailabilityManager';
// // Define the types for our data
// interface Interview {
//   id: string;
//   scheduled_at: string;
//   status: string;
//   job_title: string;
//   candidate_name: string;
//   round_type: string;
//   meeting_url: string | null;
//   raw_scheduled_at: string;
//   isPast?: boolean;
// }

// const InterviewerDashboard = () => {
//   const { profile } = useAuth();
//   const { toast } = useToast(); // --- NEW: Get the toast function ---
//   const [interviews, setInterviews] = useState<Interview[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);
//   const [calendarInterviews, setCalendarInterviews] = useState<Interview[]>([]);
//   const [viewingInterviewId, setViewingInterviewId] = useState<string | null>(null);
//   const [viewingJobId, setViewingJobId] = useState<string | null>(null);
//   const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

//    // --- NEW: State management for the availability feature ---
//   const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
//   const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);
//   const [isFetchingSlots, setIsFetchingSlots] = useState(false);


// // The state now holds the entire complex object, or null
// const [availabilityData, setAvailabilityData] = useState<any | null>(null);


//   useEffect(() => {
//     // ... existing useEffect hook to fetch interviews ...
//     const fetchInterviews = async () => {
//       if (!profile) return;
//       setLoading(true);

//       const { data, error } = await supabase
//         .from('interview_participants')
//         .select(`
//           id, scheduled_at, status, meeting_url, 
//           interview_rounds ( round_type ),
//           job_applications (
//             jobs ( title ),
//             candidates ( first_name, last_name )
//           )
//         `)
//         .eq('interviewer_id', profile.id)
//         .order('scheduled_at', { ascending: true });

//       if (error) {
//         console.error("Error fetching interviews:", error);
//         setLoading(false);
//         return;
//       }
  
//       const now = new Date();
//       const allFormattedInterviews = data.map(item => {
//         if (!item.job_applications?.jobs || !item.job_applications?.candidates) {
//           return null;
//         }
//         return {
//           id: item.id,
//           raw_scheduled_at: item.scheduled_at,
//           scheduled_at: new Date(item.scheduled_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
//           status: item.status,
//           meeting_url: item.meeting_url,
//           round_type: item.interview_rounds?.round_type || 'General',
//           job_title: item.job_applications.jobs.title || 'N/A',
//           candidate_name: `${item.job_applications.candidates.first_name || ''} ${item.job_applications.candidates.last_name || ''}`.trim()
//         };
//       }).filter(Boolean);

//       const upcoming = allFormattedInterviews.filter(interview => 
//         interview!.status === 'scheduled' && new Date(interview!.raw_scheduled_at) >= now
//       );
//       const past = allFormattedInterviews.filter(interview => 
//         interview!.status !== 'scheduled' || new Date(interview!.raw_scheduled_at) < now
//       );

//       setInterviews(upcoming);
//       setPastInterviews(past.sort((a, b) => new Date(b.raw_scheduled_at).getTime() - new Date(a.raw_scheduled_at).getTime()));
//       const allCalendarEvents = [
//         ...upcoming.map(i => ({ ...i, isPast: false })),
//         ...past.map(i => ({ ...i, isPast: true })),
//       ];
//       setCalendarInterviews(allCalendarEvents);

//       setLoading(false);
//     };

//     fetchInterviews();
//   }, [profile]);

//   const handleViewDetails = (interviewId: string) => {
//     setViewingInterviewId(interviewId);
//   };


//    const handleOpenAvailabilityModal = async () => {
//     setIsFetchingSlots(true);
//     try {
//       console.log("Fetching existing availability from the database...");
//       const { data, error } = await supabase.rpc('get_my_availability');
//       if (error) throw error;
//        console.log("Successfully fetched data:", data);
//       // setAvailabilitySlots(data || []);
//             setAvailabilityData({ availability: data }); // Wrap it to match the expected structure
//       setIsAvailabilityModalOpen(true);
//     } catch (error: any) {
//       toast({ title: "Could not load schedule", description: error.message, variant: "destructive" });
//     } finally {
//       setIsFetchingSlots(false);
//     }
//   };

//   // --- NEW: Handler function to save the availability ---
//  const handleSaveAvailability = async (updatedData: any) => {
//     try {
//       const { error } = await supabase.rpc('update_user_availability', { new_slots: updatedData });
//       if (error) throw error;
//       toast({ title: "Availability Saved!", description: "Your schedule has been updated." });
//       setIsAvailabilityModalOpen(false);
//     } catch (error: any) {
//       toast({ title: "Error Saving Schedule", description: error.message, variant: "destructive" });
//     }
//   };


//   return (
//     <>
//       <DashboardLayout title="Interviewer Dashboard">
//         <div className="space-y-6">
//           {/* --- MODIFIED: Hero section now includes the new button --- */}
//           <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-white flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold">My Upcoming Interviews</h1>
//               <p className="text-white/80">Here are the interviews you are scheduled to conduct.</p>
//             </div>
//              <Button
//               variant="outline"
//               className="bg-white/10 hover:bg-white/20 border-white/20 text-white shrink-0"
//               onClick={handleOpenAvailabilityModal}
//               disabled={isFetchingSlots}
//             >
//               {isFetchingSlots ? (
//                 'Loading...'
//               ) : (
//                 <>
//                   <CalendarDays className="w-4 h-4 mr-2" />
//                   Set My Availability
//                 </>
//               )}
//             </Button>
//           </div>

//           <Tabs defaultValue="upcoming" className="w-full">
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
//               <TabsTrigger value="past">Past Interviews</TabsTrigger>
//             </TabsList>

//              {/* Tab 1: Upcoming Interviews */}
//   <TabsContent value="upcoming">
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//   <CardTitle>Interview Schedule</CardTitle>
//   <ToggleGroup 
//     type="single" 
//     defaultValue="list" 
//     value={viewMode}
//     onValueChange={(value) => {
//       if (value) setViewMode(value as 'list' | 'calendar');
//     }}
//     aria-label="View mode"
//   >
//     <ToggleGroupItem value="list" aria-label="List view">
//       <List className="h-4 w-4" />
//     </ToggleGroupItem>
//     <ToggleGroupItem value="calendar" aria-label="Calendar view">
//       <Calendar className="h-4 w-4" />
//     </ToggleGroupItem>
//   </ToggleGroup>
// </CardHeader>
//       <CardContent>
//   {loading ? (
//     <p>Loading interviews...</p>
//   ) : (
//     // --- THIS IS THE NEW CONDITIONAL LOGIC ---
//     viewMode === 'list' ? (
//       // If viewMode is 'list', show our existing list component
//       interviews.length > 0 ? (
//         <div className="space-y-4">
//           {interviews.map(interview => (
//             <InterviewListItem 
//               key={interview.id} // <-- THIS IS THE FIX for the warning
//               interview={interview}
//               onViewDetails={handleViewDetails}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <p className="text-muted-foreground">You have no upcoming interviews scheduled.</p>
//         </div>
//       )
//     ) : (
//       // If viewMode is 'calendar', show our new calendar component
//       <InterviewCalendar 
//         interviews={calendarInterviews}
//         onEventClick={handleViewDetails}
//       />
//     )
//   )}
// </CardContent>
//     </Card>
//   </TabsContent>

//   {/* Tab 2: Past Interviews (Placeholder for now) */}
//  <TabsContent value="past">
//   <Card>
//     <CardHeader>
//       <CardTitle>Completed Interview History</CardTitle>
//     </CardHeader>
//     <CardContent>
//       {/* We use the new 'pastInterviews' state here */}
//       {loading ? (
//         <p>Loading interviews...</p>
//       ) : pastInterviews.length > 0 ? (
//         <div className="space-y-4">
//           {pastInterviews.map(interview => (
//             <InterviewListItem 
//               key={interview.id}
//               interview={interview}
//               onViewDetails={handleViewDetails}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <p className="text-muted-foreground">You have no past interviews.</p>
//         </div>
//       )}
//     </CardContent>
//   </Card>
// </TabsContent>
//           </Tabs>
//         </div>
//       </DashboardLayout>

//       {/* --- Existing Modals --- */}
//       <InterviewDetailModal
//         interviewId={viewingInterviewId}
//         open={!!viewingInterviewId}
//         onOpenChange={(isOpen) => !isOpen && setViewingInterviewId(null)}
//         onViewJob={(jobId) => setViewingJobId(jobId)}
//       />
//       <ViewJobModal
//         jobId={viewingJobId}
//         open={!!viewingJobId}
//         onOpenChange={(isOpen) => !isOpen && setViewingJobId(null)}
//       />

//       {/* --- NEW: The Availability Selector Modal --- */}
//       <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
//         <DialogContent className="max-w-4xl">
//           <DialogHeader>
//             <DialogTitle>Set Your Weekly Availability</DialogTitle>
//             <DialogDescription>
//               Select the 1-hour slots where you are free. This schedule will be shown to candidates and recruiters.
//             </DialogDescription>
//           </DialogHeader>
//            {isAvailabilityModalOpen && (
//               <AvailabilityManager
//                 key={new Date().getTime()}
//                 initialData={availabilityData}
//                 onSave={handleSaveAvailability}
//                 onClose={() => setIsAvailabilityModalOpen(false)}
//               />
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default InterviewerDashboard;



// // src/components/dashboards/InterviewerDashboard.tsx

// import { InterviewCalendar } from '@/components/interviewer/InterviewCalendar';
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// import { List, Calendar } from 'lucide-react';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/integrations/supabase/client';
// import { useEffect, useState } from 'react';
// import { InterviewListItem } from '@/components/interviewer/InterviewListItem'; // Import our new component
// import { InterviewDetailModal } from '@/components/modals/InterviewDetailModal';
// import { ViewJobModal } from '@/components/modals/ViewJobModal';
// import { AvailabilitySelector } from '@/components/ui/AvailabilitySelector';
// // Define the types for our data
// interface Interview {
//   id: string;
//   scheduled_at: string;
//   status: string;
//   job_title: string;
//   candidate_name: string;
//   round_type: string; // Add this
//   meeting_url: string | null; // Add this (can be null)
//    raw_scheduled_at: string; // Add this for calendar
//    isPast?: boolean; // Optional flag to identify past interviews

// }
// const InterviewerDashboard = () => {
//   const { profile } = useAuth();
//   const [interviews, setInterviews] = useState<Interview[]>([]);
//   const [loading, setLoading] = useState(true);
// // At the top of the InterviewerDashboard component
// const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);

// const [calendarInterviews, setCalendarInterviews] = useState<Interview[]>([]);
//   // We add state to manage which interview detail modal is open
//   const [viewingInterviewId, setViewingInterviewId] = useState<string | null>(null);

// const [viewingJobId, setViewingJobId] = useState<string | null>(null); // <-- Add this line
// // Inside the InterviewerDashboard component
// const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

//   useEffect(() => {
//     const fetchInterviews = async () => {
//       if (!profile) return;
//       setLoading(true);

//       // --- THIS IS THE CORRECTED, SAFE QUERY ---
//       // We are NOT doing the 'has_passed' comparison here anymore.
//       const { data, error } = await supabase
//         .from('interview_participants')
//         .select(`
//           id,
//           scheduled_at,
//           status,
//           meeting_url, 
//           interview_rounds ( round_type ),
//           job_applications (
//             jobs ( title ),
//             candidates ( first_name, last_name )
//           )
//         `)
//         .eq('interviewer_id', profile.id)
//         .order('scheduled_at', { ascending: true }); // Back to ascending for upcoming

//       if (error) {
//         console.error("Error fetching interviews:", error);
//         setLoading(false);
//         return;
//       }
  
//       const now = new Date();

//       const allFormattedInterviews = data.map(item => {
//         if (!item.job_applications?.jobs || !item.job_applications?.candidates) {
//           return null;
//         }

//         return {
//           id: item.id,
//           raw_scheduled_at: item.scheduled_at, // We need the raw date string for comparison
//           scheduled_at: new Date(item.scheduled_at).toLocaleString('en-US', {
//               dateStyle: 'full',
//               timeStyle: 'short',
//           }),
//           status: item.status,
//           meeting_url: item.meeting_url,
//           round_type: item.interview_rounds?.round_type || 'General',
//           job_title: item.job_applications.jobs.title || 'N/A',
//           candidate_name: `${item.job_applications.candidates.first_name || ''} ${item.job_applications.candidates.last_name || ''}`.trim()
//         };
//       }).filter(Boolean);

//       // Use the reliable JavaScript date comparison
//       const upcoming = allFormattedInterviews.filter(interview => 
//         interview!.status === 'scheduled' && new Date(interview!.raw_scheduled_at) >= now
//       );
//       const past = allFormattedInterviews.filter(interview => 
//         interview!.status !== 'scheduled' || new Date(interview!.raw_scheduled_at) < now
//       );

//       setInterviews(upcoming);
//       // Sort past interviews to show the most recent ones first
//       setPastInterviews(past.sort((a, b) => new Date(b.raw_scheduled_at).getTime() - new Date(a.raw_scheduled_at).getTime()));

//       const allCalendarEvents = [
//         ...upcoming.map(i => ({ ...i, isPast: false })),
//         ...past.map(i => ({ ...i, isPast: true })),
//       ];
//       setCalendarInterviews(allCalendarEvents);

//       setLoading(false);
//     };

//     fetchInterviews();
//   }, [profile]);


//   const handleViewDetails = (interviewId: string) => {
//     setViewingInterviewId(interviewId);
//     console.log("Should open modal for interview ID:", interviewId); // For testing
//   };

//   return (
//     <>
//       <DashboardLayout title="Interviewer Dashboard">
//         <div className="space-y-6">
//           <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-white">
//             <h1 className="text-3xl font-bold">My Upcoming Interviews</h1>
//             <p className="text-white/80">Here are the interviews you are scheduled to conduct.</p>
//           </div>

//          <Tabs defaultValue="upcoming" className="w-full">
//   <TabsList className="grid w-full grid-cols-2">
//     <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
//     <TabsTrigger value="past">Past Interviews</TabsTrigger>
//   </TabsList>

//   {/* Tab 1: Upcoming Interviews */}
//   <TabsContent value="upcoming">
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//   <CardTitle>Interview Schedule</CardTitle>
//   <ToggleGroup 
//     type="single" 
//     defaultValue="list" 
//     value={viewMode}
//     onValueChange={(value) => {
//       if (value) setViewMode(value as 'list' | 'calendar');
//     }}
//     aria-label="View mode"
//   >
//     <ToggleGroupItem value="list" aria-label="List view">
//       <List className="h-4 w-4" />
//     </ToggleGroupItem>
//     <ToggleGroupItem value="calendar" aria-label="Calendar view">
//       <Calendar className="h-4 w-4" />
//     </ToggleGroupItem>
//   </ToggleGroup>
// </CardHeader>
//       <CardContent>
//   {loading ? (
//     <p>Loading interviews...</p>
//   ) : (
//     // --- THIS IS THE NEW CONDITIONAL LOGIC ---
//     viewMode === 'list' ? (
//       // If viewMode is 'list', show our existing list component
//       interviews.length > 0 ? (
//         <div className="space-y-4">
//           {interviews.map(interview => (
//             <InterviewListItem 
//               key={interview.id} // <-- THIS IS THE FIX for the warning
//               interview={interview}
//               onViewDetails={handleViewDetails}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <p className="text-muted-foreground">You have no upcoming interviews scheduled.</p>
//         </div>
//       )
//     ) : (
//       // If viewMode is 'calendar', show our new calendar component
//       <InterviewCalendar 
//         interviews={calendarInterviews}
//         onEventClick={handleViewDetails}
//       />
//     )
//   )}
// </CardContent>
//     </Card>
//   </TabsContent>

//   {/* Tab 2: Past Interviews (Placeholder for now) */}
//  <TabsContent value="past">
//   <Card>
//     <CardHeader>
//       <CardTitle>Completed Interview History</CardTitle>
//     </CardHeader>
//     <CardContent>
//       {/* We use the new 'pastInterviews' state here */}
//       {loading ? (
//         <p>Loading interviews...</p>
//       ) : pastInterviews.length > 0 ? (
//         <div className="space-y-4">
//           {pastInterviews.map(interview => (
//             <InterviewListItem 
//               key={interview.id}
//               interview={interview}
//               onViewDetails={handleViewDetails}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <p className="text-muted-foreground">You have no past interviews.</p>
//         </div>
//       )}
//     </CardContent>
//   </Card>
// </TabsContent>
// </Tabs>
//         </div>
//       </DashboardLayout>

//       {/* --- Placeholder for our next component --- */}
      
//             <InterviewDetailModal
//       interviewId={viewingInterviewId}
//       open={!!viewingInterviewId}
//       onOpenChange={(isOpen) => !isOpen && setViewingInterviewId(null)}
//       onViewJob={(jobId) => setViewingJobId(jobId)} // <-- Pass the handler
//     />

//         <ViewJobModal
//     jobId={viewingJobId}
//     open={!!viewingJobId}
//     onOpenChange={(isOpen) => !isOpen && setViewingJobId(null)}
// />
     
//     </>
//   );
// };

// export default InterviewerDashboard;


// src/components/dashboards/InterviewerDashboard.tsx

// --- NEW: Import necessary components for the modal and availability selector ---
import { useState, useEffect ,useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { AvailabilitySelector } from '@/components/ui/AvailabilitySelector';
import { useToast } from '@/hooks/use-toast'; // Assuming useToast is available

import { InterviewCalendar } from '@/components/interviewer/InterviewCalendar';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Calendar ,CalendarDays } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { InterviewListItem } from '@/components/interviewer/InterviewListItem';
import { InterviewDetailModal } from '@/components/modals/InterviewDetailModal';
import { ViewJobModal } from '@/components/modals/ViewJobModal';




import { AvailabilityManager } from '@/components/ui/AvailabilityManager';
// Define the types for our data
interface Interview {
  id: string; // This will be the interview_schedules ID
  scheduled_at: string; // Formatted date for display
  raw_scheduled_at: string; // The original ISO string for date comparisons
  status: string;
  job_title: string;
  candidate_name: string;
  // These fields are no longer directly available in the new query
  // round_type: string; 
  meeting_urls: any; // The new field is a JSON object
  isPast?: boolean;
  duration_minutes: number;
}

const InterviewerDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast(); // --- NEW: Get the toast function ---
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);
  const [calendarInterviews, setCalendarInterviews] = useState<Interview[]>([]);
  const [viewingInterviewId, setViewingInterviewId] = useState<string | null>(null);
  const [viewingJobId, setViewingJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

   // --- NEW: State management for the availability feature ---
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);


// The state now holds the entire complex object, or null
const [availabilityData, setAvailabilityData] = useState<any | null>(null);


  // useEffect(() => {
  //   // ... existing useEffect hook to fetch interviews ...
  //   const fetchInterviews = async () => {
  //     if (!profile) return;
  //     setLoading(true);

  //     const { data, error } = await supabase
  //       .from('interview_participants')
  //       .select(`
  //         id, scheduled_at, status, meeting_url, 
  //         interview_rounds ( round_type ),
  //         job_applications (
  //           jobs ( title ),
  //           candidates ( first_name, last_name )
  //         )
  //       `)
  //       .eq('interviewer_id', profile.id)
  //       .order('scheduled_at', { ascending: true });

  //     if (error) {
  //       console.error("Error fetching interviews:", error);
  //       setLoading(false);
  //       return;
  //     }
  
  //     const now = new Date();
  //     const allFormattedInterviews = data.map(item => {
  //       if (!item.job_applications?.jobs || !item.job_applications?.candidates) {
  //         return null;
  //       }
  //       return {
  //         id: item.id,
  //         raw_scheduled_at: item.scheduled_at,
  //         scheduled_at: new Date(item.scheduled_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
  //         status: item.status,
  //         meeting_url: item.meeting_url,
  //         round_type: item.interview_rounds?.round_type || 'General',
  //         job_title: item.job_applications.jobs.title || 'N/A',
  //         candidate_name: `${item.job_applications.candidates.first_name || ''} ${item.job_applications.candidates.last_name || ''}`.trim()
  //       };
  //     }).filter(Boolean);

  //     const upcoming = allFormattedInterviews.filter(interview => 
  //       interview!.status === 'scheduled' && new Date(interview!.raw_scheduled_at) >= now
  //     );
  //     const past = allFormattedInterviews.filter(interview => 
  //       interview!.status !== 'scheduled' || new Date(interview!.raw_scheduled_at) < now
  //     );

  //     setInterviews(upcoming);
  //     setPastInterviews(past.sort((a, b) => new Date(b.raw_scheduled_at).getTime() - new Date(a.raw_scheduled_at).getTime()));
  //     const allCalendarEvents = [
  //       ...upcoming.map(i => ({ ...i, isPast: false })),
  //       ...past.map(i => ({ ...i, isPast: true })),
  //     ];
  //     setCalendarInterviews(allCalendarEvents);

  //     setLoading(false);
  //   };

  //   fetchInterviews();
  // }, [profile]);

  // DELETE the old useEffect and REPLACE it with this:
// In InterviewerDashboard.tsx, replace the existing useEffect with this one:
// In InterviewerDashboard.tsx


// const fetchInterviewerData = async () => {
  //     // We still check for profile to ensure the user is logged in
  //     if (!profile?.id) return;
  //     setLoading(true);
  
  //     try {
    //       // Call the database function directly. No RLS issues, no complex joins.
    //       // NOTE: This assumes you have already run the updated SQL to include duration_minutes.
    //       const { data, error } = await supabase.rpc('get_my_interviewer_schedules');
    
    //       if (error) {
      //         console.error("Error calling RPC function:", error);
      //         throw error;
      //       }
      
      //       // The data comes back perfectly formatted from the database.
      //       // Now, we just process it for display.
      //       const now = new Date();
      //       const allFormattedInterviews = data.map(item => ({
        //         id: item.interview_id,
        //         raw_scheduled_at: item.scheduled_at,
        //         scheduled_at: new Date(item.scheduled_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
//         status: item.status,
//         meeting_urls: item.meeting_urls,
//         job_title: item.job_title,
//         candidate_name: item.candidate_name,
//         duration_minutes: item.duration_minutes // <-- CHANGE #1: Add duration_minutes to the data map
//       })) as Interview[];

//       // --- START: CHANGE #2: Replace the filtering logic ---
//       const gracePeriodMinutes = 30; // Keep showing for 30 minutes after it should have ended

//       const upcoming = allFormattedInterviews.filter(interview => {
  //           const startTime = new Date(interview.raw_scheduled_at);
  //           const duration = interview.duration_minutes || 60; // Default to 60 mins if duration is null
  //           const endTime = new Date(startTime.getTime() + duration * 60000);
  //           const cutoffTime = new Date(endTime.getTime() + gracePeriodMinutes * 60000);
  
  //           // Show if it's scheduled AND the cutoff time (end + grace period) has not passed yet
  //           return interview.status === 'scheduled' && cutoffTime >= now;
  //       });
  
  //       const past = allFormattedInterviews.filter(interview => {
    //           const startTime = new Date(interview.raw_scheduled_at);
    //           const duration = interview.duration_minutes || 60;
    //           const endTime = new Date(startTime.getTime() + duration * 60000);
    //           const cutoffTime = new Date(endTime.getTime() + gracePeriodMinutes * 60000);
    
    //           // Show if it's NOT scheduled OR if the cutoff time has passed
    //           return interview.status !== 'scheduled' || cutoffTime < now;
    //       });
    //       // --- END: CHANGE #2 ---
    
    //       setInterviews(upcoming);
    //       setPastInterviews(past.sort((a, b) => new Date(b.raw_scheduled_at).getTime() - new Date(a.raw_scheduled_at).getTime()));
    //       setCalendarInterviews([
      //         ...upcoming.map(i => ({ ...i, isPast: false })),
      //         ...past.map(i => ({ ...i, isPast: true })),
      //       ]);
      
      //     } catch (err: any) {
        //       toast({ title: "Error Fetching Interviews", description: err.message, variant: "destructive" });
        //       console.error(err);
        //     } finally {
          //       setLoading(false);
          //     }
          // };
          
const fetchInterviewerData = useCallback( async () => {
    if (!profile?.id) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('get_my_interviewer_schedules');
      if (error) throw error;
      
      const allFormattedInterviews = data.map(item => ({
        id: item.interview_id,
        raw_scheduled_at: item.scheduled_at, // Crucial for accurate date comparisons
        scheduled_at: new Date(item.scheduled_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
        status: item.status,
        meeting_urls: item.meeting_urls,
        job_title: item.job_title,
        candidate_name: item.candidate_name,
        duration_minutes: item.duration_minutes
      })) as Interview[];

      const now = new Date();
      const gracePeriodMinutes = 30;
      
      // Correctly separate upcoming vs past
      const upcoming = allFormattedInterviews.filter(interview => {
        const startTime = new Date(interview.raw_scheduled_at);
        const duration = interview.duration_minutes || 60;
        const endTimeWithGrace = new Date(startTime.getTime() + (duration + gracePeriodMinutes) * 60000);
        return interview.status === 'scheduled' && endTimeWithGrace >= now;
      });
      
      const past = allFormattedInterviews.filter(interview => {
        const startTime = new Date(interview.raw_scheduled_at);
        const duration = interview.duration_minutes || 60;
        const endTimeWithGrace = new Date(startTime.getTime() + (duration + gracePeriodMinutes) * 60000);
        return interview.status !== 'scheduled' || endTimeWithGrace < now;
      });
      
      setInterviews(upcoming);
      setPastInterviews(past.sort((a, b) => new Date(b.raw_scheduled_at).getTime() - new Date(a.raw_scheduled_at).getTime()));
      
      // The calendar should receive ALL interviews
      const allCalendarEvents = allFormattedInterviews.map(interview => {
        const startTime = new Date(interview.raw_scheduled_at);
        const duration = interview.duration_minutes || 60;
        const endTime = new Date(startTime.getTime() + duration * 60000);
        return { ...interview, isPast: endTime < now };
      });
      setCalendarInterviews(allCalendarEvents);
      
    } catch (err: any) {
      toast({ title: "Error Fetching Interviews", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
}, [profile, supabase, toast]);

useEffect(() => {
    // Fetch the initial data when the component mounts
    fetchInterviewerData();
},[fetchInterviewerData]);



const refetchData = useCallback(() => {
    fetchInterviewerData();
}, [profile, supabase, toast]); 


  const handleViewDetails = (interviewId: string) => {
    setViewingInterviewId(interviewId);
  };


   const handleOpenAvailabilityModal = async () => {
    setIsFetchingSlots(true);
    try {
      console.log("Fetching existing availability from the database...");
      const { data, error } = await supabase.rpc('get_my_availability');
      if (error) throw error;
       console.log("Successfully fetched data:", data);
      // setAvailabilitySlots(data || []);
            setAvailabilityData({ availability: data }); // Wrap it to match the expected structure
      setIsAvailabilityModalOpen(true);
    } catch (error: any) {
      toast({ title: "Could not load schedule", description: error.message, variant: "destructive" });
    } finally {
      setIsFetchingSlots(false);
    }
  };

  // --- NEW: Handler function to save the availability ---
 const handleSaveAvailability = async (updatedData: any) => {
    try {
      const { error } = await supabase.rpc('update_user_availability', { new_slots: updatedData });
      if (error) throw error;
      toast({ title: "Availability Saved!", description: "Your schedule has been updated." });
      setIsAvailabilityModalOpen(false);
    } catch (error: any) {
      toast({ title: "Error Saving Schedule", description: error.message, variant: "destructive" });
    }
  };


  return (
    <>
      <DashboardLayout title="Interviewer Dashboard">
        <div className="space-y-6">
          {/* --- MODIFIED: Hero section now includes the new button --- */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">My Upcoming Interviews</h1>
              <p className="text-white/80">Here are the interviews you are scheduled to conduct.</p>
            </div>
             <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white shrink-0"
              onClick={handleOpenAvailabilityModal}
              disabled={isFetchingSlots}
            >
              {isFetchingSlots ? (
                'Loading...'
              ) : (
                <>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Set My Availability
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
              <TabsTrigger value="past">Past Interviews</TabsTrigger>
            </TabsList>

             {/* Tab 1: Upcoming Interviews */}
  <TabsContent value="upcoming">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
  <CardTitle>Interview Schedule</CardTitle>
  <ToggleGroup 
    type="single" 
    defaultValue="list" 
    value={viewMode}
    onValueChange={(value) => {
      if (value) setViewMode(value as 'list' | 'calendar');
    }}
    aria-label="View mode"
  >
    <ToggleGroupItem value="list" aria-label="List view">
      <List className="h-4 w-4" />
    </ToggleGroupItem>
    <ToggleGroupItem value="calendar" aria-label="Calendar view">
      <Calendar className="h-4 w-4" />
    </ToggleGroupItem>
  </ToggleGroup>
</CardHeader>
      <CardContent>
  {loading ? (
    <p>Loading interviews...</p>
  ) : (
    // --- THIS IS THE NEW CONDITIONAL LOGIC ---
    viewMode === 'list' ? (
      // If viewMode is 'list', show our existing list component
      interviews.length > 0 ? (
        <div className="space-y-4">
          {interviews.map(interview => (
            <InterviewListItem 
              key={interview.id} // <-- THIS IS THE FIX for the warning
              interview={interview}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You have no upcoming interviews scheduled.</p>
        </div>
      )
    ) : (
      // If viewMode is 'calendar', show our new calendar component
      <InterviewCalendar 
        interviews={calendarInterviews}
        onEventClick={handleViewDetails}
      />
    )
  )}
</CardContent>
    </Card>
  </TabsContent>

  {/* Tab 2: Past Interviews (Placeholder for now) */}
 <TabsContent value="past">
  <Card>
    <CardHeader>
      <CardTitle>Completed Interview History</CardTitle>
    </CardHeader>
    <CardContent>
      {/* We use the new 'pastInterviews' state here */}
      {loading ? (
        <p>Loading interviews...</p>
      ) : pastInterviews.length > 0 ? (
        <div className="space-y-4">
          {pastInterviews.map(interview => (
            <InterviewListItem 
              key={interview.id}
              interview={interview}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You have no past interviews.</p>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>

      {/* --- Existing Modals --- */}
      <InterviewDetailModal
        interviewId={viewingInterviewId}
        open={!!viewingInterviewId}
        onOpenChange={(isOpen) => !isOpen && setViewingInterviewId(null)}
        onViewJob={(jobId) => setViewingJobId(jobId)}
        onFeedbackSubmitted={refetchData}
      />
      <ViewJobModal
        jobId={viewingJobId}
        open={!!viewingJobId}
        onOpenChange={(isOpen) => !isOpen && setViewingJobId(null)}
      />

      {/* --- NEW: The Availability Selector Modal --- */}
      <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Set Your Weekly Availability</DialogTitle>
            <DialogDescription>
              Select the 1-hour slots where you are free. This schedule will be shown to candidates and recruiters.
            </DialogDescription>
          </DialogHeader>
           {isAvailabilityModalOpen && (
              <AvailabilityManager
                key={new Date().getTime()}
                initialData={availabilityData}
                onSave={handleSaveAvailability}
                onClose={() => setIsAvailabilityModalOpen(false)}
              />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InterviewerDashboard;
