import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import MarkdownPreview from '@/components/ui/MarkdownPreview'; // <-- ADD THIS IMPORT

import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// At the top of your Jobs.tsx file, outside the component

// This function takes a markdown string and returns clean text
const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  // This regular expression finds and replaces common markdown syntax
  return markdown
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
    .replace(/(\*|_)(.*?)\1/g, '$2')   // Italic
    .replace(/#+\s/g, '')              // Headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Code
    .replace(/(\r\n|\n|\r)/gm, " ")     // Line breaks
    .replace(/\s+/g, ' ')               // Multiple spaces
    .trim();
};


const Jobs = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
   const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchPublishedJobs();
  }, []);

  useEffect(() => {
    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [jobs, searchTerm]);

  const fetchPublishedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error loading jobs",
        description: "Could not fetch available jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleApply = async (jobId: string) => {
  //   if (!profile?.id) {
  //     toast({
  //       title: "Authentication required",
  //       description: "Please log in to apply for jobs",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     // First, get the candidate ID from the candidates table
  //     const { data: candidateData, error: candidateError } = await supabase
  //       .from('candidates')
  //       .select('id')
  //       .eq('user_id', profile.id)
  //       .single();

  //     if (candidateError || !candidateData) {
  //       toast({
  //         title: "Profile required",
  //         description: "Please complete your candidate profile first",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     // Check if user already applied
  //     const { data: existingApplication } = await supabase
  //       .from('job_applications')
  //       .select('id')
  //       .eq('job_id', jobId)
  //       .eq('candidate_id', candidateData.id)
  //       .single();

  //     if (existingApplication) {
  //       toast({
  //         title: "Already applied",
  //         description: "You have already applied for this job",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     // Create job application
  //     const { error } = await supabase
  //       .from('job_applications')
  //       .insert({
  //         job_id: jobId,
  //         candidate_id: candidateData.id,
  //         status: 'applied'
  //       });

  //     if (error) throw error;

  //     toast({
  //       title: "Application submitted!",
  //       description: "Your application has been sent successfully",
  //     });
  //   } catch (error) {
  //     console.error('Error applying for job:', error);
  //     toast({
  //       title: "Application failed",
  //       description: "Could not submit your application",
  //       variant: "destructive",
  //     });
  //   }
  // };


  const handleApply = async (jobId: string) => {
  if (!profile?.id) {
    toast({ title: "Authentication required" });
    return;
  }

  console.log("--- Starting Application Process ---");
  console.log("User profile ID:", profile.id);
  console.log("Applying for Job ID:", jobId);

  setApplying(true); // Assuming you have this state
  try {
    // --- STEP 1: Get Candidate ID ---
    console.log("Step 1: Fetching candidate record...");
    const { data: candidateData, error: candidateError } = await supabase
      .from('candidates')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (candidateError) {
      console.error("ERROR in Step 1 (Fetching Candidate):", candidateError);
      throw new Error("Could not find your candidate profile. Please complete it first.");
    }
    if (!candidateData) {
      throw new Error("No candidate record found for your profile.");
    }
    
    const candidateId = candidateData.id;
    console.log("Step 1 SUCCESS. Found Candidate ID:", candidateId);

    // --- STEP 2: Check for Existing Application ---
    console.log("Step 2: Checking for existing application...");
    // const { data: existingApplication, error: checkError } = await supabase
    //   .from('job_applications')
    //   .select('id')
    //   .eq('job_id', jobId)
    //   .eq('candidate_id', candidateId)
    //   .maybeSingle(); // Use maybeSingle() to handle no result gracefully

          const { data: existingApplication, error: checkError } = await supabase.rpc('check_if_already_applied', {
          p_job_id: jobId
        });
        
    if (checkError) {
      console.error("ERROR in Step 2 (Checking Application):", checkError);
      throw new Error("Could not check for existing applications.");
    }

    if (existingApplication) {
      console.log("Step 2 COMPLETE. Application already exists.");
      toast({ title: "Already Applied", description: "You have already applied for this job." });
      setApplying(false); // Make sure to stop loading
      return;
    }
    console.log("Step 2 SUCCESS. No existing application found.");

    // --- STEP 3: Insert New Application ---
    console.log("Step 3: Inserting new application...");
    const { error: insertError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        candidate_id: candidateId,
        status: 'applied'
      });

    if (insertError) {
      console.error("ERROR in Step 3 (Inserting Application):", insertError);
      throw insertError;
    }

    console.log("Step 3 SUCCESS. Application submitted!");
    toast({ title: "Application Submitted!" });

  } catch (error: any) {
    console.error('--- APPLICATION PROCESS FAILED ---', error);
    toast({
      title: "Application Failed",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setApplying(false);
  }
};

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    if (min) return `From ${min.toLocaleString()} ${currency}`;
    if (max) return `Up to ${max.toLocaleString()} ${currency}`;
    return 'Competitive salary';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading available jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
              <p className="text-gray-600 mt-1">Discover your next career opportunity</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="max-w-6xl mx-auto p-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No jobs are currently published'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Building2 className="w-4 h-4 mr-1" />
                        {job.companies?.name || 'Company'}
                      </div>
                      {job.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                          {job.remote_allowed && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Remote OK
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Salary */}
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatSalary(job.salary_min, job.salary_max, job.currency || 'IDR')}
                    </div>

                    {/* Employment Type & Experience */}
                    <div className="flex items-center gap-2 text-sm">
                      {job.employment_type && (
                        <Badge variant="outline" className="capitalize">
                          {job.employment_type.replace('_', ' ')}
                        </Badge>
                      )}
                      {job.experience_level && (
                        <Badge variant="outline" className="capitalize">
                          {job.experience_level} Level
                        </Badge>
                      )}
                    </div>

                    {/* Posted Date */}
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>

                    {/* Skills */}
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills_required.slice(0, 3).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.skills_required.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Description Preview */}
                {/* // --- THE FINAL, CORRECTED CODE --- */}
{job.description && (
  <div className="text-sm text-gray-600 line-clamp-2">
    <MarkdownPreview content={job.description} truncate={120} />
  </div>
)}

                    {/* Apply Button */}
                    <div className="pt-3 flex gap-2">
                      <Button 
                        onClick={() => handleApply(job.id)} 
                        className="flex-1"
                        disabled={!profile?.id}
                      >
                        Apply Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    {!profile?.id && (
                      <p className="text-xs text-gray-500 text-center">
                        Please log in to apply for jobs
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;