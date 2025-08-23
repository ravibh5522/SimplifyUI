import { useState, useEffect,useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import { ApplicationDetailModal } from '@/components/modals/ApplicationDetailModal';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Briefcase, 
  Calendar, 
  FileText,
  Filter,
  Clock,
  MapPin,
  Building,
  Star,
  Upload,
  MoreHorizontal,
  DollarSign,
  CalendarDays,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { AvailabilitySelector } from '@/components/ui/AvailabilitySelector';
import { EnhancedAvailabilitySelector } from '@/components/ui/EnhancedAvailabilitySelector';
import DetailedViewModal from '@/components/modals/DetailedViewModal';
import { CandidateDetailModal } from '@/components/modals/CandidateDetailModal';
import { PaginationControls } from '../ui/PaginationControls';
// import { useCandidateViewData } from '@/components/modals/DetailedViewModal/hooks/useCandidateViewData';
// --- INTEGRATION STEP 2: Define the types needed for our new component's data structure. ---
// interface SlotRange {
//   start: string;
//   end: string;
// }

interface AvailabilityObject {
  free_slots: any[];
  occupied_slots: any[];
}


const CandidateDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
// const [viewingAppId, setViewingAppId] = useState<string | null>(null);

 const [detailModal, setDetailModal] = useState<{
    type: 'my-applications' | 'in-review' | 'my-interviews';
    open: boolean;
    title: string;
  }>({
    type: 'my-applications',
    open: false,
    title: ''
  });

    const [modalKey, setModalKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    applications: 0,
    inReview: 0,
    interviews: 0,
    profileViews: 0
  });
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]); // <-- ADD THIS LINE

  // const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);


  const [availabilityData, setAvailabilityData] = useState<AvailabilityObject[] | null>(null);
 const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
   const [isFetchingSlots, setIsFetchingSlots] = useState(false);


    const [mainListSearchTerm, setMainListSearchTerm] = useState('');
  const [mainListCurrentPage, setMainListCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5; // Let's show 5 applications per page on the dashboard


  useEffect(() => {
    if (profile?.id) {
      fetchCandidateData();
    }
  }, [profile]);


  const { paginatedApplications, totalPages } = useMemo(() => {
    let processedData = [...applications];

    if (mainListSearchTerm) {
        const lowercasedTerm = mainListSearchTerm.toLowerCase();
        processedData = processedData.filter(app => {
            const title = app.jobs?.title?.toLowerCase() || '';
            const company = app.jobs?.companies?.name?.toLowerCase() || '';
            return title.includes(lowercasedTerm) || company.includes(lowercasedTerm);
        });
    }
    
    const calculatedTotalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);

    const startIndex = (mainListCurrentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { paginatedApplications: paginatedItems, totalPages: calculatedTotalPages };
}, [applications, mainListSearchTerm, mainListCurrentPage]);

  //  const paginatedApplications = useMemo(() => {
  //   let processedData = [...applications];

  //   // First, apply the search filter
  //   if (mainListSearchTerm) {
  //     const lowercasedTerm = mainListSearchTerm.toLowerCase();
  //     processedData = processedData.filter(app => {
  //       // You can define what's searchable here
  //       const title = app.jobs?.title?.toLowerCase() || '';
  //       const company = app.jobs?.companies?.name?.toLowerCase() || '';
  //       return title.includes(lowercasedTerm) || company.includes(lowercasedTerm);
  //     });
  //   }

  //   // Then, calculate pagination on the filtered data
  //   const startIndex = (mainListCurrentPage - 1) * ITEMS_PER_PAGE;
  //   return processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  // }, [applications, mainListSearchTerm, mainListCurrentPage]);

  // // We also need the total page count for the pagination controls
  // const totalPages = useMemo(() => {
  //    // This calculation must also be based on the filtered list
  //   let processedData = [...applications];
  //   if (mainListSearchTerm) {
  //       const lowercasedTerm = mainListSearchTerm.toLowerCase();
  //       processedData = processedData.filter(app => {
  //           const title = app.jobs?.title?.toLowerCase() || '';
  //           const company = app.jobs?.companies?.name?.toLowerCase() || '';
  //           return title.includes(lowercasedTerm) || company.includes(lowercasedTerm);
  //       });
  //   }
  //   return Math.ceil(processedData.length / ITEMS_PER_PAGE);
  // }, [applications, mainListSearchTerm]);



// TO THIS (Functional update form)
const openDetailModal = (type: 'my-applications' | 'in-review' | 'my-interviews', title: string) => {
  console.log("Requesting modal state update to:", { type, open: true, title });
  // setDetailModal(prevState => ({ ...prevState, type, open: true, title }));
   setDetailModal({ type, open: true, title });

    setModalKey(prevKey => prevKey + 1);
};

const fetchCandidateData = async () => {
    if (!profile?.id) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {

        // 1. Fetch the interview data using our smart DB function.
        const { data: interviewsData, error: interviewsError } = await supabase.rpc('get_my_scheduled_interviews');
        if (interviewsError) {
            console.error("Error fetching upcoming interviews:", interviewsError);
            // We don't throw an error here, so the rest of the dashboard can still load.
        } else if (interviewsData) {
            // 2. Filter for only the truly "upcoming" interviews.
            // const now = new Date();
            // const upcoming = interviewsData.filter(interview =>
            //     interview.status === 'scheduled' && new Date(interview.scheduled_at) >= now
            // );
            // setUpcomingInterviews(upcoming);
                        const now = new Date();
            const gracePeriodMinutes = 15; // Keep showing the interview for 15 minutes after it ends.

            const upcoming = interviewsData.filter(interview => {
                const startTime = new Date(interview.scheduled_at);
                const duration = interview.duration_minutes || 60; // Default to 60 mins if not set
                const endTime = new Date(startTime.getTime() + duration * 60000);
                const cutoffTime = new Date(endTime.getTime() + gracePeriodMinutes * 60000);
                
                // Show if it's scheduled and the cutoff time hasn't passed yet
                return interview.status === 'scheduled' && cutoffTime >= now;
            });
            setUpcomingInterviews(upcoming);
        }
        // --- END: ADD THIS NEW CODE BLOCK ---

        console.log(`Fetching candidate applications for user ${profile.id} via RPC...`);
         const { data: count, error: countError } = await supabase.rpc('get_my_interview_count');
        if (countError) {
            console.error("Error fetching interview count:", countError);
            // Don't throw an error, just default to 0 so the page can still load
        }
        // --- THIS IS THE FINAL FIX ---
        // We now call our single, powerful RPC function.
        const { data: applicationsData, error } = await supabase.rpc('get_my_applications');

        if (error) {
            console.error("Error calling RPC get_my_applications:", error);
            throw error;
        }

        console.log('Successfully fetched application data via RPC:', applicationsData);

        if (applicationsData) {
            setApplications(applicationsData);
            
            // Your stats calculation will now work perfectly with the RPC data.
            const totalApps = applicationsData.length;
            const inReview = applicationsData.filter(app => ['selected', 'screening', 'interview'].includes(app.status)).length;
            // const interviews = applicationsData.filter(app => app.status === 'interview').length;
            
            setStats({
                applications: totalApps,
                inReview,
                interviews: count || 0,
                profileViews: 24 // Mock
            });
        }

        // ... (your AI recommendation logic can remain the same)
     // Get AI-powered job recommendations
      const { data: recommendedJobs, error: recommendError } = await supabase.functions.invoke('recommend-jobs', {
        body: { userId: profile.id }
      });

      if (recommendError) {
        console.error('Error fetching AI recommendations:', recommendError);
        // Fallback to regular job fetching
        const { data: fallbackJobs, error: fallbackError } = await supabase
          .from('jobs')
          .select(`
            *,
            companies (name, logo_url)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(6);

        if (!fallbackError) {
          setRecommendedJobs(fallbackJobs || []);
        }
      } else {
        setRecommendedJobs(recommendedJobs || []);
      }

    } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
            title: "Failed to load your applications",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
};

 const handleOpenAvailabilityModal = async () => {
   setIsAvailabilityModalOpen(true);
    setIsFetchingSlots(true);
    setAvailabilityData(null);

    try {
      console.log("1. Fetching schedule...");
      // Fetch the latest slots from the DB just before opening the modal
      const { data, error } = await supabase.rpc('get_my_availability');
      
      if (error) {
         console.error("2. ERROR from get_my_availability:", error);
         throw error;
        }

         console.log("2. SUCCESS. Raw data from DB:", data);
      
      // C. Set the fetched data into the correct state variable.
      setAvailabilityData(data || []); // Ensure it's an array even if data is null// Open modal only after data is fetched
    } catch (error: any) {
      toast({ title: "Could not load schedule", description: error.message, variant: "destructive" });
    } finally {
      setIsFetchingSlots(false);
    }
  };


// --- MODIFIED: Handler to save the availability to the user's PROFILE ---
 const handleSaveAvailability = async (updatedRanges: AvailabilityObject[]) => {
     try {
         console.log("Saving these ranges to the database:", updatedRanges);
      // The save logic remains the same, calling our "setter" RPC
      const { error } = await supabase.rpc('update_user_availability', { new_slots: updatedRanges });
      if (error) throw error;

      toast({ title: "Availability Saved!", description: "Your schedule has been updated." });
      setIsAvailabilityModalOpen(false); // Close the modal on success
    } catch (error: any) {
      toast({ title: "Error Saving Schedule", description: error.message, variant: "destructive" });
    }
  };

  const dashboardActions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
      <Button 
        variant="hero" 
        size="sm"
        onClick={() => navigate('/jobs')}
      >
        <Search className="w-4 h-4 mr-2" />
        Find Jobs
      </Button>
    </div>
  );

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  
  // --- START: THIS IS THE NEW LOGIC THAT CONNECTS EVERYTHING ---

  // 1. We call the NEW hook dedicated to the candidate's modal.
  // const {
  //   filteredData,
  //   loading: modalLoading, // Rename to avoid conflict with dashboard's `loading` state
  //   searchTerm,
  //   filterValue,
  //   setSearchTerm,
  //   setFilterValue,
  // } = useCandidateViewData(
  //   detailModal.type,
  //   detailModal.open,
  //   applications,
  //   // This logic you wrote is perfect for passing pre-filtered data.
  //   detailModal.type === 'my-applications'
  //     ? applications
  //   : detailModal.type === 'in-review'
  //     ? applications.filter(app => ['applied', 'screening', 'interview', 'selected'].includes(app.status)) // Updated statuses
  //   : undefined
  // );
  
  // --- END: NEW LOGIC ---
  //  useEffect(() => {
  //   if (detailModal.open) {
  //     console.log('--- MODAL DATA VERIFICATION ---');
  //     console.log('Modal Type:', detailModal.type);
  //     console.log('Data being passed to modal:', filteredData);
  //     console.log('Total Records:', filteredData.length);
  //     console.log('-----------------------------');
  //   }
  // }, [filteredData, detailModal.open, detailModal.type]);

  return (
    <>
    <DashboardLayout title="Candidate Dashboard" actions={dashboardActions}>
      <div className="space-y-8 animate-fade-in">
        {/* Hero Section */}
{/* Hero Section */}
<div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-white">
  
  <div className="relative z-10 flex items-center justify-between">
    
    {/* Left Side Content */}
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome to your Candidate Dashboard! 🎯</h1>
      <p className="text-white/80 text-lg">Track your applications, prepare for interviews, and find your dream job.</p>
    </div>
    
    {/* --- THIS IS THE CORRECTED BUTTON --- */}
    {/* Right Side Content (The Button) */}
    <Button
      variant="outline"
      className="bg-white/10 hover:bg-white/20 border-white/20 text-white shrink-0"
      // 1. The onClick handler now correctly calls your data-fetching function
      onClick={handleOpenAvailabilityModal}
      // 2. The button is disabled while fetching to prevent multiple clicks
      disabled={isFetchingSlots}
    >
      {isFetchingSlots ? (
        'Loading Schedule...'
      ) : (
        // 3. The button shows the icon and text normally when not loading
        <>
          <CalendarDays className="w-4 h-4 mr-2" />
          Set My Availability
        </>
      )}
    </Button>

  </div>
  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
</div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card group animate-slide-up"  onClick={() => {
    // --- THIS IS THE TEST ---
    console.log("Applications card CLICKED!"); 
    openDetailModal('my-applications', 'My Submitted Applications');
  }} >
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Applications
                </div>
                <div className="text-3xl font-bold text-gradient-primary mb-1">
                  {stats.applications}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total submitted
                </p>
              </div>
              <div className="icon-wrapper text-blue-600 bg-gradient-primary">
                <FileText className="h-6 w-6 text-white relative z-10" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>

          <div className="stat-card group animate-slide-up" style={{ animationDelay: '100ms' }} onClick={() => openDetailModal('in-review', 'Applications In Review')}  >
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  In Review
                </div>
                <div className="text-3xl font-bold text-gradient-primary mb-1">
                  {stats.inReview}
                </div>
                <p className="text-xs text-muted-foreground">
                  Under consideration
                </p>
              </div>
              <div className="icon-wrapper text-yellow-600 bg-gradient-primary">
                <Clock className="h-6 w-6 text-white relative z-10" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>

          <div className="stat-card group animate-slide-up" style={{ animationDelay: '200ms' }} onClick={() => openDetailModal('my-interviews', 'My Scheduled Interviews')} >
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Interviews
                </div>
                <div className="text-3xl font-bold text-gradient-primary mb-1">
                  {stats.interviews}
                </div>
                <p className="text-xs text-muted-foreground">
                  Scheduled
                </p>
              </div>
              <div className="icon-wrapper text-purple-600 bg-gradient-primary">
                <Calendar className="h-6 w-6 text-white relative z-10" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>

          <div className="stat-card group animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Profile Views
                </div>
                <div className="text-3xl font-bold text-gradient-primary mb-1">
                  {stats.profileViews}
                </div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </div>
              <div className="icon-wrapper text-emerald-600 bg-gradient-primary">
                <Star className="h-6 w-6 text-white relative z-10" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Status */}
          {/* <div className="lg:col-span-2">
            <div className="card-premium">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gradient-primary">My Applications</h3>
                    <p className="text-muted-foreground">Track your job application progress</p>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {applications.length > 0 ? (
                    applications.map((application, index) => (
                      <div key={application.id} className="table-row-hover p-4 rounded-lg border border-border/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{application.jobs?.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                              <Building className="w-3 h-3" />
                              <span>{application.jobs?.companies?.name}</span>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{application.jobs?.location || 'Remote'}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                              <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                              {application.jobs?.salary_min && application.jobs?.salary_max && (
                                <span>Salary: {application.jobs.salary_min.toLocaleString()} - {application.jobs.salary_max.toLocaleString()} {application.jobs.currency}</span>
                              )}
                            </div>
                          </div>
                          <Badge className={getApplicationStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-4">No applications yet</p>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/jobs')}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Browse Jobs
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div> */}
          {/* // This is the new, complete section for "My Applications"
// It replaces the original block in your return statement. */}

<div className="lg:col-span-2">
  <div className="card-premium">
    <div className="p-6">
      <div className="flex items-center justify-between mb-4"> {/* Adjusted margin */}
        <div>
          <h3 className="text-xl font-semibold text-gradient-primary">My Applications</h3>
          <p className="text-muted-foreground">Track your job application progress</p>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* --- 1. SEARCH BAR --- */}
      {/* We add the search input here, right below the header. */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by job title or company..."
          value={mainListSearchTerm}
          onChange={(e) => {
            setMainListSearchTerm(e.target.value);
            setMainListCurrentPage(1); // Reset to page 1 whenever the user types
          }}
          className="pl-10"
        />
      </div>

      {/* --- 2. THE APPLICATION LIST --- */}
      <div className="space-y-4 min-h-[300px]"> {/* Added min-height to prevent layout shifts */}
        {/* We now map over the new `paginatedApplications` variable */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading applications...</div>
        ) : paginatedApplications.length > 0 ? (
          paginatedApplications.map((application) => (
            // Your existing card design is perfect and remains unchanged.
            <div key={application.id} className="table-row-hover p-4 rounded-lg border border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{application.jobs?.title}</h4>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                    <Building className="w-3 h-3" />
                    <span>{application.jobs?.companies?.name}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{application.jobs?.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                    <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                    {application.jobs?.salary_min && application.jobs?.salary_max && (
                      <span>Salary: {application.jobs.salary_min.toLocaleString()} - {application.jobs.salary_max.toLocaleString()} {application.jobs.currency}</span>
                    )}
                  </div>
                </div>
                <Badge className={getApplicationStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          // This "empty state" now handles both "no applications at all" and "no search results".
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              {mainListSearchTerm ? "No applications match your search." : "You haven't applied to any jobs yet."}
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/jobs')}
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </div>
        )}
      </div>

      {/* --- 3. THE PAGINATION CONTROLS --- */}
      {/* This component will only render if there is more than one page. */}
      <PaginationControls
        currentPage={mainListCurrentPage}
        totalPages={totalPages}
        onPageChange={setMainListCurrentPage}
      />
    </div>
  </div>
</div>

          {/* Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="card-premium">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gradient-primary">Profile Completion</h3>
                  <p className="text-muted-foreground">Complete your profile to get better matches</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
                    <span className="text-sm font-medium text-foreground">Basic Info</span>
                    <Badge className="bg-success text-success-foreground">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5">
                    <span className="text-sm font-medium text-foreground">Resume</span>
                    <Badge className="bg-success text-success-foreground">Uploaded</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
                    <span className="text-sm font-medium text-foreground">Skills</span>
                    <Badge className="bg-warning text-warning-foreground">Partial</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5">
                    <span className="text-sm font-medium text-foreground">Portfolio</span>
                    <Badge className="bg-destructive text-destructive-foreground">Missing</Badge>
                  </div>
                  
                  <div className="pt-4">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">75% Complete</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/profile')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="card-premium">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gradient-primary">Upcoming Interviews</h3>
                  <p className="text-muted-foreground">Don't miss your scheduled interviews</p>
                </div>
                {/* <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50">
                    <h4 className="font-medium text-foreground text-sm">Senior Frontend Developer</h4>
                    <p className="text-xs text-muted-foreground">TechInnovate</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Tomorrow, 2:00 PM</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Join Interview
                    </Button>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5 border border-border/50">
                    <h4 className="font-medium text-foreground text-sm">React Developer</h4>
                    <p className="text-xs text-muted-foreground">StartupHub</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Jan 25, 10:00 AM</span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      Pending Confirmation
                    </Button>
                  </div>
                </div> */}
                                <div className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-muted-foreground text-center">Loading...</p>
                  ) : upcomingInterviews.length > 0 ? (
                    // upcomingInterviews.map((interview) => (
                    //   <div key={interview.interview_id} className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50">
                    //     <h4 className="font-medium text-foreground text-sm">{interview.job_title}</h4>
                    //     <p className="text-xs text-muted-foreground">{interview.company_name}</p>
                    //     <div className="flex items-center space-x-2 mt-2">
                    //       <Calendar className="w-3 h-3 text-muted-foreground" />
                    //       <span className="text-xs text-muted-foreground">
                    //         {new Date(interview.scheduled_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    //       </span>
                    //     </div>
                    //     {/* You can add a "Join" or "Details" button here later if you wish */}
                    //     {/* <Button variant="outline" size="sm" className="w-full mt-2">View Details</Button> */}
                    //   </div>
                    // ))
                    // The final, correct version of the .map() function

                  upcomingInterviews.map((interview) => {
                    const now = new Date();
                    const startTime = new Date(interview.scheduled_at);
                    const duration = interview.duration_minutes || 60;
                    const endTime = new Date(startTime.getTime() + duration * 60000);
                    const isHappeningNow = startTime <= now && endTime >= now;

                    const joinableWindowStart = new Date(startTime.getTime() - 15 * 60000);
                    const joinableWindowEnd = new Date(endTime.getTime() + 15 * 60000);
                    
                    const showJoinButton = interview.meeting_urls?.primary && now >= joinableWindowStart && now <= joinableWindowEnd;

                    return (
                      <div 
                        key={interview.interview_id} 
                        // This adds a glowing effect if the interview is live
                        className={`p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border transition-all ${isHappeningNow ? 'border-green-500 shadow-lg shadow-green-500/10' : 'border-border/50'}`}
                      >
                        <h4 className="font-medium text-foreground text-sm">{interview.job_title}</h4>
                        <p className="text-xs text-muted-foreground">{interview.company_name}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(interview.scheduled_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          {isHappeningNow && <Badge variant="destructive">Live Now</Badge>}
                        </div>
                        
                        {/* {interview.meeting_urls?.primary && ( */}
                        {showJoinButton && (
                          <Button asChild variant={isHappeningNow ? "default" : "outline"} size="sm" className="w-full mt-2">
                            <a href={interview.meeting_urls.primary} target="_blank" rel="noopener noreferrer">
                              Join Interview
                            </a>
                          </Button>
                        )}
                      </div>
                    );
                  })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">You have no upcoming interviews.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="card-premium">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gradient-primary">AI-Powered Recommendations</h3>
                <p className="text-muted-foreground">Jobs matched to your skills and experience</p>
              </div>
              <Button 
                variant="hero"
                onClick={() => navigate('/jobs')}
              >
                View All Jobs
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.map((job, index) => (
                    <div key={job.id} className="table-row-hover p-4 rounded-lg border border-border/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{job.title}</h4>
                          {job.ai_score && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {job.ai_score}% Match
                              </Badge>
                              {job.ai_reason && (
                                <span className="text-xs text-muted-foreground">
                                  {job.ai_reason}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {job.ai_score ? 'AI Matched' : 'New'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Building className="w-3 h-3" />
                          <span>{job.companies?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location || 'Remote'}</span>
                        </div>
                        {job.salary_min && job.salary_max && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-medium text-foreground">
                              {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} {job.currency}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{job.employment_type || 'Full-time'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/jobs')}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No job recommendations available</p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/jobs')}
                    >
                      Browse All Jobs
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
     {/* --- THIS IS THE CRUCIAL PART THAT WAS MISSING --- */}
      {/* It renders the modal, which listens for the 'open' state to change. */}
      {/* <DetailedViewModal
      // key={modalKey}
        type={detailModal.type}
        open={detailModal.open}
        onOpenChange={(open) => setDetailModal(prevState => ({ ...prevState, open }))}
        title={detailModal.title}

  //       initialData={
  //   detailModal.type === 'my-applications' 
  //     ? applications 
    
  //   // --- THIS IS THE FINAL, CORRECTED LINE ---
  //   : detailModal.type === 'in-review' 
  //     ? applications.filter(app => ['applied', 'screening', 'interview'].includes(app.status))
  //   // We use the REAL statuses from your database enum.
    
  //   : undefined 
  // }
  data={filteredData} // The component expects a prop named 'data'
        loading={modalLoading}
        searchTerm={searchTerm}
        filterValue={filterValue}
        onSearchChange={setSearchTerm}
        // onFilterChange={setFilterValue}
      /> */}
      <CandidateDetailModal
        type={detailModal.type}
        open={detailModal.open}
        onOpenChange={(open) => setDetailModal(prevState => ({ ...prevState, open }))}
        title={detailModal.title}
      />

      {/* --- NEW: The Availability Selector Modal for Candidates --- */}
     {/* --- MODIFIED: The Availability Selector Modal is now simpler --- */}
      <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Set Your General Availability</DialogTitle>
              <DialogDescription>
                Select the 1-hour slots where you are generally free. Recruiters will use this schedule for any potential interviews.
              </DialogDescription>
            </DialogHeader>
            {/* every time the modal is opened. This is a robust pattern. */}
         {/* ============================================================ */}
            {/* --- 5. THE GUARANTEED FIX: CONDITIONAL RENDERING --- */}
            {/* We show a spinner while fetching, and ONLY render the child component when its data is ready. */}
            {/* This eliminates all timing and state synchronization bugs permanently. */}
            {/* ============================================================ */}
            {isFetchingSlots ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <EnhancedAvailabilitySelector
                // We no longer need the `key` prop because this component is only
                // rendered when `availabilityData` is ready.
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

export default CandidateDashboard;