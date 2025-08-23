import { useState, useEffect } from 'react';

import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2,
  ArrowLeft,
  Users,
  Calendar,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry,
            description
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast({
        title: "Error loading job",
        description: "Could not fetch job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

const handleApply = async (jobId: string) => {
  // 1. Guard Clause: Ensure a user is logged in.
  if (!profile?.id) {
    toast({
      title: "Authentication Required",
      description: "Please log in to apply for jobs.",
      variant: "warning",
    });
    return;
  }

  setApplying(true);
  try {
    // 2. Fetch the Candidate's ID from the `candidates` table.
    // This step is REQUIRED by the database foreign key on `job_applications`.
    // It is PERMITTED by "Policy #2: Candidates can view their own candidate profile".
    const { data: candidateData, error: candidateError } = await supabase
      .from('candidates')
      .select('id,resume_url')
      .eq('profile_id', profile.id)
      .single();

    if (candidateError || !candidateData) {
      // This is a critical failure, as the user lacks a candidate-specific record.
      throw new Error("Your candidate record could not be found. Please complete your profile first.");
    }


     if (!candidateData.resume_url) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume to your profile before applying.",
        variant: "destructive",
      });
      // Guide the user to the page where they can upload their resume.
      navigate('/profile'); // Or '/profile', etc.
      setApplying(false); // Reset the button state
      return; // Stop the application process
    }

    const candidateId = candidateData.id;

    // 3. Prevent Duplicate Applications.
    // This is a simple check to improve user experience.
    // const { data: existingApplication, error: checkError } = await supabase
    //   .from('job_applications')
    //   .select('id')
    //   .eq('job_id', jobId)
    //   .eq('candidate_id', candidateId)
    //   .maybeSingle(); 
        const { data: existingApplication, error: checkError } = await supabase.rpc('check_if_already_applied', {
      p_job_id: jobId
    });
    
    if (checkError) throw checkError; // If this check fails, something is wrong.

    if (existingApplication) {
      toast({ title: "Already Applied", description: "You have already applied for this job." });
      return; // Stop the function here.
    }

    // 4. Insert the New Application.
    // This is the final step that was previously failing.
    // It will now SUCCEED because it satisfies all conditions of "Policy #3".
    const { error: insertError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        candidate_id: candidateId, // Satisfies the foreign key and the RLS subquery.
        status: 'applied'
      });

    // If an error exists after the insert attempt, throw it to the catch block.
    if (insertError) throw insertError;

    // 5. Success!
    toast({
      title: "Application Submitted!",
      description: "Your application has been sent successfully.",
    });

  } catch (error: any) {
    // This single catch block handles any error from the steps above.
    console.error('Error during the application process:', error);
    toast({
        title: "Application Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
    });
  } finally {
    // Ensure the loading state is always turned off, even if there's an error.
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
            <p className="text-gray-600">The job you're looking for doesn't exist or is no longer available</p>
            <Button onClick={() => navigate('/jobs')} className="mt-4">
              Browse Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => navigate('/jobs')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {job.companies?.name}
                </div>
                {job.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                    {job.remote_allowed && (
                      <Badge variant="secondary" className="ml-2">
                        Remote OK
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {job.total_positions} position{job.total_positions !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Button 
                // onClick={handleApply} 
                onClick={() => handleApply(job.id)} 
                disabled={!profile?.id || applying}
                className="mb-2"
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </Button>
              {!profile?.id && (
                <p className="text-xs text-gray-500">Please log in to apply</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {job.description ? (
                    <div className="whitespace-pre-wrap">{job.description}</div>
                  ) : (
                    <p className="text-gray-500">No description provided</p>
                  )}
                </div>
              </CardContent>
            </Card> */}
            {/* // --- THE FINAL, CORRECTED CODE --- */}
<Card>
  <CardHeader>
    <CardTitle>Job Description</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="prose max-w-none">
      {job.description ? (
        // Use the MarkdownRenderer component and pass the description as a prop
        <MarkdownRenderer content={job.description} /> 
      ) : (
        <p className="text-gray-500">No description provided</p>
      )}
    </div>
  </CardContent>
</Card>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {job.requirements.map((req: string, index: number) => (
                      <li key={index} className="text-gray-700">{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.skills_required && job.skills_required.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {formatSalary(job.salary_min, job.salary_max, job.currency || 'IDR')}
                  </span>
                </div>
                
                {job.employment_type && (
                  <div className="flex items-center text-sm">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="capitalize">{job.employment_type.replace('_', ' ')}</span>
                  </div>
                )}
                
                {job.experience_level && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="capitalize">{job.experience_level} Level</span>
                  </div>
                )}

                {job.expires_at && (
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Expires {new Date(job.expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.companies && (
              <Card>
                <CardHeader>
                  <CardTitle>About the Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold">{job.companies.name}</h4>
                    {job.companies.industry && (
                      <p className="text-sm text-gray-600">Industry: {job.companies.industry}</p>
                    )}
                    {job.companies.description && (
                      <p className="text-sm text-gray-700">{job.companies.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;