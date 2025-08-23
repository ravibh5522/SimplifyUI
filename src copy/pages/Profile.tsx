import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Building, Phone, Loader2, Upload, FileText, Star } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { profile, updateProfile, updateRoleSpecificProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    company_name: profile?.company_name || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await updateProfile(formData);
      
      if (error) throw error;

      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // In pages/Profile.tsx

const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || !profile?.id) return;

  // ... (Your file type and size checks are perfect)

  setUploading(true);
  try {
    // 1. Upload the file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}/resume.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // 2. Decide what to do next based on the file type
    if (file.type === 'text/plain') {
      // If it's a text file, pass it to the AI analyzer.
      // The AI analyzer will be responsible for the database update.
      const fileText = await file.text();
      await analyzeResumeWithAI(fileText, publicUrl);
    } else {
      // If it's any other allowed file type (PDF, DOCX),
      // just update the database with the file's URL.
      const { error } = await updateRoleSpecificProfile({ resume_url: publicUrl });
      if (error) throw error;
      
      toast({
        title: "Resume Uploaded!",
        description: "Your new resume has been saved to your profile.",
      });
    }
  } catch (error: any) {
    console.error('Error uploading resume:', error);
    toast({
      title: "Upload Failed",
      description: error.message || "An unexpected error occurred.",
      variant: "destructive",
    });
  } finally {
    setUploading(false);
  }
};


const analyzeResumeWithAI = async (resumeText: string, resumeUrl: string) => {
  setAnalyzing(true);
  try {
    const { data, error: functionError } = await supabase.functions.invoke('analyze-resume', {
      body: { resumeText }
    });

    if (functionError) throw functionError;

    // Prepare a single object with ALL the updates
    const updates = {
      resume_url: resumeUrl, // The URL from the upload
      resume_text: resumeText, // The text content
      skills: data.skills, // AI data
      experience_years: data.experience_years, // AI data
      ai_summary: data.summary, // AI data
      ai_score: data.score // AI data
    };

    // Make ONE database call to save everything
    const { error: updateError } = await updateRoleSpecificProfile(updates);
    if (updateError) throw updateError;

    toast({
      title: "Resume Analyzed & Saved!",
      description: `Your profile has been updated with AI insights. Score: ${data.score}/100`,
    });
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    toast({
      title: "Analysis Failed",
      description: error.message || "The AI analysis could not be completed.",
      variant: "destructive",
    });
  } finally {
    setAnalyzing(false);
  }
};

  // const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file || !profile?.id) return;

  //   // Check file type
  //   const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  //   if (!allowedTypes.includes(file.type)) {
  //     toast({
  //       title: "Invalid file type",
  //       description: "Please upload a PDF, DOC, DOCX, or TXT file",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Check file size (max 10MB)
  //   if (file.size > 10 * 1024 * 1024) {
  //     toast({
  //       title: "File too large",
  //       description: "Please upload a file smaller than 10MB",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setUploading(true);
  //   try {
  //     // Upload file to storage
  //     const fileExt = file.name.split('.').pop();
  //     const fileName = `${profile.id}/resume.${fileExt}`;
      
  //     const { error: uploadError } = await supabase.storage
  //       .from('resumes')
  //       .upload(fileName, file, {
  //         upsert: true
  //       });

  //     if (uploadError) throw uploadError;

  //     // Get the file URL
  //     const { data: { publicUrl } } = supabase.storage
  //       .from('resumes')
  //       .getPublicUrl(fileName);

  //        const { error } = await updateRoleSpecificProfile({ resume_url: publicUrl });


  //     // If it's a text file, read content for AI analysis
  //     if (file.type === 'text/plain') {
  //       const fileText = await file.text();
  //       // The AI function will handle the database update.
  //       await analyzeResumeWithAI(fileText, publicUrl);
  //     } else {
  //       // For non-text files, just update the URL.
  //       const { error } = await updateRoleSpecificProfile({ resume_url: publicUrl });
  //       if (error) throw error;
  //       toast({ title: "Resume uploaded successfully" });
  //     }
  //   } catch (error: any) {
  //     console.error('Error uploading resume:', error);
  //     toast({
  //       title: "Upload failed",
  //       description: error.message || "Failed to upload resume",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // const analyzeResumeWithAI = async (resumeText: string, resumeUrl?: string) => {
  //   setAnalyzing(true);
  //   try {
  //     const { data, error } = await supabase.functions.invoke('analyze-resume', {
  //       body: { resumeText }
  //     });

  //     if (error) throw error;

  //     // Update candidate profile with AI analysis
  //     const updates: any = {
  //       resume_text: resumeText,
  //       skills: data.skills,
  //       experience_years: data.experience_years,
  //       ai_summary: data.summary,
  //       ai_score: data.score
  //     };

  //     if (resumeUrl) {
  //       updates.resume_url = resumeUrl;
  //     }

  //     const { error: updateError } = await updateRoleSpecificProfile(updates);
  //     if (updateError) throw updateError;

  //     toast({
  //       title: "Resume analyzed successfully",
  //       description: `Your profile has been updated with AI insights. Score: ${data.score}/100`,
  //     });
  //   } catch (error: any) {
  //     console.error('Error analyzing resume:', error);
  //     toast({
  //       title: "Analysis failed",
  //       description: error.message || "Failed to analyze resume with AI",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setAnalyzing(false);
  //   }
  // };

  // const updateCandidateProfile = async (updates: any) => {
  //   if (!profile?.user_id) return;

  //   const { error } = await supabase
  //     .from('candidates')
  //     .upsert({
  //       user_id: profile.user_id,
  //       email: profile.email,
  //       first_name: profile.first_name || '',
  //       last_name: profile.last_name || '',
  //       ...updates
  //     });

  //   if (error) throw error;
  // };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'client':
        return 'Client';
      case 'vendor':
        return 'Vendor';
      case 'candidate':
        return 'Candidate';
      default:
        return role;
    }
  };

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.first_name, profile?.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
                <Badge variant="secondary">
                  {getRoleDisplayName(profile?.role)}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resume Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume & AI Analysis
            </CardTitle>
            <CardDescription>
              Upload your resume for AI-powered profile enhancement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleResumeUpload}
                  className="hidden"
                  disabled={uploading || analyzing}
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Upload Resume'}
                  </span>
                  <span className="text-xs text-gray-500">
                    PDF, DOC, DOCX, or TXT (max 10MB)
                  </span>
                </label>
              </div>

              {(uploading || analyzing) && (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading resume...' : 'Analyzing with AI...'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Star className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <span className="text-xs text-blue-800">Skills Extraction</span>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <User className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <span className="text-xs text-green-800">Experience Analysis</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <span className="text-xs text-purple-800">Profile Scoring</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;