import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Clock, FileText, Mail, UserCheck, AlertCircle, Eye, Download, Upload, Send, Plus } from 'lucide-react';
import OfferLetterApiService, { formatCandidateDataForOffer, generateOfferEmailContent, TemplateField } from '@/services/offerLetterApi';

interface OfferWorkflow {
  id: string;
  job_application_id: string;
  current_step: string;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  background_check_status: string;
  background_check_provider?: string;
  background_check_reference_id?: string;
  background_check_result?: any;
  background_check_completed_at?: string;
  offer_generated_at?: string;
  offer_template_id?: string;
  generated_offer_content?: string;
  offer_details?: any;
  hr_approval_status: string;
  hr_approved_by?: string;
  hr_approved_at?: string;
  hr_comments?: string;
  sent_to_candidate_at?: string;
  candidate_notification_sent: boolean;
  offer_letter_url?: string;
  candidate_response?: string;
  candidate_response_at?: string;
  candidate_comment?: string;
  final_offer_amount?: number;
  final_offer_currency?: string;
  workflow_completed_at?: string;
  notes?: string;
  logs?: any[];
  estimated_completion_date?: string;
  priority_level: number;
  
  // Related fields from the join query
  job_applications?: {
    id: string;
    job_id: string;
    candidate_id: string;
    jobs?: {
      title: string;
      salary_min?: number;
      salary_max?: number;
      currency?: string;
      location?: string;
    };
    candidates?: {
      profile_id: string;
      profiles?: {
        first_name: string;
        last_name: string;
        email: string;
      };
    };
  };
}

const WORKFLOW_STEPS = [
  { id: 'background_check', name: 'Background Check', icon: UserCheck, step: 1 },
  { id: 'offer_generation', name: 'Generate Offer', icon: FileText, step: 2 },
  { id: 'hr_approval', name: 'HR Approval', icon: CheckCircle, step: 3 },
  { id: 'candidate_review', name: 'Candidate Review', icon: Mail, step: 4 },
  { id: 'completed', name: 'Completed', icon: Clock, step: 5 },
];

export function OfferWorkflowManager() {
  const [workflows, setWorkflows] = useState<OfferWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<OfferWorkflow | null>(null);
  const [hrComments, setHrComments] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [generatedOfferUrl, setGeneratedOfferUrl] = useState<string | null>(null);
  const [emailRequestId, setEmailRequestId] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFieldsDialog, setShowFieldsDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [extractingFields, setExtractingFields] = useState(false);
  const [generatingOffer, setGeneratingOffer] = useState(false);
  const [uploadedTemplates, setUploadedTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [extractedFields, setExtractedFields] = useState<TemplateField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [selectedWorkflowForOffer, setSelectedWorkflowForOffer] = useState<OfferWorkflow | null>(null);
  const [formData, setFormData] = useState({
    job_application_id: '',
    priority_level: 3,
    estimated_completion_date: ''
  });
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const offerApiService = new OfferLetterApiService();
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchWorkflows();
    fetchUploadedTemplates();
  }, []);

  const createWorkflow = async (formData: any) => {
    setCreating(true);
    try {
      // Since there might be a type mismatch, let's just use the fields that are required
      const newWorkflow = {
        job_application_id: formData.job_application_id,
        current_step: 'background_check',
        status: 'pending',
        priority_level: formData.priority_level || 3,
        estimated_completion_date: formData.estimated_completion_date,
      };

      const { error } = await supabase
        .from('offer_workflow')
        .insert(newWorkflow as any); // Use any to bypass type checking

      if (error) throw error;

      await fetchWorkflows();
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Workflow created successfully",
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('offer_workflow')
        .select(`
          *,
          job_applications!inner (
            id,
            job_id,
            candidate_id,
            jobs (title, salary_min, salary_max, currency, location),
            candidates!inner (
              profile_id,
              profiles!inner (first_name, last_name, email)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setWorkflows(data as any || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to fetch offer workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('offer_templates')
        .select(`
          id,
          template_name,
          template_content,
          job_role,
          country,
          is_validated,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUploadedTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch uploaded templates",
        variant: "destructive",
      });
    }
  };

  const advanceWorkflow = async (workflowId: string, stepData: any = {}) => {
    setActionLoading(workflowId);
    try {
      // Get current workflow to determine next step
      const { data: currentWorkflow, error: fetchError } = await supabase
        .from('offer_workflow')
        .select('current_step, status')
        .eq('id', workflowId)
        .single();

      if (fetchError) throw fetchError;

      // Determine next step based on current step
      const currentStepObj = WORKFLOW_STEPS.find(s => s.id === String(currentWorkflow.current_step));
      const currentStepNumber = currentStepObj ? currentStepObj.step : 1;
      const nextStep = WORKFLOW_STEPS.find(s => s.step === currentStepNumber + 1);

      const updateData = {
        ...stepData,
        updated_at: new Date().toISOString(),
      };

      // Update status to in_progress if it's pending
      if (currentWorkflow.status === 'pending') {
        updateData.status = 'in_progress';
      }

      // If there's a next step, update current_step
      if (nextStep && nextStep.id !== 'completed') {
        updateData.current_step = nextStep.id;
      } else if (nextStep && nextStep.id === 'completed') {
        // Don't auto-complete until candidate responds
        updateData.current_step = 'candidate_review';
      }

      // Update the workflow
      const { error } = await supabase
        .from('offer_workflow')
        .update(updateData as any)
        .eq('id', workflowId);

      if (error) throw error;

      await fetchWorkflows();
      toast({
        title: "Success",
        description: "Workflow step completed successfully",
      });
    } catch (error) {
      console.error('Error advancing workflow:', error);
      toast({
        title: "Error",
        description: "Failed to advance workflow step",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const selectTemplateAndExtractFields = async (templateId: string, workflow: OfferWorkflow) => {
    try {
      setExtractingFields(true);
      setSelectedWorkflowForOffer(workflow);

      const template = uploadedTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Download the template file from storage
      const { data, error } = await supabase.storage
        .from('offer-templates')
        .download(template.template_content);

      if (error) throw error;

      // Create a File object from the downloaded data
      const file = new File([data], template.template_name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      setTemplateFile(file);
      setSelectedTemplateId(templateId);

      // Extract fields from template using the API
      const extractResponse = await offerApiService.extractTemplateFields(file);
      
      console.log('API Response:', extractResponse); // Debug log
      
      // Handle different possible API response formats
      let fields: TemplateField[] = [];
      
      if (extractResponse.success) {
        if (extractResponse.fields && Array.isArray(extractResponse.fields)) {
          // New format - direct fields array
          fields = extractResponse.fields;
        } else if (extractResponse.template_info?.placeholders && Array.isArray(extractResponse.template_info.placeholders)) {
          // Old format - placeholders array (convert to TemplateField format)
          fields = extractResponse.template_info.placeholders.map((placeholder: string, index: number) => ({
            id: placeholder.replace(/[{}]/g, '').toLowerCase().replace(/\s+/g, '_'),
            label: placeholder.replace(/[{}]/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: 'text' as const,
            required: true,
            placeholder: `Enter ${placeholder.replace(/[{}]/g, '')}`
          }));
        } else {
          throw new Error('No fields found in API response');
        }
        
        if (fields.length > 0) {
          // Pre-populate fields with candidate data
          const candidate = workflow.job_applications?.candidates?.profiles;
          const job = workflow.job_applications?.jobs;
          
          const prefilledData: Record<string, any> = {};
          const candidateData = formatCandidateDataForOffer(candidate, job);
          
          // Map candidate data to extracted fields
          fields.forEach(field => {
            if (candidateData[field.id]) {
              prefilledData[field.id] = candidateData[field.id];
            }
          });

          setExtractedFields(fields);
          setFieldValues(prefilledData);
          setSelectedWorkflowForOffer(workflow);
          setShowOfferDialog(false);
          setShowFieldsDialog(true);

          toast({
            title: "Template Fields Extracted",
            description: `Found ${fields.length} fields to customize`,
          });
        } else {
          throw new Error('No fields extracted from template');
        }
      } else {
        console.error('Invalid API response:', extractResponse);
        throw new Error(`Failed to extract template fields. API response: ${JSON.stringify(extractResponse)}`);
      }
    } catch (error) {
      console.error('Error extracting template fields:', error);
      toast({
        title: "Error",
        description: "Failed to extract template fields",
        variant: "destructive",
      });
    } finally {
      setExtractingFields(false);
    }
  };

  const selectTemplateAndExtractFieldsFromUpload = async (file: File, workflow: OfferWorkflow) => {
    try {
      setExtractingFields(true);
      setSelectedWorkflowForOffer(workflow);
      setTemplateFile(file);
      setSelectedTemplateId('');

      // Extract fields from uploaded template
      const extractResponse = await offerApiService.extractTemplateFields(file);
      
      console.log('Upload API Response:', extractResponse); // Debug log
      
      // Handle different possible API response formats
      let fields: TemplateField[] = [];
      
      if (extractResponse.success) {
        if (extractResponse.fields && Array.isArray(extractResponse.fields)) {
          // New format - direct fields array
          fields = extractResponse.fields;
        } else if (extractResponse.template_info?.placeholders && Array.isArray(extractResponse.template_info.placeholders)) {
          // Old format - placeholders array (convert to TemplateField format)
          fields = extractResponse.template_info.placeholders.map((placeholder: string, index: number) => ({
            id: placeholder.replace(/[{}]/g, '').toLowerCase().replace(/\s+/g, '_'),
            label: placeholder.replace(/[{}]/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: 'text' as const,
            required: true,
            placeholder: `Enter ${placeholder.replace(/[{}]/g, '')}`
          }));
        } else {
          throw new Error('No fields found in API response');
        }
        
        if (fields.length > 0) {
          // Pre-populate fields with candidate data
          const candidate = workflow.job_applications?.candidates?.profiles;
          const job = workflow.job_applications?.jobs;
          
          const prefilledData: Record<string, any> = {};
          const candidateData = formatCandidateDataForOffer(candidate, job);
          
          // Map candidate data to extracted fields
          fields.forEach(field => {
            if (candidateData[field.id]) {
              prefilledData[field.id] = candidateData[field.id];
            }
          });

          setExtractedFields(fields);
          setFieldValues(prefilledData);
          setShowOfferDialog(false);
          setShowFieldsDialog(true);

          toast({
            title: "Template Fields Extracted",
            description: `Found ${fields.length} fields to customize`,
          });
        } else {
          throw new Error('No fields extracted from template');
        }
      } else {
        console.error('Invalid API response:', extractResponse);
        throw new Error(`Failed to extract template fields. API response: ${JSON.stringify(extractResponse)}`);
      }
    } catch (error) {
      console.error('Error extracting template fields:', error);
      toast({
        title: "Error",
        description: "Failed to extract template fields",
        variant: "destructive",
      });
    } finally {
      setExtractingFields(false);
    }
  };

  const runBackgroundCheck = async (workflow: OfferWorkflow) => {
    try {
      const candidate = workflow.job_applications?.candidates?.profiles;
      if (!candidate) throw new Error('Candidate not found');

      // Update status to in_progress
      await supabase
        .from('offer_workflow')
        .update({
          status: 'in_progress',
          background_check_status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      const { data, error } = await supabase.functions.invoke('background-check', {
        body: {
          candidateId: workflow.job_application_id,
          firstName: candidate.first_name,
          lastName: candidate.last_name,
          email: candidate.email
        }
      });

      if (error) throw error;

      await advanceWorkflow(workflow.id, {
        background_check_status: 'completed',
        background_check_result: data.result,
        background_check_completed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error running background check:', error);
      
      // Update to failed status
      await supabase
        .from('offer_workflow')
        .update({
          background_check_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      toast({
        title: "Error",
        description: "Failed to run background check",
        variant: "destructive",
      });
    }
  };

  const generateOffer = async (workflow: OfferWorkflow) => {
    if (!templateFile) {
      toast({
        title: "Template Required",
        description: "Please select or upload a template file first.",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(workflow.id);
    
    try {
      // Update status to in_progress
      await supabase
        .from('offer_workflow')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      // Get candidate and job data
      const candidate = workflow.job_applications?.candidates?.profiles;
      const job = workflow.job_applications?.jobs;

      if (!candidate || !job) {
        throw new Error('Missing candidate or job data');
      }

      // Prepare candidate data for offer generation
      const candidateData = formatCandidateDataForOffer(candidate, job);

      // Add custom offer amount if provided
      if (offerAmount) {
        candidateData.salary = offerAmount;
      }

      // Generate offer letter using API
      const response = await offerApiService.generateOfferLetter({
        template_file: templateFile,
        data: candidateData,
        output_format: 'both'
      });

      if (response.success) {
        // Store the generated files URLs
        setGeneratedOfferUrl(response.files?.pdf || null);
        
        // Update workflow in database with new field names
        await advanceWorkflow(workflow.id, {
          generated_offer_content: JSON.stringify(candidateData),
          offer_details: {
            position: job.title,
            salary: candidateData.salary,
            pdf_file_id: response.files?.pdf,
            docx_file_id: response.files?.docx,
            request_id: response.request_id
          },
          offer_generated_at: new Date().toISOString(),
          final_offer_amount: parseFloat(candidateData.salary),
          final_offer_currency: job.currency || 'USD'
        });

        toast({
          title: "Offer Generated",
          description: "Offer letter has been generated successfully.",
        });
      } else {
        throw new Error(response.message || 'Failed to generate offer');
      }
    } catch (error) {
      console.error('Error generating offer:', error);
      
      // Update to failed status
      await supabase
        .from('offer_workflow')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate offer letter.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const approveOffer = async (workflow: OfferWorkflow) => {
    try {
      // Get current user from auth context if available
      const { data: { user } } = await supabase.auth.getUser();
      
      await advanceWorkflow(workflow.id, {
        hr_approval_status: 'approved',
        hr_comments: hrComments,
        hr_approved_by: user?.id,
        hr_approved_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error approving offer:', error);
      toast({
        title: "Error",
        description: "Failed to approve offer",
        variant: "destructive",
      });
    }
  };

  const rejectOffer = async (workflow: OfferWorkflow) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('offer_workflow')
        .update({
          hr_approval_status: 'rejected',
          hr_comments: hrComments,
          hr_approved_by: user?.id,
          hr_approved_at: new Date().toISOString(),
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      await fetchWorkflows();
      toast({
        title: "Offer Rejected",
        description: "Offer has been rejected by HR",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast({
        title: "Error",
        description: "Failed to reject offer",
        variant: "destructive",
      });
    }
  };

  const sendToCandidate = async (workflow: OfferWorkflow) => {
    if (!generatedOfferUrl && !workflow.offer_details?.pdf_file_id) {
      toast({
        title: "No Offer Letter",
        description: "Please generate an offer letter first.",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(workflow.id);
    
    try {
      const candidate = workflow.job_applications?.candidates?.profiles;
      const job = workflow.job_applications?.jobs;

      if (!candidate || !job) {
        throw new Error('Missing candidate or job data');
      }

      // Get the PDF file for sending
      let pdfBlob: Blob;
      
      if (workflow.offer_details?.pdf_file_id) {
        // Download from API service
        pdfBlob = await offerApiService.downloadFile(workflow.offer_details.pdf_file_id);
      } else if (generatedOfferUrl) {
        // Fetch from URL
        const response = await fetch(generatedOfferUrl);
        pdfBlob = await response.blob();
      } else {
        throw new Error('No offer letter available');
      }

      // Convert blob to file
      const pdfFile = new File([pdfBlob], `offer_letter_${candidate.first_name}_${candidate.last_name}.pdf`, {
        type: 'application/pdf'
      });

      // Generate email content
      const emailContent = generateOfferEmailContent(
        `${candidate.first_name} ${candidate.last_name}`,
        job.title || 'the position'
      );

      // Send via API
      const response = await offerApiService.sendOfferLetter({
        pdf_file: pdfFile,
        email_data: {
          emails: [candidate.email || ''],
          subject: `Job Offer - ${job.title}`,
          html_content: emailContent
        }
      });

      // Store request ID for status tracking
      setEmailRequestId(response.request_id);
      
      // Update workflow with new field names
      await advanceWorkflow(workflow.id, {
        offer_letter_url: workflow.offer_details?.pdf_file_id || generatedOfferUrl,
        sent_to_candidate_at: new Date().toISOString(),
        candidate_notification_sent: true,
        logs: [
          ...(workflow.logs || []),
          {
            timestamp: new Date().toISOString(),
            action: 'offer_sent',
            email_request_id: response.request_id,
            recipient: candidate.email
          }
        ]
      });

      toast({
        title: "Offer Sent",
        description: "Offer letter has been sent to the candidate.",
      });

      // Show email tracking dialog
      setShowEmailDialog(true);
      
    } catch (error) {
      console.error('Error sending offer:', error);
      toast({
        title: "Send Failed",
        description: error instanceof Error ? error.message : "Failed to send offer to candidate",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const checkEmailStatus = async (requestId: string) => {
    try {
      const status = await offerApiService.getEmailStatus(requestId);
      setEmailStatus(status);
      return status;
    } catch (error) {
      console.error('Error checking email status:', error);
      toast({
        title: "Status Check Failed",
        description: "Could not check email delivery status",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.endsWith('.docx')) {
        
        // If we have a selected workflow, extract fields; otherwise just set the file
        if (selectedWorkflowForOffer) {
          selectTemplateAndExtractFieldsFromUpload(file, selectedWorkflowForOffer);
        } else {
          setTemplateFile(file);
          setSelectedTemplateId('');
          toast({
            title: "Template Uploaded",
            description: `Template "${file.name}" has been uploaded successfully.`,
          });
        }
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .docx file",
          variant: "destructive"
        });
      }
    }
  };

  const downloadGeneratedOffer = async (fileId: string) => {
    try {
      const blob = await offerApiService.downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offer_letter_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the file",
        variant: "destructive"
      });
    }
  };

  const viewOfferLetter = async (offerLetterUrl: string) => {
    try {
      window.open(offerLetterUrl, '_blank');
    } catch (error) {
      console.error('Error opening offer letter:', error);
      toast({
        title: "View Failed",
        description: "Could not open the offer letter",
        variant: "destructive"
      });
    }
  };

  const updateCandidateResponse = async (workflowId: string, response: 'accepted' | 'rejected' | 'negotiating', comment?: string) => {
    try {
      const updateData: any = {
        candidate_response: response,
        candidate_response_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (comment) {
        updateData.candidate_comment = comment;
      }

      // If accepted, mark workflow as completed
      if (response === 'accepted') {
        updateData.status = 'completed';
        updateData.current_step = 'completed';
        updateData.workflow_completed_at = new Date().toISOString();
      }

      // If rejected, mark workflow as failed
      if (response === 'rejected') {
        updateData.status = 'failed';
      }

      const { error } = await supabase
        .from('offer_workflow')
        .update(updateData)
        .eq('id', workflowId);

      if (error) throw error;

      await fetchWorkflows();
      
      toast({
        title: "Response Updated",
        description: `Candidate response recorded: ${response}`,
      });
    } catch (error) {
      console.error('Error updating candidate response:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update candidate response",
        variant: "destructive",
      });
    }
  };

  const getStepAction = (workflow: OfferWorkflow) => {
    const step = workflow.current_step;
    const isLoading = actionLoading === workflow.id;
    const candidate = workflow.job_applications?.candidates?.profiles;

    switch (step) {
      case 'background_check':
        if (workflow.background_check_status === 'completed') {
          return (
            <Badge variant="default" className="bg-green-500">
              Background Check Completed
            </Badge>
          );
        }
        if (workflow.background_check_status === 'failed') {
          return (
            <Badge variant="destructive">
              Background Check Failed
            </Badge>
          );
        }
        if (workflow.background_check_status === 'not_required') {
          return (
            <Button 
              onClick={() => advanceWorkflow(workflow.id, { background_check_status: 'not_required' })}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              Skip Background Check
            </Button>
          );
        }
        return (
          <Button 
            onClick={() => runBackgroundCheck(workflow)}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? 'Running...' : 'Run Background Check'}
          </Button>
        );
      case 'offer_generation':
        return (
          <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setSelectedWorkflow(workflow);
                setSelectedWorkflowForOffer(workflow);
                setShowOfferDialog(true);
                fetchUploadedTemplates(); // Refresh templates when opening dialog
              }}>
                Generate Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Offer</DialogTitle>
                <DialogDescription>
                  Create offer letter for {candidate?.first_name} {candidate?.last_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Template Selection Section */}
                <div>
                  <Label>Select Template</Label>
                  <div className="space-y-3 mt-2">
                    {/* Uploaded Templates */}
                    {uploadedTemplates.length > 0 ? (
                      <div>
                        <Label className="text-sm font-medium">Uploaded Templates ({uploadedTemplates.length})</Label>
                        <div className="space-y-2 mt-1 max-h-40 overflow-y-auto">
                          {uploadedTemplates.map((template) => (
                            <div 
                              key={template.id}
                              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedTemplateId === template.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => selectTemplateAndExtractFields(template.id, workflow)}
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium text-sm">{template.template_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {template.job_role} • {new Date(template.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              {template.is_validated && (
                                <Badge variant="outline" className="text-xs">Validated</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No templates uploaded yet</p>
                        <p className="text-xs">Upload a template below to get started</p>
                      </div>
                    )}
                    
                    {/* Manual Upload Option */}
                    <div className="border-t pt-3">
                      <Label htmlFor="template-upload" className="text-sm font-medium">Or Upload New Template</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Input
                          ref={fileInputRef}
                          id="template-upload"
                          type="file"
                          accept=".docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplateId('');
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Select File</span>
                        </Button>
                        {templateFile && !selectedTemplateId && (
                          <span className="text-sm text-green-600">
                            ✓ {templateFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="amount">Offer Amount ($)</Label>
                  <Input
                    id="amount"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="75000"
                  />
                </div>
                {(workflow.offer_details?.pdf_file_id || workflow.offer_details?.offer_letter_url) && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Generated Offer Letter</h4>
                    <div className="flex items-center space-x-2">
                      {workflow.offer_details?.pdf_file_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadGeneratedOffer(workflow.offer_details.pdf_file_id)}
                          className="flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download PDF</span>
                        </Button>
                      )}
                      {workflow.offer_details?.docx_file_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadGeneratedOffer(workflow.offer_details.docx_file_id)}
                          className="flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download DOCX</span>
                        </Button>
                      )}
                      {workflow.offer_details?.offer_letter_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewOfferLetter(workflow.offer_details.offer_letter_url)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Offer</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      Offer generated and saved on {workflow.offer_generated_at ? new Date(workflow.offer_generated_at).toLocaleDateString() : 'recently'}
                    </p>
                  </div>
                )}
                <Button 
                  onClick={() => {
                    generateOffer(workflow);
                    setShowOfferDialog(false);
                  }}
                  disabled={extractingFields}
                  className="w-full"
                >
                  {extractingFields ? 'Extracting Fields...' : 'Select Template & Continue'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      case 'hr_approval':
        if (workflow.hr_approval_status === 'approved') {
          return (
            <Badge variant="default" className="bg-green-500">
              HR Approved
            </Badge>
          );
        }
        if (workflow.hr_approval_status === 'rejected') {
          return (
            <Badge variant="destructive">
              HR Rejected
            </Badge>
          );
        }
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setSelectedWorkflow(workflow)}>
                Review & Approve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>HR Approval</DialogTitle>
                <DialogDescription>
                  Review and approve offer for {candidate?.first_name} {candidate?.last_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {workflow.offer_details && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Offer Details</h4>
                    <p><strong>Position:</strong> {workflow.offer_details.position}</p>
                    <p><strong>Salary:</strong> {workflow.final_offer_currency} {workflow.final_offer_amount}</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="comments">HR Comments</Label>
                  <Textarea
                    id="comments"
                    value={hrComments}
                    onChange={(e) => setHrComments(e.target.value)}
                    placeholder="Add any comments or notes..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => approveOffer(workflow)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Approving...' : 'Approve Offer'}
                  </Button>
                  <Button 
                    onClick={() => rejectOffer(workflow)}
                    disabled={isLoading}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isLoading ? 'Rejecting...' : 'Reject Offer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      case 'candidate_review':
        if (!workflow.sent_to_candidate_at) {
          return (
            <Button 
              onClick={() => sendToCandidate(workflow)}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Sending...' : 'Send to Candidate'}
            </Button>
          );
        }
        return (
          <Badge variant="secondary">
            {workflow.candidate_response === 'accepted' ? 'Accepted' :
             workflow.candidate_response === 'rejected' ? 'Rejected' :
             workflow.candidate_response === 'negotiating' ? 'Negotiating' :
             'Awaiting Response'}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            Workflow Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">Unknown Step</Badge>
        );
    }
  };

  const getStepIndex = (step: string) => {
    const stepObj = WORKFLOW_STEPS.find(s => s.id === step);
    return stepObj ? stepObj.step : 1;
  };

  const generateOfferWithFields = async () => {
    if (!templateFile || !selectedWorkflowForOffer) {
      toast({
        title: "Error",
        description: "Template file or workflow not found",
        variant: "destructive"
      });
      return;
    }

    try {
      setGeneratingOffer(true);

      // Generate offer letter using the API
      const offerData = {
        candidate_name: fieldValues.candidate_name || '',
        position: fieldValues.position || '',
        salary: fieldValues.salary || '',
        start_date: fieldValues.start_date || '',
        company_name: fieldValues.company_name || '',
        ...fieldValues
      };

      const response = await offerApiService.generateOfferLetter({
        template_file: templateFile,
        data: offerData,
        output_format: 'both'
      });

      if (response.success) {
        console.log('Offer generation response:', response);
        
        // Download the generated files from the API and upload to storage
        let pdfFile: Blob | null = null;
        let docxFile: Blob | null = null;
        let offerLetterUrl: string | null = null;

        try {
          // Download PDF and DOCX files if they exist
          if (response.files?.pdf) {
            console.log('Downloading PDF file:', response.files.pdf);
            pdfFile = await offerApiService.downloadFile(response.files.pdf);
          }
          if (response.files?.docx) {
            console.log('Downloading DOCX file:', response.files.docx);
            docxFile = await offerApiService.downloadFile(response.files.docx);
          }

          // Upload files to Supabase storage bucket
          if (pdfFile && profile?.id) {
            console.log('Uploading PDF to storage bucket...');
            const fileName = `${profile.id}/${selectedWorkflowForOffer.job_application_id}/offer_letter_${Date.now()}.pdf`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('offer-letters')
              .upload(fileName, pdfFile, {
                contentType: 'application/pdf',
                upsert: false
              });

            if (uploadError) {
              console.error('Error uploading PDF to storage:', uploadError);
              // Continue without storage - use API URL instead
              offerLetterUrl = response.files?.pdf || null;
            } else {
              console.log('PDF uploaded successfully:', uploadData);
              // Get the public URL for the uploaded file
              const { data: { publicUrl } } = supabase.storage
                .from('offer-letters')
                .getPublicUrl(fileName);
              
              offerLetterUrl = publicUrl;
            }
          } else {
            // Fallback to API URL
            offerLetterUrl = response.files?.pdf || null;
          }

          // Create offer record in the database
          console.log('Creating offer record in database...');
          const salaryString = fieldValues.salary?.replace(/[^0-9.-]+/g, '') || '0';
          const salaryAmount = parseFloat(salaryString);
          
          const offerRecord = {
            application_id: selectedWorkflowForOffer.job_application_id, // Use application_id as per types
            salary_amount: salaryAmount > 0 ? salaryAmount : 50000, // Default salary if parsing fails
            currency: fieldValues.currency || 'USD',
            start_date: fieldValues.start_date || null,
            offer_letter_url: offerLetterUrl,
            status: 'draft',
            benefits: fieldValues.benefits ? 
              (typeof fieldValues.benefits === 'string' ? JSON.parse(fieldValues.benefits) : fieldValues.benefits) : 
              null,
          };

          const { data: offerData, error: offerError } = await supabase
            .from('offers')
            .insert(offerRecord)
            .select()
            .single();

          if (offerError) {
            console.error('Error creating offer record:', offerError);
            // Don't throw error, just log it and continue
          } else {
            console.log('Offer record created successfully:', offerData);
          }

        } catch (fileError) {
          console.error('Error handling files:', fileError);
          // Continue with workflow update even if file handling fails
        }

        // Update workflow in database
        console.log('Updating workflow...');
        await advanceWorkflow(selectedWorkflowForOffer.id, {
          generated_offer_content: JSON.stringify(fieldValues),
          offer_details: {
            ...fieldValues,
            pdf_file_id: response.files?.pdf,
            docx_file_id: response.files?.docx,
            offer_letter_url: offerLetterUrl,
            api_request_id: response.request_id
          },
          offer_generated_at: new Date().toISOString()
        });

        // Set the generated offer URL for preview
        setGeneratedOfferUrl(offerLetterUrl);

        setShowFieldsDialog(false);
        toast({
          title: "Offer Letter Generated!",
          description: "The offer letter has been generated and saved successfully.",
        });

      } else {
        throw new Error(response.message || 'Failed to generate offer letter');
      }

    } catch (error) {
      console.error('Error in generateOfferWithFields:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate offer letter",
        variant: "destructive",
      });
    } finally {
      setGeneratingOffer(false);
    }
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="p-6">Loading offer workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Offer Management Workflow</h2>
        <Dialog open={showCreateWorkflowDialog} onOpenChange={setShowCreateWorkflowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Offer Workflow</DialogTitle>
              <DialogDescription>
                Start a new offer workflow for a selected candidate
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="application-select">Select Job Application</Label>
                <Input
                  id="application-select"
                  placeholder="Enter Job Application ID"
                  value={selectedApplicationId}
                  onChange={(e) => setSelectedApplicationId(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  You can find this ID in the job applications list
                </p>
              </div>
              <Button 
                onClick={() => createWorkflow(selectedApplicationId)}
                disabled={!selectedApplicationId}
                className="w-full"
              >
                Create Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {workflows.map((workflow) => {
          const candidate = workflow.job_applications?.candidates?.profiles;
          const job = workflow.job_applications?.jobs;
          
          return (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {job?.title} - {candidate?.first_name} {candidate?.last_name}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div>Started {new Date(workflow.created_at).toLocaleDateString()}</div>
                      {workflow.priority_level && (
                        <div className="flex items-center space-x-2">
                          <span>Priority:</span>
                          <Badge variant={workflow.priority_level <= 2 ? "destructive" : workflow.priority_level <= 3 ? "default" : "secondary"}>
                            {workflow.priority_level <= 2 ? "High" : workflow.priority_level <= 3 ? "Medium" : "Low"}
                          </Badge>
                        </div>
                      )}
                      {workflow.estimated_completion_date && (
                        <div className="text-sm">
                          Expected completion: {new Date(workflow.estimated_completion_date).toLocaleDateString()}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(workflow.status)}>
                    {workflow.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>Step {getStepIndex(workflow.current_step)} of 5</span>
                  </div>
                  <Progress value={(getStepIndex(workflow.current_step) / 5) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    {WORKFLOW_STEPS.map((step) => {
                      const Icon = step.icon;
                      const currentStepIndex = getStepIndex(workflow.current_step);
                      const stepIndex = step.step;
                      const isCompleted = stepIndex < currentStepIndex;
                      const isCurrent = stepIndex === currentStepIndex;
                      
                      return (
                        <div key={step.id} className="flex items-center space-x-2">
                          <div className={`p-2 rounded-full ${
                            isCompleted ? 'bg-green-100 text-green-600' :
                            isCurrent ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm ${
                            isCompleted ? 'text-green-600' :
                            isCurrent ? 'text-blue-600' :
                            'text-gray-400'
                          }`}>
                            {step.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="ml-4">
                    {workflow.status !== 'completed' && workflow.status !== 'failed' && workflow.status !== 'cancelled' && (
                      getStepAction(workflow)
                    )}
                  </div>
                </div>

                {workflow.status === 'completed' && workflow.candidate_response === 'accepted' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Offer accepted by candidate</span>
                    {workflow.workflow_completed_at && (
                      <span className="text-xs text-muted-foreground">
                        on {new Date(workflow.workflow_completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {(workflow.status === 'failed' || workflow.candidate_response === 'rejected') && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {workflow.candidate_response === 'rejected' ? 'Offer rejected by candidate' : 'Workflow failed'}
                    </span>
                    {workflow.candidate_comment && (
                      <span className="text-xs text-muted-foreground">
                        - {workflow.candidate_comment}
                      </span>
                    )}
                  </div>
                )}

                {workflow.status === 'cancelled' && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Workflow cancelled</span>
                  </div>
                )}

                {workflow.candidate_response === 'negotiating' && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Candidate is negotiating terms</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          );
        })}

        {workflows.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No offer workflows found</p>
                <p className="text-sm">Workflows will appear here when candidates are selected for offers</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Email Status Tracking Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Delivery Status</DialogTitle>
            <DialogDescription>
              Track the delivery status of your offer letter email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {emailRequestId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Request ID:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{emailRequestId}</code>
                </div>
                
                {emailStatus && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge variant={
                        emailStatus.status === 'completed' ? 'default' : 
                        emailStatus.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {emailStatus.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{emailStatus.progress_percentage}%</span>
                      </div>
                      <Progress value={emailStatus.progress_percentage} className="w-full" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-green-600">{emailStatus.sent_count}</div>
                        <div className="text-muted-foreground">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">{emailStatus.pending_count}</div>
                        <div className="text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">{emailStatus.failed_count}</div>
                        <div className="text-muted-foreground">Failed</div>
                      </div>
                    </div>
                    
                    {emailStatus.errors && emailStatus.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Errors:</h4>
                        <ScrollArea className="h-20">
                          <div className="space-y-1">
                            {emailStatus.errors.map((error, index) => (
                              <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                {error}
                              </p>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </>
                )}
                
                <Button 
                  onClick={() => emailRequestId && checkEmailStatus(emailRequestId)}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Status
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Create New Workflow
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Offer Workflow</DialogTitle>
            <DialogDescription>
              Start a new offer workflow for a job application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Job Application ID</label>
              <Input
                value={formData.job_application_id}
                onChange={(e) => setFormData(prev => ({ ...prev, job_application_id: e.target.value }))}
                placeholder="Enter job application ID"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Priority Level</label>
              <Select 
                value={String(formData.priority_level)} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority_level: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Urgent (1)</SelectItem>
                  <SelectItem value="2">High (2)</SelectItem>
                  <SelectItem value="3">Medium (3)</SelectItem>
                  <SelectItem value="4">Low (4)</SelectItem>
                  <SelectItem value="5">Very Low (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Estimated Completion Date</label>
              <Input
                type="date"
                value={formData.estimated_completion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion_date: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => createWorkflow(formData)} disabled={creating}>
                {creating ? "Creating..." : "Create Workflow"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dynamic Fields Dialog */}
      <Dialog open={showFieldsDialog} onOpenChange={setShowFieldsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fill Template Fields</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Please fill in the extracted fields from the template to generate the offer letter.
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            {extractedFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <Input
                    id={field.id}
                    value={fieldValues[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Textarea
                    id={field.id}
                    value={fieldValues[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={3}
                  />
                )}
                
                {field.type === 'select' && field.options && (
                  <Select 
                    value={fieldValues[field.id] || ''} 
                    onValueChange={(value) => handleInputChange(field.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {field.type === 'number' && (
                  <Input
                    id={field.id}
                    type="number"
                    value={fieldValues[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
                
                {field.type === 'date' && (
                  <Input
                    id={field.id}
                    type="date"
                    value={fieldValues[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
                
                {field.description && (
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowFieldsDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={generateOfferWithFields} 
              disabled={generatingOffer}
            >
              {generatingOffer ? "Generating..." : "Generate Offer Letter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfferWorkflowManager;