// import React, { useState, useEffect, useRef } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import { useAuth } from '@/hooks/useAuth';
// import { CheckCircle, Clock, FileText, Mail, UserCheck, AlertCircle, Eye, Download, Upload, Send, Plus } from 'lucide-react';
// import OfferLetterApiService, { formatCandidateDataForOffer, generateOfferEmailContent, TemplateField } from '@/services/offerLetterApi';
// import { FileCheck } from 'lucide-react';
// import {  Shield, XCircle, Loader2 } from 'lucide-react';
// interface OfferWorkflow {
//   id: string;
//   job_application_id: string;
//   current_step: string;
//   status: string;
//   created_by?: string;
//   created_at: string;
//   updated_at: string;
//   background_check_status: string;
//   background_check_provider?: string;
//   background_check_reference_id?: string;
//   background_check_result?: any;
//   background_check_completed_at?: string;
//   offer_generated_at?: string;
//   offer_template_id?: string;
//   generated_offer_content?: string;
//   offer_details?: any;
//   hr_approval_status: string;
//   hr_approved_by?: string;
//   hr_approved_at?: string;
//   hr_comments?: string;
//   sent_to_candidate_at?: string;
//   candidate_notification_sent: boolean;
//   offer_letter_url?: string;
//   candidate_response?: string;
//   candidate_response_at?: string;
//   candidate_comment?: string;
//   final_offer_amount?: number;
//   final_offer_currency?: string;
//   workflow_completed_at?: string;
//   notes?: string;
//   logs?: any[];
//   estimated_completion_date?: string;
//   priority_level: number;
  
//   job_applications?: {
//     id: string;
//     job_id: string;
//     candidate_id: string;
//     jobs?: {
//       title: string;
//       salary_min?: number;
//       salary_max?: number;
//       currency?: string;
//       location?: string;
//     };
//     candidates?: {
//       profile_id: string;
//       profiles?: {
//         first_name: string;
//         last_name: string;
//         email: string;
//       };
//     };
//   };
// }

// const WORKFLOW_STEPS = [
//   { id: 'background_check', name: 'Background Check', icon: UserCheck, step: 1 },
//   { id: 'offer_generation', name: 'Generate Offer', icon: FileText, step: 2 },
//   { id: 'hr_approval', name: 'HR Approval', icon: CheckCircle, step: 3 },
//   { id: 'candidate_review', name: 'Candidate Review', icon: Mail, step: 4 },
//   { id: 'completed', name: 'Completed', icon: Clock, step: 5 },
// ];

// export function OfferWorkflowManager() {
//   const [workflows, setWorkflows] = useState<OfferWorkflow[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [selectedWorkflow, setSelectedWorkflow] = useState<OfferWorkflow | null>(null);
//   const [hrComments, setHrComments] = useState('');
//   const [offerAmount, setOfferAmount] = useState('');
//   const [templateFile, setTemplateFile] = useState<File | null>(null);
//   const [generatedOfferUrl, setGeneratedOfferUrl] = useState<string | null>(null);
//   const [emailRequestId, setEmailRequestId] = useState<string | null>(null);
//   const [emailStatus, setEmailStatus] = useState<any>(null);
//   const [showOfferDialog, setShowOfferDialog] = useState(false);
//   const [showEmailDialog, setShowEmailDialog] = useState(false);
//   const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false);
//   const [showCreateDialog, setShowCreateDialog] = useState(false);
//   const [showFieldsDialog, setShowFieldsDialog] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [extractingFields, setExtractingFields] = useState(false);
//   const [generatingOffer, setGeneratingOffer] = useState(false);
//   const [uploadedTemplates, setUploadedTemplates] = useState<any[]>([]);
//   const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
//   const [extractedFields, setExtractedFields] = useState<TemplateField[]>([]);
//   const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
//   const [selectedWorkflowForOffer, setSelectedWorkflowForOffer] = useState<OfferWorkflow | null>(null);
//   const [formData, setFormData] = useState({
//     job_application_id: '',
//     priority_level: 3,
//     estimated_completion_date: ''
//   });
//   const [selectedApplicationId, setSelectedApplicationId] = useState('');
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const offerApiService = new OfferLetterApiService();
//   const { toast } = useToast();
//   const { profile } = useAuth();

//   // **ADDED FROM OLD FILE:** State for the background check popup
//   const [showResultDialog, setShowResultDialog] = useState(false);
//   const [bgCheckResult, setBgCheckResult] = useState<{ status: string; remarks: string } | null>(null);

//   useEffect(() => {
//     fetchWorkflows();
//     fetchUploadedTemplates();
//   }, []);

//   const createWorkflow = async (formData: any) => {
//     setCreating(true);
//     try {
//       const newWorkflow = {
//         job_application_id: formData.job_application_id,
//         current_step: 'background_check',
//         status: 'pending',
//         priority_level: formData.priority_level || 3,
//         estimated_completion_date: formData.estimated_completion_date,
//       };

//       const { error } = await supabase
//         .from('offer_workflow')
//         .insert(newWorkflow as any);

//       if (error) throw error;

//       await fetchWorkflows();
//       setShowCreateDialog(false);
//       toast({
//         title: "Success",
//         description: "Workflow created successfully",
//       });
//     } catch (error) {
//       console.error('Error creating workflow:', error);
//       toast({
//         title: "Error",
//         description: "Failed to create workflow",
//         variant: "destructive",
//       });
//     } finally {
//       setCreating(false);
//     }
//   };

//   const fetchWorkflows = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('offer_workflow')
//         .select(`
//           *,
//           job_applications!inner (
//             id,
//             job_id,
//             candidate_id,
//             jobs (title, salary_min, salary_max, currency, location),
//             candidates!inner (
//               profile_id,
//               profiles!inner (first_name, last_name, email)
//             )
//           )
//         `)
//         .order('created_at', { ascending: false });

//       if (error) throw error;
      
//       setWorkflows(data as any || []);
//     } catch (error) {
//       console.error('Error fetching workflows:', error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch offer workflows",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUploadedTemplates = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('offer_templates')
//         .select(`
//           id,
//           template_name,
//           template_content,
//           job_role,
//           country,
//           is_validated,
//           created_at
//         `)
//         .order('created_at', { ascending: false });

//       if (error) throw error;
      
//       setUploadedTemplates(data || []);
//     } catch (error) {
//       console.error('Error fetching templates:', error);
//       toast({
//         title: "Error", 
//         description: "Failed to fetch uploaded templates",
//         variant: "destructive",
//       });
//     }
//   };

//   const advanceWorkflow = async (workflowId: string, stepData: any = {}) => {
//     setActionLoading(workflowId);
//     try {
//       const { data: currentWorkflow, error: fetchError } = await supabase
//         .from('offer_workflow')
//         .select('current_step, status')
//         .eq('id', workflowId)
//         .single();

//       if (fetchError) throw fetchError;

//       const currentStepObj = WORKFLOW_STEPS.find(s => s.id === String(currentWorkflow.current_step));
//       const currentStepNumber = currentStepObj ? currentStepObj.step : 1;
//       const nextStep = WORKFLOW_STEPS.find(s => s.step === currentStepNumber + 1);

//       const updateData = {
//         ...stepData,
//         updated_at: new Date().toISOString(),
//       };

//       if (currentWorkflow.status === 'pending') {
//         updateData.status = 'in_progress';
//       }

//       if (nextStep && nextStep.id !== 'completed') {
//         updateData.current_step = nextStep.id;
//       } else if (nextStep && nextStep.id === 'completed') {
//         updateData.current_step = 'candidate_review';
//       }

//       const { error } = await supabase
//         .from('offer_workflow')
//         .update(updateData as any)
//         .eq('id', workflowId);

//       if (error) throw error;

//       await fetchWorkflows();
//       toast({
//         title: "Success",
//         description: "Workflow step completed successfully",
//       });
//     } catch (error) {
//       console.error('Error advancing workflow:', error);
//       toast({
//         title: "Error",
//         description: "Failed to advance workflow step",
//         variant: "destructive",
//       });
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const selectTemplateAndExtractFields = async (templateId: string, workflow: OfferWorkflow) => {
//     try {
//       setExtractingFields(true);
//       setSelectedWorkflowForOffer(workflow);

//       const template = uploadedTemplates.find(t => t.id === templateId);
//       if (!template) {
//         throw new Error('Template not found');
//       }

//       const { data, error } = await supabase.storage
//         .from('offer-templates')
//         .download(template.template_content);

//       if (error) throw error;

//       const file = new File([data], template.template_name, {
//         type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//       });

//       setTemplateFile(file);
//       setSelectedTemplateId(templateId);

//       const extractResponse = await offerApiService.extractTemplateFields(file);
      
//       let fields: TemplateField[] = [];
      
//       if (extractResponse.success) {
//         if (extractResponse.fields && Array.isArray(extractResponse.fields)) {
//           fields = extractResponse.fields;
//         } else if (extractResponse.template_info?.placeholders && Array.isArray(extractResponse.template_info.placeholders)) {
//           fields = extractResponse.template_info.placeholders.map((placeholder: string, index: number) => ({
//             id: placeholder.replace(/[{}]/g, '').toLowerCase().replace(/\s+/g, '_'),
//             label: placeholder.replace(/[{}]/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//             type: 'text' as const,
//             required: true,
//             placeholder: `Enter ${placeholder.replace(/[{}]/g, '')}`
//           }));
//         } else {
//           throw new Error('No fields found in API response');
//         }
        
//         if (fields.length > 0) {
//           const candidate = workflow.job_applications?.candidates?.profiles;
//           const job = workflow.job_applications?.jobs;
          
//           const prefilledData: Record<string, any> = {};
//           const candidateData = formatCandidateDataForOffer(candidate, job);
          
//           fields.forEach(field => {
//             if (candidateData[field.id]) {
//               prefilledData[field.id] = candidateData[field.id];
//             }
//           });

//           setExtractedFields(fields);
//           setFieldValues(prefilledData);
//           setSelectedWorkflowForOffer(workflow);
//           setShowOfferDialog(false);
//           setShowFieldsDialog(true);

//           toast({
//             title: "Template Fields Extracted",
//             description: `Found ${fields.length} fields to customize`,
//           });
//         } else {
//           throw new Error('No fields extracted from template');
//         }
//       } else {
//         console.error('Invalid API response:', extractResponse);
//         throw new Error(`Failed to extract template fields. API response: ${JSON.stringify(extractResponse)}`);
//       }
//     } catch (error) {
//       console.error('Error extracting template fields:', error);
//       toast({
//         title: "Error",
//         description: "Failed to extract template fields",
//         variant: "destructive",
//       });
//     } finally {
//       setExtractingFields(false);
//     }
//   };

//   const selectTemplateAndExtractFieldsFromUpload = async (file: File, workflow: OfferWorkflow) => {
//     try {
//       setExtractingFields(true);
//       setSelectedWorkflowForOffer(workflow);
//       setTemplateFile(file);
//       setSelectedTemplateId('');

//       const extractResponse = await offerApiService.extractTemplateFields(file);
      
//       let fields: TemplateField[] = [];
      
//       if (extractResponse.success) {
//         if (extractResponse.fields && Array.isArray(extractResponse.fields)) {
//           fields = extractResponse.fields;
//         } else if (extractResponse.template_info?.placeholders && Array.isArray(extractResponse.template_info.placeholders)) {
//           fields = extractResponse.template_info.placeholders.map((placeholder: string, index: number) => ({
//             id: placeholder.replace(/[{}]/g, '').toLowerCase().replace(/\s+/g, '_'),
//             label: placeholder.replace(/[{}]/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//             type: 'text' as const,
//             required: true,
//             placeholder: `Enter ${placeholder.replace(/[{}]/g, '')}`
//           }));
//         } else {
//           throw new Error('No fields found in API response');
//         }
        
//         if (fields.length > 0) {
//           const candidate = workflow.job_applications?.candidates?.profiles;
//           const job = workflow.job_applications?.jobs;
          
//           const prefilledData: Record<string, any> = {};
//           const candidateData = formatCandidateDataForOffer(candidate, job);
          
//           fields.forEach(field => {
//             if (candidateData[field.id]) {
//               prefilledData[field.id] = candidateData[field.id];
//             }
//           });

//           setExtractedFields(fields);
//           setFieldValues(prefilledData);
//           setShowOfferDialog(false);
//           setShowFieldsDialog(true);

//           toast({
//             title: "Template Fields Extracted",
//             description: `Found ${fields.length} fields to customize`,
//           });
//         } else {
//           throw new Error('No fields extracted from template');
//         }
//       } else {
//         console.error('Invalid API response:', extractResponse);
//         throw new Error(`Failed to extract template fields. API response: ${JSON.stringify(extractResponse)}`);
//       }
//     } catch (error) {
//       console.error('Error extracting template fields:', error);
//       toast({
//         title: "Error",
//         description: "Failed to extract template fields",
//         variant: "destructive",
//       });
//     } finally {
//       setExtractingFields(false);
//     }
//   };
  
//   // **MODIFIED:** This function is now from the old file
//   const runBackgroundCheck = async (workflow: OfferWorkflow) => {
//     if (!workflow.job_applications?.candidates?.profile_id) {
//         toast({ title: "Error", description: "Candidate profile ID not found.", variant: "destructive" });
//         return;
//     }
    
//     setActionLoading(workflow.id);
//     setShowResultDialog(true); // Open the modal immediately
//     setBgCheckResult(null); // Clear previous results

//     try {
//         // Simulate a 2-3 second check for a better user experience
//         await new Promise(resolve => setTimeout(resolve, 2500));

//         // 1. Fetch the background check data from the 'candidates' table.
//         const { data: candidateData, error: fetchError } = await supabase
//             .from('candidates')
//             .select('background_check_status, background_check_remarks')
//             .eq('profile_id', workflow.job_applications.candidates.profile_id)
//             .single();

//         if (fetchError) throw fetchError;

//         const status = candidateData?.background_check_status || 'pending';
//         const remarks = candidateData?.background_check_remarks || 'No remarks found.';

//         // Display the result in the modal
//         setBgCheckResult({ status, remarks });

//         // 2. Make the automatic workflow decision.
//         if (status === 'completed' || status === 'not_required') {
//             // SUCCESS: Advance the workflow
//             await advanceWorkflow(workflow.id, {
//                 background_check_status: 'completed',
//                 background_check_completed_at: new Date().toISOString()
//             });
//             await fetchWorkflows(); 
//             toast({ title: "Check Passed", description: "Advancing to the next step." });

//         } else if (status === 'failed') {
//             // FAILURE: Cancel the workflow and reject the candidate
//             await supabase
//                 .from('offer_workflow')
//                 .update({ status: 'cancelled', updated_at: new Date().toISOString() })
//                 .eq('id', workflow.id);
            
//             // Also update the main application status to 'rejected'
//             await supabase
//                 .from('job_applications')
//                 .update({ status: 'rejected' })
//                 .eq('id', workflow.job_application_id);

//             toast({ title: "Check Failed", description: "This offer workflow has been cancelled.", variant: "destructive" });
//             await fetchWorkflows(); // Refresh the list to show the change
        
//         } else {
//             // PENDING: Do nothing, just show the status
//             toast({ title: "Check Pending", description: "The background check is still in progress." });
//         }

//     } catch (error: any) {
//         console.error('Error running background check:', error);
//         toast({ title: "Error", description: "Could not retrieve background check status.", variant: "destructive" });
//         // Close the modal on error
//         setShowResultDialog(false);
//     } finally {
//         setActionLoading(null);
//     }
//   };

//   const generateOffer = async (workflow: OfferWorkflow) => {
//     if (!templateFile) {
//       toast({
//         title: "Template Required",
//         description: "Please select or upload a template file first.",
//         variant: "destructive"
//       });
//       return;
//     }

//     setActionLoading(workflow.id);
    
//     try {
//       await supabase
//         .from('offer_workflow')
//         .update({
//           status: 'in_progress',
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', workflow.id);

//       const candidate = workflow.job_applications?.candidates?.profiles;
//       const job = workflow.job_applications?.jobs;

//       if (!candidate || !job) {
//         throw new Error('Missing candidate or job data');
//       }

//       const candidateData = formatCandidateDataForOffer(candidate, job);

//       if (offerAmount) {
//         candidateData.salary = offerAmount;
//       }

//       const response = await offerApiService.generateOfferLetter({
//         template_file: templateFile,
//         data: candidateData,
//         output_format: 'both'
//       });

//       if (response.success) {
//         setGeneratedOfferUrl(response.files?.pdf || null);
        
//         await advanceWorkflow(workflow.id, {
//           generated_offer_content: JSON.stringify(candidateData),
//           offer_details: {
//             position: job.title,
//             salary: candidateData.salary,
//             pdf_file_id: response.files?.pdf,
//             docx_file_id: response.files?.docx,
//             request_id: response.request_id
//           },
//           offer_generated_at: new Date().toISOString(),
//           final_offer_amount: parseFloat(candidateData.salary),
//           final_offer_currency: job.currency || 'USD'
//         });

//         toast({
//           title: "Offer Generated",
//           description: "Offer letter has been generated successfully.",
//         });
//       } else {
//         throw new Error(response.message || 'Failed to generate offer');
//       }
//     } catch (error) {
//       console.error('Error generating offer:', error);
      
//       await supabase
//         .from('offer_workflow')
//         .update({
//           status: 'failed',
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', workflow.id);

//       toast({
//         title: "Generation Failed",
//         description: error instanceof Error ? error.message : "Failed to generate offer letter.",
//         variant: "destructive"
//       });
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const approveOffer = async (workflow: OfferWorkflow) => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       await advanceWorkflow(workflow.id, {
//         hr_approval_status: 'approved',
//         hr_comments: hrComments,
//         hr_approved_by: user?.id,
//         hr_approved_at: new Date().toISOString()
//       });
//     } catch (error) {
//       console.error('Error approving offer:', error);
//       toast({
//         title: "Error",
//         description: "Failed to approve offer",
//         variant: "destructive",
//       });
//     }
//   };

//   const rejectOffer = async (workflow: OfferWorkflow) => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       await supabase
//         .from('offer_workflow')
//         .update({
//           hr_approval_status: 'rejected',
//           hr_comments: hrComments,
//           hr_approved_by: user?.id,
//           hr_approved_at: new Date().toISOString(),
//           status: 'failed',
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', workflow.id);

//       await fetchWorkflows();
//       toast({
//         title: "Offer Rejected",
//         description: "Offer has been rejected by HR",
//         variant: "destructive",
//       });
//     } catch (error) {
//       console.error('Error rejecting offer:', error);
//       toast({
//         title: "Error",
//         description: "Failed to reject offer",
//         variant: "destructive",
//       });
//     }
//   };

//   const sendToCandidate = async (workflow: OfferWorkflow) => {
//     if (!generatedOfferUrl && !workflow.offer_details?.pdf_file_id) {
//       toast({
//         title: "No Offer Letter",
//         description: "Please generate an offer letter first.",
//         variant: "destructive"
//       });
//       return;
//     }

//     setActionLoading(workflow.id);
    
//     try {
//       const candidate = workflow.job_applications?.candidates?.profiles;
//       const job = workflow.job_applications?.jobs;

//       if (!candidate || !job) {
//         throw new Error('Missing candidate or job data');
//       }

//       let pdfBlob: Blob;
      
//       if (workflow.offer_details?.pdf_file_id) {
//         pdfBlob = await offerApiService.downloadFile(workflow.offer_details.pdf_file_id);
//       } else if (generatedOfferUrl) {
//         const response = await fetch(generatedOfferUrl);
//         pdfBlob = await response.blob();
//       } else {
//         throw new Error('No offer letter available');
//       }

//       const pdfFile = new File([pdfBlob], `offer_letter_${candidate.first_name}_${candidate.last_name}.pdf`, {
//         type: 'application/pdf'
//       });

//       const emailContent = generateOfferEmailContent(
//         `${candidate.first_name} ${candidate.last_name}`,
//         job.title || 'the position'
//       );

//       const response = await offerApiService.sendOfferLetter({
//         pdf_file: pdfFile,
//         email_data: {
//           emails: [candidate.email || ''],
//           subject: `Job Offer - ${job.title}`,
//           html_content: emailContent
//         }
//       });

//       setEmailRequestId(response.request_id);
      
//       await advanceWorkflow(workflow.id, {
//         offer_letter_url: workflow.offer_details?.pdf_file_id || generatedOfferUrl,
//         sent_to_candidate_at: new Date().toISOString(),
//         candidate_notification_sent: true,
//         logs: [
//           ...(workflow.logs || []),
//           {
//             timestamp: new Date().toISOString(),
//             action: 'offer_sent',
//             email_request_id: response.request_id,
//             recipient: candidate.email
//           }
//         ]
//       });

//       toast({
//         title: "Offer Sent",
//         description: "Offer letter has been sent to the candidate.",
//       });

//       setShowEmailDialog(true);
      
//     } catch (error) {
//       console.error('Error sending offer:', error);
//       toast({
//         title: "Send Failed",
//         description: error instanceof Error ? error.message : "Failed to send offer to candidate",
//         variant: "destructive",
//       });
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const checkEmailStatus = async (requestId: string) => {
//     try {
//       const status = await offerApiService.getEmailStatus(requestId);
//       setEmailStatus(status);
//       return status;
//     } catch (error) {
//       console.error('Error checking email status:', error);
//       toast({
//         title: "Status Check Failed",
//         description: "Could not check email delivery status",
//         variant: "destructive"
//       });
//       return null;
//     }
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
//           file.name.endsWith('.docx')) {
        
//         if (selectedWorkflowForOffer) {
//           selectTemplateAndExtractFieldsFromUpload(file, selectedWorkflowForOffer);
//         } else {
//           setTemplateFile(file);
//           setSelectedTemplateId('');
//           toast({
//             title: "Template Uploaded",
//             description: `Template "${file.name}" has been uploaded successfully.`,
//           });
//         }
//       } else {
//         toast({
//           title: "Invalid File Type",
//           description: "Please upload a .docx file",
//           variant: "destructive"
//         });
//       }
//     }
//   };

//   const downloadGeneratedOffer = async (fileId: string) => {
//     try {
//       const blob = await offerApiService.downloadFile(fileId);
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `offer_letter_${Date.now()}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Error downloading file:', error);
//       toast({
//         title: "Download Failed",
//         description: "Could not download the file",
//         variant: "destructive"
//       });
//     }
//   };

//   const viewOfferLetter = async (offerLetterUrl: string) => {
//     try {
//       window.open(offerLetterUrl, '_blank');
//     } catch (error) {
//       console.error('Error opening offer letter:', error);
//       toast({
//         title: "View Failed",
//         description: "Could not open the offer letter",
//         variant: "destructive"
//       });
//     }
//   };

//   const updateCandidateResponse = async (workflowId: string, response: 'accepted' | 'rejected' | 'negotiating', comment?: string) => {
//     try {
//       const updateData: any = {
//         candidate_response: response,
//         candidate_response_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       };

//       if (comment) {
//         updateData.candidate_comment = comment;
//       }

//       if (response === 'accepted') {
//         updateData.status = 'completed';
//         updateData.current_step = 'completed';
//         updateData.workflow_completed_at = new Date().toISOString();
//       }

//       if (response === 'rejected') {
//         updateData.status = 'failed';
//       }

//       const { error } = await supabase
//         .from('offer_workflow')
//         .update(updateData)
//         .eq('id', workflowId);

//       if (error) throw error;

//       await fetchWorkflows();
      
//       toast({
//         title: "Response Updated",
//         description: `Candidate response recorded: ${response}`,
//       });
//     } catch (error) {
//       console.error('Error updating candidate response:', error);
//       toast({
//         title: "Update Failed",
//         description: "Failed to update candidate response",
//         variant: "destructive",
//       });
//     }
//   };

//   const getStepAction = (workflow: OfferWorkflow) => {
//     const step = workflow.current_step;
//     const isLoading = actionLoading === workflow.id;
//     const candidate = workflow.job_applications?.candidates?.profiles;

//     switch (step) {
//       case 'background_check':
//         if (workflow.background_check_status === 'completed') {
//           return (
//             <Badge variant="default" className="bg-green-500">
//               Background Check Completed
//             </Badge>
//           );
//         }
//         if (workflow.background_check_status === 'failed') {
//           return (
//             <Badge variant="destructive">
//               Background Check Failed
//             </Badge>
//           );
//         }
//         // **REMOVED:** The "Skip Background Check" button functionality has been removed.
//         return (
//           <Button 
//             onClick={() => runBackgroundCheck(workflow)}
//             disabled={isLoading}
//             size="sm"
//           >
//             {isLoading ? 'Running...' : 'Run Background Check'}
//           </Button>
//         );
//       case 'offer_generation':
//         return (
//           <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
//             <DialogTrigger asChild>
//               <Button size="sm" onClick={() => {
//                 setSelectedWorkflow(workflow);
//                 setSelectedWorkflowForOffer(workflow);
//                 setShowOfferDialog(true);
//                 fetchUploadedTemplates();
//               }}>
//                 Generate Offer
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Generate Offer</DialogTitle>
//                 <DialogDescription>
//                   Create offer letter for {candidate?.first_name} {candidate?.last_name}
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div>
//                   <Label>Select Template</Label>
//                   <div className="space-y-3 mt-2">
//                     {uploadedTemplates.length > 0 ? (
//                       <div>
//                         <Label className="text-sm font-medium">Uploaded Templates ({uploadedTemplates.length})</Label>
//                         <div className="space-y-2 mt-1 max-h-40 overflow-y-auto">
//                           {uploadedTemplates.map((template) => (
//                             <div 
//                               key={template.id}
//                               className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
//                                 selectedTemplateId === template.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
//                               }`}
//                               onClick={() => selectTemplateAndExtractFields(template.id, workflow)}
//                             >
//                               <div className="flex items-center space-x-3">
//                                 <FileText className="w-4 h-4 text-muted-foreground" />
//                                 <div>
//                                   <div className="font-medium text-sm">{template.template_name}</div>
//                                   <div className="text-xs text-muted-foreground">
//                                     {template.job_role} • {new Date(template.created_at).toLocaleDateString()}
//                                   </div>
//                                 </div>
//                               </div>
//                               {template.is_validated && (
//                                 <Badge variant="outline" className="text-xs">Validated</Badge>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="text-center py-4 text-muted-foreground">
//                         <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
//                         <p className="text-sm">No templates uploaded yet</p>
//                         <p className="text-xs">Upload a template below to get started</p>
//                       </div>
//                     )}
                    
//                     <div className="border-t pt-3">
//                       <Label htmlFor="template-upload" className="text-sm font-medium">Or Upload New Template</Label>
//                       <div className="flex items-center space-x-2 mt-2">
//                         <Input
//                           ref={fileInputRef}
//                           id="template-upload"
//                           type="file"
//                           accept=".docx"
//                           onChange={handleFileUpload}
//                           className="hidden"
//                         />
//                         <Button
//                           variant="outline"
//                           onClick={() => {
//                             setSelectedTemplateId('');
//                             fileInputRef.current?.click();
//                           }}
//                           className="flex items-center space-x-2"
//                         >
//                           <Upload className="h-4 w-4" />
//                           <span>Select File</span>
//                         </Button>
//                         {templateFile && !selectedTemplateId && (
//                           <span className="text-sm text-green-600">
//                             ✓ {templateFile.name}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <Label htmlFor="amount">Offer Amount ($)</Label>
//                   <Input
//                     id="amount"
//                     value={offerAmount}
//                     onChange={(e) => setOfferAmount(e.target.value)}
//                     placeholder="75000"
//                   />
//                 </div>
//                 {(workflow.offer_details?.pdf_file_id || workflow.offer_details?.offer_letter_url) && (
//                   <div className="border rounded-lg p-4 bg-green-50">
//                     <h4 className="text-sm font-medium text-green-800 mb-2">Generated Offer Letter</h4>
//                     <div className="flex items-center space-x-2">
//                       {workflow.offer_details?.pdf_file_id && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => downloadGeneratedOffer(workflow.offer_details.pdf_file_id)}
//                           className="flex items-center space-x-1"
//                         >
//                           <Download className="h-4 w-4" />
//                           <span>Download PDF</span>
//                         </Button>
//                       )}
//                       {workflow.offer_details?.docx_file_id && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => downloadGeneratedOffer(workflow.offer_details.docx_file_id)}
//                           className="flex items-center space-x-1"
//                         >
//                           <Download className="h-4 w-4" />
//                           <span>Download DOCX</span>
//                         </Button>
//                       )}
//                       {workflow.offer_details?.offer_letter_url && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => viewOfferLetter(workflow.offer_details.offer_letter_url)}
//                           className="flex items-center space-x-1"
//                         >
//                           <Eye className="h-4 w-4" />
//                           <span>View Offer</span>
//                         </Button>
//                       )}
//                     </div>
//                     <p className="text-xs text-green-600 mt-2">
//                       Offer generated and saved on {workflow.offer_generated_at ? new Date(workflow.offer_generated_at).toLocaleDateString() : 'recently'}
//                     </p>
//                   </div>
//                 )}
//                 <Button 
//                   onClick={() => {
//                     generateOffer(workflow);
//                     setShowOfferDialog(false);
//                   }}
//                   disabled={extractingFields}
//                   className="w-full"
//                 >
//                   {extractingFields ? 'Extracting Fields...' : 'Select Template & Continue'}
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         );
//       case 'hr_approval':
//         if (workflow.hr_approval_status === 'approved') {
//           return (
//             <Badge variant="default" className="bg-green-500">
//               HR Approved
//             </Badge>
//           );
//         }
//         if (workflow.hr_approval_status === 'rejected') {
//           return (
//             <Badge variant="destructive">
//               HR Rejected
//             </Badge>
//           );
//         }
//         return (
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button size="sm" onClick={() => setSelectedWorkflow(workflow)}>
//                 Review & Approve
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>HR Approval</DialogTitle>
//                 <DialogDescription>
//                   Review and approve offer for {candidate?.first_name} {candidate?.last_name}
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4">
//                 {workflow.offer_details && (
//                   <div className="p-4 bg-muted rounded-lg">
//                     <h4 className="font-medium mb-2">Offer Details</h4>
//                     <p><strong>Position:</strong> {workflow.offer_details.position}</p>
//                     <p><strong>Salary:</strong> {workflow.final_offer_currency} {workflow.final_offer_amount}</p>
//                   </div>
//                 )}
//                 <div>
//                   <Label htmlFor="comments">HR Comments</Label>
//                   <Textarea
//                     id="comments"
//                     value={hrComments}
//                     onChange={(e) => setHrComments(e.target.value)}
//                     placeholder="Add any comments or notes..."
//                   />
//                 </div>
//                 <div className="flex space-x-2">
//                   <Button 
//                     onClick={() => approveOffer(workflow)}
//                     disabled={isLoading}
//                     className="flex-1"
//                   >
//                     {isLoading ? 'Approving...' : 'Approve Offer'}
//                   </Button>
//                   <Button 
//                     onClick={() => rejectOffer(workflow)}
//                     disabled={isLoading}
//                     variant="destructive"
//                     className="flex-1"
//                   >
//                     {isLoading ? 'Rejecting...' : 'Reject Offer'}
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         );
//       case 'candidate_review':
//         if (!workflow.sent_to_candidate_at) {
//           return (
//             <Button 
//               onClick={() => sendToCandidate(workflow)}
//               disabled={isLoading}
//               size="sm"
//             >
//               {isLoading ? 'Sending...' : 'Send to Candidate'}
//             </Button>
//           );
//         }
//         return (
//           <Badge variant="secondary">
//             {workflow.candidate_response === 'accepted' ? 'Accepted' :
//              workflow.candidate_response === 'rejected' ? 'Rejected' :
//              workflow.candidate_response === 'negotiating' ? 'Negotiating' :
//              'Awaiting Response'}
//           </Badge>
//         );
//       case 'completed':
//         return (
//           <Badge variant="default" className="bg-green-500">
//             Workflow Completed
//           </Badge>
//         );
//       default:
//         return (
//           <Badge variant="outline">Unknown Step</Badge>
//         );
//     }
//   };

//   const getStepIndex = (step: string) => {
//     const stepObj = WORKFLOW_STEPS.find(s => s.id === step);
//     return stepObj ? stepObj.step : 1;
//   };

//   const generateOfferWithFields = async () => {
//     if (!templateFile || !selectedWorkflowForOffer) {
//       toast({
//         title: "Error",
//         description: "Template file or workflow not found",
//         variant: "destructive"
//       });
//       return;
//     }

//     try {
//       setGeneratingOffer(true);

//       const offerData = {
//         candidate_name: fieldValues.candidate_name || '',
//         position: fieldValues.position || '',
//         salary: fieldValues.salary || '',
//         start_date: fieldValues.start_date || '',
//         company_name: fieldValues.company_name || '',
//         ...fieldValues
//       };

//       const response = await offerApiService.generateOfferLetter({
//         template_file: templateFile,
//         data: offerData,
//         output_format: 'both'
//       });

//       if (response.success) {
//         let pdfFile: Blob | null = null;
//         let docxFile: Blob | null = null;
//         let offerLetterUrl: string | null = null;

//         try {
//           if (response.files?.pdf) {
//             pdfFile = await offerApiService.downloadFile(response.files.pdf);
//           }
//           if (response.files?.docx) {
//             docxFile = await offerApiService.downloadFile(response.files.docx);
//           }

//           if (pdfFile && profile?.id) {
//             const fileName = `${profile.id}/${selectedWorkflowForOffer.job_application_id}/offer_letter_${Date.now()}.pdf`;
            
//             const { data: uploadData, error: uploadError } = await supabase.storage
//               .from('offer-letters')
//               .upload(fileName, pdfFile, {
//                 contentType: 'application/pdf',
//                 upsert: false
//               });

//             if (uploadError) {
//               offerLetterUrl = response.files?.pdf || null;
//             } else {
//               const { data: { publicUrl } } = supabase.storage
//                 .from('offer-letters')
//                 .getPublicUrl(fileName);
              
//               offerLetterUrl = publicUrl;
//             }
//           } else {
//             offerLetterUrl = response.files?.pdf || null;
//           }

//           const salaryString = fieldValues.salary?.replace(/[^0-9.-]+/g, '') || '0';
//           const salaryAmount = parseFloat(salaryString);
          
//           const offerRecord = {
//             application_id: selectedWorkflowForOffer.job_application_id,
//             salary_amount: salaryAmount > 0 ? salaryAmount : 50000,
//             currency: fieldValues.currency || 'USD',
//             start_date: fieldValues.start_date || null,
//             offer_letter_url: offerLetterUrl,
//             status: 'draft',
//             benefits: fieldValues.benefits ? 
//               (typeof fieldValues.benefits === 'string' ? JSON.parse(fieldValues.benefits) : fieldValues.benefits) : 
//               null,
//           };

//           const { data: offerData, error: offerError } = await supabase
//             .from('offers')
//             .insert(offerRecord)
//             .select()
//             .single();

//         } catch (fileError) {
//           console.error('Error handling files:', fileError);
//         }

//         await advanceWorkflow(selectedWorkflowForOffer.id, {
//           generated_offer_content: JSON.stringify(fieldValues),
//           offer_details: {
//             ...fieldValues,
//             pdf_file_id: response.files?.pdf,
//             docx_file_id: response.files?.docx,
//             offer_letter_url: offerLetterUrl,
//             api_request_id: response.request_id
//           },
//           offer_generated_at: new Date().toISOString()
//         });

//         setGeneratedOfferUrl(offerLetterUrl);

//         setShowFieldsDialog(false);
//         toast({
//           title: "Offer Letter Generated!",
//           description: "The offer letter has been generated and saved successfully.",
//         });

//       } else {
//         throw new Error(response.message || 'Failed to generate offer letter');
//       }

//     } catch (error) {
//       console.error('Error in generateOfferWithFields:', error);
//       toast({
//         title: "Generation Failed",
//         description: error instanceof Error ? error.message : "Failed to generate offer letter",
//         variant: "destructive",
//       });
//     } finally {
//       setGeneratingOffer(false);
//     }
//   };

//   const handleInputChange = (fieldId: string, value: string) => {
//     setFieldValues(prev => ({
//       ...prev,
//       [fieldId]: value
//     }));
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed': return 'bg-green-500';
//       case 'failed': return 'bg-red-500';
//       case 'cancelled': return 'bg-gray-500';
//       case 'in_progress': return 'bg-blue-500';
//       case 'pending': return 'bg-yellow-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   if (loading) {
//     return <div className="p-6">Loading offer workflows...</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Offer Management Workflow</h2>
//         {/* NOTE: Per your request, this button will be removed later */}
//         <Dialog open={showCreateWorkflowDialog} onOpenChange={setShowCreateWorkflowDialog}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="w-4 h-4 mr-2" />
//               Create Workflow
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Create New Offer Workflow</DialogTitle>
//               <DialogDescription>
//                 Start a new offer workflow for a selected candidate
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="application-select">Select Job Application</Label>
//                 <Input
//                   id="application-select"
//                   placeholder="Enter Job Application ID"
//                   value={selectedApplicationId}
//                   onChange={(e) => setSelectedApplicationId(e.target.value)}
//                 />
//                 <p className="text-sm text-muted-foreground mt-1">
//                   You can find this ID in the job applications list
//                 </p>
//               </div>
//               <Button 
//                 onClick={() => createWorkflow({ job_application_id: selectedApplicationId })}
//                 disabled={!selectedApplicationId}
//                 className="w-full"
//               >
//                 Create Workflow
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="grid gap-6">
//         {workflows.map((workflow) => {
//           const candidate = workflow.job_applications?.candidates?.profiles;
//           const job = workflow.job_applications?.jobs;
          
//           return (
//             <Card key={workflow.id}>
//               <CardHeader>
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <CardTitle className="text-lg">
//                       {job?.title} - {candidate?.first_name} {candidate?.last_name}
//                     </CardTitle>
//                     <CardDescription className="space-y-1">
//                       <div>Started {new Date(workflow.created_at).toLocaleDateString()}</div>
//                       {workflow.priority_level && (
//                         <div className="flex items-center space-x-2">
//                           <span>Priority:</span>
//                           <Badge variant={workflow.priority_level <= 2 ? "destructive" : workflow.priority_level <= 3 ? "default" : "secondary"}>
//                             {workflow.priority_level <= 2 ? "High" : workflow.priority_level <= 3 ? "Medium" : "Low"}
//                           </Badge>
//                         </div>
//                       )}
//                       {workflow.estimated_completion_date && (
//                         <div className="text-sm">
//                           Expected completion: {new Date(workflow.estimated_completion_date).toLocaleDateString()}
//                         </div>
//                       )}
//                     </CardDescription>
//                   </div>
//                   <Badge className={getStatusColor(workflow.status)}>
//                     {workflow.status.replace('_', ' ').toUpperCase()}
//                   </Badge>
//                 </div>
//               </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex justify-between text-sm mb-2">
//                     <span>Progress</span>
//                     <span>Step {getStepIndex(workflow.current_step)} of 5</span>
//                   </div>
//                   <Progress value={(getStepIndex(workflow.current_step) / 5) * 100} className="h-2" />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="flex space-x-4">
//                     {WORKFLOW_STEPS.map((step) => {
//                       const Icon = step.icon;
//                       const currentStepIndex = getStepIndex(workflow.current_step);
//                       const stepIndex = step.step;
//                       const isCompleted = stepIndex < currentStepIndex;
//                       const isCurrent = stepIndex === currentStepIndex;
                      
//                       return (
//                         <div key={step.id} className="flex items-center space-x-2">
//                           <div className={`p-2 rounded-full ${
//                             isCompleted ? 'bg-green-100 text-green-600' :
//                             isCurrent ? 'bg-blue-100 text-blue-600' :
//                             'bg-gray-100 text-gray-400'
//                           }`}>
//                             <Icon className="w-4 h-4" />
//                           </div>
//                           <span className={`text-sm ${
//                             isCompleted ? 'text-green-600' :
//                             isCurrent ? 'text-blue-600' :
//                             'text-gray-400'
//                           }`}>
//                             {step.name}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
                  
//                   <div className="ml-4">
//                     {workflow.status !== 'completed' && workflow.status !== 'failed' && workflow.status !== 'cancelled' && (
//                       getStepAction(workflow)
//                     )}
//                   </div>
//                 </div>

//                 {workflow.status === 'completed' && workflow.candidate_response === 'accepted' && (
//                   <div className="flex items-center space-x-2 text-green-600">
//                     <CheckCircle className="w-4 h-4" />
//                     <span className="text-sm">Offer accepted by candidate</span>
//                     {workflow.workflow_completed_at && (
//                       <span className="text-xs text-muted-foreground">
//                         on {new Date(workflow.workflow_completed_at).toLocaleDateString()}
//                       </span>
//                     )}
//                   </div>
//                 )}

//                 {(workflow.status === 'failed' || workflow.candidate_response === 'rejected') && (
//                   <div className="flex items-center space-x-2 text-red-600">
//                     <AlertCircle className="w-4 h-4" />
//                     <span className="text-sm">
//                       {workflow.candidate_response === 'rejected' ? 'Offer rejected by candidate' : 'Workflow failed'}
//                     </span>
//                     {workflow.candidate_comment && (
//                       <span className="text-xs text-muted-foreground">
//                         - {workflow.candidate_comment}
//                       </span>
//                     )}
//                   </div>
//                 )}

//                 {workflow.status === 'cancelled' && (
//                   <div className="flex items-center space-x-2 text-gray-600">
//                     <AlertCircle className="w-4 h-4" />
//                     <span className="text-sm">Workflow cancelled</span>
//                   </div>
//                 )}

//                 {workflow.candidate_response === 'negotiating' && (
//                   <div className="flex items-center space-x-2 text-yellow-600">
//                     <Clock className="w-4 h-4" />
//                     <span className="text-sm">Candidate is negotiating terms</span>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//           );
//         })}

//         {workflows.length === 0 && (
//           <Card>
//             <CardContent className="flex items-center justify-center py-12">
//               <div className="text-center text-muted-foreground">
//                 <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
//                 <p>No offer workflows found</p>
//                 <p className="text-sm">Workflows will appear here when candidates are selected for offers</p>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Email Delivery Status</DialogTitle>
//             <DialogDescription>
//               Track the delivery status of your offer letter email
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             {emailRequestId && (
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span>Request ID:</span>
//                   <code className="text-xs bg-muted px-2 py-1 rounded">{emailRequestId}</code>
//                 </div>
                
//                 {emailStatus && (
//                   <>
//                     <div className="flex items-center justify-between">
//                       <span>Status:</span>
//                       <Badge variant={
//                         emailStatus.status === 'completed' ? 'default' : 
//                         emailStatus.status === 'failed' ? 'destructive' : 'secondary'
//                       }>
//                         {emailStatus.status}
//                       </Badge>
//                     </div>
                    
//                     <div className="space-y-2">
//                       <div className="flex items-center justify-between text-sm">
//                         <span>Progress</span>
//                         <span>{emailStatus.progress_percentage}%</span>
//                       </div>
//                       <Progress value={emailStatus.progress_percentage} className="w-full" />
//                     </div>
                    
//                     <div className="grid grid-cols-3 gap-4 text-sm">
//                       <div className="text-center">
//                         <div className="font-medium text-green-600">{emailStatus.sent_count}</div>
//                         <div className="text-muted-foreground">Sent</div>
//                       </div>
//                       <div className="text-center">
//                         <div className="font-medium text-yellow-600">{emailStatus.pending_count}</div>
//                         <div className="text-muted-foreground">Pending</div>
//                       </div>
//                       <div className="text-center">
//                         <div className="font-medium text-red-600">{emailStatus.failed_count}</div>
//                         <div className="text-muted-foreground">Failed</div>
//                       </div>
//                     </div>
                    
//                     {emailStatus.errors && emailStatus.errors.length > 0 && (
//                       <div className="space-y-2">
//                         <h4 className="text-sm font-medium">Errors:</h4>
//                         <ScrollArea className="h-20">
//                           <div className="space-y-1">
//                             {emailStatus.errors.map((error, index) => (
//                               <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
//                                 {error}
//                               </p>
//                             ))}
//                           </div>
//                         </ScrollArea>
//                       </div>
//                     )}
//                   </>
//                 )}
                
//                 <Button 
//                   onClick={() => emailRequestId && checkEmailStatus(emailRequestId)}
//                   variant="outline"
//                   className="w-full"
//                 >
//                   Refresh Status
//                 </Button>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* NOTE: Per your request, this dialog will be removed later */}
//       <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
//         <DialogTrigger asChild>
//           <Button className="mb-4 hidden"> {/* Hidden to avoid duplication */}
//             <Plus className="w-4 h-4 mr-2" />
//             Create New Workflow
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Create New Offer Workflow</DialogTitle>
//             <DialogDescription>
//               Start a new offer workflow for a job application
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium">Job Application ID</label>
//               <Input
//                 value={formData.job_application_id}
//                 onChange={(e) => setFormData(prev => ({ ...prev, job_application_id: e.target.value }))}
//                 placeholder="Enter job application ID"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium">Priority Level</label>
//               <Select 
//                 value={String(formData.priority_level)} 
//                 onValueChange={(value) => setFormData(prev => ({ ...prev, priority_level: parseInt(value) }))}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select priority level" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="1">Urgent (1)</SelectItem>
//                   <SelectItem value="2">High (2)</SelectItem>
//                   <SelectItem value="3">Medium (3)</SelectItem>
//                   <SelectItem value="4">Low (4)</SelectItem>
//                   <SelectItem value="5">Very Low (5)</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <label className="text-sm font-medium">Estimated Completion Date</label>
//               <Input
//                 type="date"
//                 value={formData.estimated_completion_date}
//                 onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion_date: e.target.value }))}
//               />
//             </div>
//             <div className="flex justify-end space-x-2 pt-4">
//               <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={() => createWorkflow(formData)} disabled={creating}>
//                 {creating ? "Creating..." : "Create Workflow"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={showFieldsDialog} onOpenChange={setShowFieldsDialog}>
//         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Fill Template Fields</DialogTitle>
//             <p className="text-sm text-muted-foreground">
//               Please fill in the extracted fields from the template to generate the offer letter.
//             </p>
//           </DialogHeader>
          
//           <div className="space-y-4">
//             {extractedFields.map((field) => (
//               <div key={field.id} className="space-y-2">
//                 <label htmlFor={field.id} className="text-sm font-medium">
//                   {field.label}
//                   {field.required && <span className="text-red-500 ml-1">*</span>}
//                 </label>
                
//                 {field.type === 'text' && (
//                   <Input
//                     id={field.id}
//                     value={fieldValues[field.id] || ''}
//                     onChange={(e) => handleInputChange(field.id, e.target.value)}
//                     placeholder={field.placeholder}
//                     required={field.required}
//                   />
//                 )}
                
//                 {field.type === 'textarea' && (
//                   <Textarea
//                     id={field.id}
//                     value={fieldValues[field.id] || ''}
//                     onChange={(e) => handleInputChange(field.id, e.target.value)}
//                     placeholder={field.placeholder}
//                     required={field.required}
//                     rows={3}
//                   />
//                 )}
                
//                 {field.type === 'select' && field.options && (
//                   <Select 
//                     value={fieldValues[field.id] || ''} 
//                     onValueChange={(value) => handleInputChange(field.id, value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder={field.placeholder || "Select an option"} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {field.options.map((option) => (
//                         <SelectItem key={option} value={option}>
//                           {option}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
                
//                 {field.type === 'number' && (
//                   <Input
//                     id={field.id}
//                     type="number"
//                     value={fieldValues[field.id] || ''}
//                     onChange={(e) => handleInputChange(field.id, e.target.value)}
//                     placeholder={field.placeholder}
//                     required={field.required}
//                   />
//                 )}
                
//                 {field.type === 'date' && (
//                   <Input
//                     id={field.id}
//                     type="date"
//                     value={fieldValues[field.id] || ''}
//                     onChange={(e) => handleInputChange(field.id, e.target.value)}
//                     required={field.required}
//                   />
//                 )}
                
//                 {field.description && (
//                   <p className="text-xs text-muted-foreground">{field.description}</p>
//                 )}
//               </div>
//             ))}
//           </div>
          
//           <div className="flex justify-end space-x-2 pt-4">
//             <Button variant="outline" onClick={() => setShowFieldsDialog(false)}>
//               Cancel
//             </Button>
//             <Button 
//               onClick={generateOfferWithFields} 
//               disabled={generatingOffer}
//             >
//               {generatingOffer ? "Generating..." : "Generate Offer Letter"}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
      
//       {/* **ADDED:** This is the popup dialog from the old file
//       <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
//         <DialogContent>
//             <DialogHeader>
//             <DialogTitle>Background Check Result</DialogTitle>
//             </DialogHeader>
//             <div className="min-h-[150px] flex items-center justify-center">
//             {!bgCheckResult ? (
//                 <div className="text-center space-y-2">
//                 <p>Running background check...</p>
//                 <p className="text-sm text-muted-foreground">Please wait a moment.</p>
//                 </div>
//             ) : (
//                 <div className="space-y-4 text-center">
//                 <div>
//                     <p className="text-sm text-muted-foreground">Status</p>
//                     <Badge 
//                     variant={bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required' ? 'default' : 'destructive'}
//                     className="text-lg"
//                     >
//                     {bgCheckResult.status}
//                     </Badge>
//                 </div>
//                 <div>
//                     <p className="text-sm text-muted-foreground">Remarks</p>
//                     <p className="font-medium">{bgCheckResult.remarks}</p>
//                 </div>
//                 <Button onClick={() => setShowResultDialog(false)}>
//                     Close
//                 </Button>
//                 </div>
//             )}
//             </div>
//         </DialogContent>
//       </Dialog> */}
// {/* Professional Background Check Modal */}
// <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
//   <DialogContent className="max-w-md mx-auto p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border-0">
//     <div className="relative">
//       {/* Animated background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60"></div>
      
//       {/* Header with icon */}
//       <div className="relative px-8 pt-8 pb-6 text-center">
//         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg ring-8 ring-blue-50 mb-4">
//           <Shield className="w-8 h-8 text-blue-600" />
//         </div>
//         <h3 className="text-2xl font-bold text-gray-900 mb-2">Background Verification</h3>
//         <p className="text-sm text-gray-600">Comprehensive candidate screening in progress</p>
//       </div>

//       {/* Content Area */}
//       <div className="relative px-8 pb-8 min-h-[200px]">
//         {!bgCheckResult ? (
//           /* Loading State */
//           <div className="text-center space-y-6">
//             <div className="relative">
//               <div className="inline-flex items-center justify-center">
//                 <div className="relative">
//                   <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
//                   <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse"></div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="space-y-3">
//               <div className="flex items-center justify-center space-x-2">
//                 <FileCheck className="w-4 h-4 text-blue-500" />
//                 <p className="text-base font-medium text-gray-700">Running comprehensive checks...</p>
//               </div>
              
//               {/* Progress indicators */}
//               <div className="space-y-2">
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <span>Verifying identity</span>
//                   <span>✓</span>
//                 </div>
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <span>Criminal background</span>
//                   <Loader2 className="w-3 h-3 animate-spin" />
//                 </div>
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <span>Employment history</span>
//                   <span>⏳</span>
//                 </div>
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <span>Professional references</span>
//                   <span>⏳</span>
//                 </div>
//               </div>
//             </div>
            
//             <p className="text-sm text-gray-500">This may take a few moments...</p>
//           </div>
//         ) : (
//           /* Result State */
//           <div className="text-center space-y-6 animate-in fade-in-50 duration-500">
//             {/* Status Icon with gradient background */}
//             <div className="relative">
//               <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${
//                 bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required' 
//                   ? 'from-green-500 to-emerald-600'
//                   : bgCheckResult.status === 'failed'
//                   ? 'from-red-500 to-rose-600'
//                   : 'from-yellow-500 to-amber-600'
//               } shadow-lg`}>
//                 <div className="w-18 h-18 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
//                   {bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required' ? (
//                     <CheckCircle className="w-8 h-8 text-green-500" />
//                   ) : bgCheckResult.status === 'failed' ? (
//                     <XCircle className="w-8 h-8 text-red-500" />
//                   ) : (
//                     <Clock className="w-8 h-8 text-yellow-500" />
//                   )}
//                 </div>
//               </div>
//               {(bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required') && (
//                 <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
//                   <CheckCircle className="w-4 h-4 text-white" />
//                 </div>
//               )}
//             </div>

//             {/* Status Badge */}
//             <div className="space-y-2">
//               <Badge 
//                 className={`text-lg px-4 py-2 rounded-full font-semibold ${
//                   bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required'
//                     ? 'bg-green-500 hover:bg-green-600 text-white'
//                     : bgCheckResult.status === 'failed'
//                     ? 'bg-red-500 hover:bg-red-600 text-white'
//                     : 'bg-yellow-500 hover:bg-yellow-600 text-white'
//                 }`}
//               >
//                 {bgCheckResult.status.toUpperCase().replace('_', ' ')}
//               </Badge>
//             </div>

//             {/* Remarks */}
//             <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
//               <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
//                 Verification Details
//               </p>
//               <p className="text-sm text-gray-700 leading-relaxed">
//                 {bgCheckResult.remarks}
//               </p>
//             </div>

//             {/* Action Button */}
//             <Button 
//               onClick={() => setShowResultDialog(false)}
//               className={`w-full rounded-xl py-3 font-semibold transition-all duration-200 transform hover:scale-105 ${
//                 bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required'
//                   ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
//                   : bgCheckResult.status === 'failed'
//                   ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg'
//                   : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
//               }`}
//             >
//               Continue
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   </DialogContent>
// </Dialog>

//     </div>
//   );
// };

// export default OfferWorkflowManager;


import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Clock, FileText, Mail, UserCheck, AlertCircle, Download, Upload, Plus } from 'lucide-react';
import OfferLetterApiService, { formatCandidateDataForOffer, generateOfferEmailContent, TemplateField } from '@/services/offerLetterApi';
import { FileCheck } from 'lucide-react';
import {  Shield, XCircle, Loader2 } from 'lucide-react';


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
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [generatedOfferData, setGeneratedOfferData] = useState<any>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
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

  // **ADDED:** State for the background check popup
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [bgCheckResult, setBgCheckResult] = useState<{ status: string; remarks: string } | null>(null);

  useEffect(() => {
    fetchWorkflows();
    fetchUploadedTemplates();
  }, []);

  // Cleanup blob URLs when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewPdfUrl && previewPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewPdfUrl);
      }
    };
  }, [previewPdfUrl]);

  const cleanupBlobUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const createWorkflow = async (formData: any) => {
    setCreating(true);
    try {
      const newWorkflow = {
        job_application_id: formData.job_application_id,
        current_step: 'background_check',
        status: 'pending',
        priority_level: formData.priority_level || 3,
        estimated_completion_date: formData.estimated_completion_date,
      };

      const { error } = await supabase
        .from('offer_workflow')
        .insert(newWorkflow as any);

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
      const { data: currentWorkflow, error: fetchError } = await supabase
        .from('offer_workflow')
        .select('current_step, status')
        .eq('id', workflowId)
        .single();

      if (fetchError) throw fetchError;

      const currentStepObj = WORKFLOW_STEPS.find(s => s.id === String(currentWorkflow.current_step));
      const currentStepNumber = currentStepObj ? currentStepObj.step : 1;
      const nextStep = WORKFLOW_STEPS.find(s => s.step === currentStepNumber + 1);

      const updateData = {
        ...stepData,
        updated_at: new Date().toISOString(),
      };

      if (currentWorkflow.status === 'pending') {
        updateData.status = 'in_progress';
      }

      if (nextStep && nextStep.id !== 'completed') {
        updateData.current_step = nextStep.id;
      } else if (nextStep && nextStep.id === 'completed') {
        updateData.current_step = 'candidate_review';
      }

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

      const { data, error } = await supabase.storage
        .from('offer-templates')
        .download(template.template_content);

      if (error) throw error;

      const file = new File([data], template.template_name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      setTemplateFile(file);
      setSelectedTemplateId(templateId);

      const extractResponse = await offerApiService.extractTemplateFields(file);
      
      let fields: TemplateField[] = [];
      
      if (extractResponse.success) {
        if (extractResponse.fields && Array.isArray(extractResponse.fields)) {
          fields = extractResponse.fields;
        } else if (extractResponse.template_info?.placeholders && Array.isArray(extractResponse.template_info.placeholders)) {
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
          const candidate = workflow.job_applications?.candidates?.profiles;
          const job = workflow.job_applications?.jobs;
          
          const prefilledData: Record<string, any> = {};
          const candidateData = formatCandidateDataForOffer(candidate, job);
          
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

      const extractResponse = await offerApiService.extractTemplateFields(file);
      
      let fields: TemplateField[] = [];
      
      if (extractResponse.success) {
        if (extractResponse.fields && Array.isArray(extractResponse.fields)) {
          fields = extractResponse.fields;
        } else if (extractResponse.template_info?.placeholders && Array.isArray(extractResponse.template_info.placeholders)) {
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
          const candidate = workflow.job_applications?.candidates?.profiles;
          const job = workflow.job_applications?.jobs;
          
          const prefilledData: Record<string, any> = {};
          const candidateData = formatCandidateDataForOffer(candidate, job);
          
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

  // **MODIFIED:** This function has been replaced with your requested logic
  const runBackgroundCheck = async (workflow: OfferWorkflow) => {
    if (!workflow.job_applications?.candidates?.profile_id) {
        toast({ title: "Error", description: "Candidate profile ID not found.", variant: "destructive" });
        return;
    }
    
    setActionLoading(workflow.id);
    setShowResultDialog(true); // Open the modal immediately
    setBgCheckResult(null); // Clear previous results

    try {
        // Simulate a 2-3 second check for a better user experience
        await new Promise(resolve => setTimeout(resolve, 2500));

        // 1. Fetch the background check data from the 'candidates' table.
        const { data: candidateData, error: fetchError } = await supabase
            .from('candidates')
            .select('background_check_status, background_check_remarks')
            .eq('profile_id', workflow.job_applications.candidates.profile_id)
            .single();

        if (fetchError) throw fetchError;

        const status = candidateData?.background_check_status || 'pending';
        const remarks = candidateData?.background_check_remarks || 'No remarks found.';

        // Display the result in the modal
        setBgCheckResult({ status, remarks });

        // 2. Make the automatic workflow decision.
        if (status === 'completed' || status === 'not_required') {
            // SUCCESS: Advance the workflow
            await advanceWorkflow(workflow.id, {
                background_check_status: 'completed',
                background_check_completed_at: new Date().toISOString()
            });
            await fetchWorkflows(); 
            toast({ title: "Check Passed", description: "Advancing to the next step." });

        } else if (status === 'failed') {
            // FAILURE: Cancel the workflow and reject the candidate
            await supabase
                .from('offer_workflow')
                .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                .eq('id', workflow.id);
            
            // Also update the main application status to 'rejected'
            await supabase
                .from('job_applications')
                .update({ status: 'rejected' })
                .eq('id', workflow.job_application_id);

            toast({ title: "Check Failed", description: "This offer workflow has been cancelled.", variant: "destructive" });
            await fetchWorkflows(); // Refresh the list to show the change
        
        } else {
            // PENDING: Do nothing, just show the status
            toast({ title: "Check Pending", description: "The background check is still in progress." });
        }

    } catch (error: any) {
        console.error('Error running background check:', error);
        toast({ title: "Error", description: "Could not retrieve background check status.", variant: "destructive" });
        // Close the modal on error
        setShowResultDialog(false);
    } finally {
        setActionLoading(null);
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
      await supabase
        .from('offer_workflow')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      const candidate = workflow.job_applications?.candidates?.profiles;
      const job = workflow.job_applications?.jobs;

      if (!candidate || !job) {
        throw new Error('Missing candidate or job data');
      }

      const candidateData = formatCandidateDataForOffer(candidate, job);

      if (offerAmount) {
        candidateData.salary = offerAmount;
      }

      const response = await offerApiService.generateOfferLetter({
        template_file: templateFile,
        data: candidateData,
        output_format: 'both'
      });

      if (response.success) {
        setGeneratedOfferUrl(response.files?.pdf || null);
        
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
          final_offer_amount: parseFloat(candidateData.salary)
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

      let pdfBlob: Blob;
      
      if (workflow.offer_details?.pdf_file_id) {
        pdfBlob = await offerApiService.downloadFile(workflow.offer_details.pdf_file_id);
      } else if (generatedOfferUrl) {
        const response = await fetch(generatedOfferUrl);
        pdfBlob = await response.blob();
      } else {
        throw new Error('No offer letter available');
      }

      const pdfFile = new File([pdfBlob], `offer_letter_${candidate.first_name}_${candidate.last_name}.pdf`, {
        type: 'application/pdf'
      });

      const emailContent = generateOfferEmailContent(
        `${candidate.first_name} ${candidate.last_name}`,
        job.title || 'the position'
      );

      const response = await offerApiService.sendOfferLetter({
        pdf_file: pdfFile,
        email_data: {
          emails: [candidate.email || ''],
          subject: `Job Offer - ${job.title}`,
          html_content: emailContent
        }
      });

      setEmailRequestId(response.request_id);
      
      try {
        const { data: currentOffer, error: getCurrentOfferError } = await supabase
          .from('offers')
          .select('id, logs')
          .eq('job_application_id', workflow.job_application_id)
          .single();

        if (!getCurrentOfferError && currentOffer) {
          const existingLogs = currentOffer.logs || [];
          const updatedLogs = Array.isArray(existingLogs) ? existingLogs : 
            (typeof existingLogs === 'string' ? JSON.parse(existingLogs) : []);
          
          const { error: offerUpdateError } = await supabase
            .from('offers')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              logs: JSON.stringify([
                ...updatedLogs,
                {
                  timestamp: new Date().toISOString(),
                  action: 'offer_sent',
                  email_request_id: response.request_id,
                  recipient: candidate.email
                }
              ]),
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', currentOffer.id);

          if (offerUpdateError) {
            console.error('Error updating offers table:', offerUpdateError);
          } else {
            console.log('Offers table updated successfully - status set to sent');
          }
        } else {
          console.error('Error finding offer to update:', getCurrentOfferError);
        }
      } catch (offerError) {
        console.error('Error updating offers table:', offerError);
      }
      
      await advanceWorkflow(workflow.id, {
        offer_letter_url: workflow.offer_details?.session_pdf_url || workflow.offer_details?.pdf_file_id || generatedOfferUrl,
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
      const { data: workflow, error: workflowError } = await supabase
        .from('offer_workflow')
        .select('job_application_id')
        .eq('id', workflowId)
        .single();

      if (workflowError || !workflow) {
        throw new Error('Failed to find workflow');
      }

      const updateData: any = {
        candidate_response: response,
        candidate_response_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (comment) {
        updateData.candidate_comment = comment;
      }

      if (response === 'accepted') {
        updateData.status = 'completed';
        updateData.current_step = 'completed';
        updateData.workflow_completed_at = new Date().toISOString();
      }

      if (response === 'rejected') {
        updateData.status = 'failed';
      }

      const { error } = await supabase
        .from('offer_workflow')
        .update(updateData)
        .eq('id', workflowId);

      if (error) throw error;

      try {
        const { data: currentOffer, error: getCurrentOfferError } = await supabase
          .from('offers')
          .select('id, logs')
          .eq('job_application_id', workflow.job_application_id)
          .single();

        if (!getCurrentOfferError && currentOffer) {
          const existingLogs = currentOffer.logs || [];
          const updatedLogs = Array.isArray(existingLogs) ? existingLogs : 
            (typeof existingLogs === 'string' ? JSON.parse(existingLogs) : []);
          
          const offerUpdateData: any = {
            status: response === 'accepted' ? 'accepted' : response === 'rejected' ? 'rejected' : 'sent',
            responded_at: new Date().toISOString(),
            logs: JSON.stringify([
              ...updatedLogs,
              {
                timestamp: new Date().toISOString(),
                action: `offer_${response}`,
                comment: comment || null
              }
            ]),
            updated_at: new Date().toISOString()
          };

          const { error: offerError } = await supabase
            .from('offers')
            .update(offerUpdateData)
            .eq('id', currentOffer.id);

          if (offerError) {
            console.error('Error updating offers table:', offerError);
          } else {
            console.log('Offers table updated with candidate response:', response);
          }
        } else {
          console.error('Error finding offer to update:', getCurrentOfferError);
        }
      } catch (offerError) {
        console.error('Error updating offers table:', offerError);
      }

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
        // **REMOVED:** The "Skip Background Check" button has been removed from here.
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
                fetchUploadedTemplates();
              }}>
                Generate Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate Offer Letter</DialogTitle>
                <DialogDescription>
                  Select a template and set the offer amount for {candidate?.first_name} {candidate?.last_name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Select Template</Label>
                  <div className="space-y-3 mt-2">
                    {uploadedTemplates.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
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
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No templates available</p>
                      </div>
                    )}
                    
                    <div className="border-t pt-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          ref={fileInputRef}
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
                          <span>Upload New Template</span>
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
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      generateOffer(workflow);
                      setShowOfferDialog(false);
                    }}
                    disabled={extractingFields}
                  >
                    {extractingFields ? 'Extracting Fields...' : 'Select Template & Continue'}
                  </Button>
                </div>
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
                    <p><strong>Salary:</strong> ${workflow.final_offer_amount}</p>
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

  // ... (generateOfferWithFields, regenerateOfferWithChanges, handleInputChange functions remain the same)
  
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
        
        // Download the generated files from the API to browser session
        let pdfFile: Blob | null = null;
        let docxFile: Blob | null = null;
        let offerLetterUrl: string | null = null;
        let sessionPdfUrl: string | null = null;

        try {
          // Download PDF and DOCX files if they exist
          if (response.files?.pdf) {
            console.log('Downloading PDF file to session:', response.files.pdf);
            pdfFile = await offerApiService.downloadFile(response.files.pdf);
            
            // Create a blob URL for immediate preview
            if (pdfFile) {
              sessionPdfUrl = URL.createObjectURL(pdfFile);
              console.log('Created session PDF URL for preview:', sessionPdfUrl);
              console.log('PDF file size:', pdfFile.size, 'bytes');
              console.log('PDF file type:', pdfFile.type);
            }
          }
          if (response.files?.docx) {
            console.log('Downloading DOCX file to session:', response.files.docx);
            docxFile = await offerApiService.downloadFile(response.files.docx);
          }

          // Upload files to Supabase storage bucket (optional - for permanent storage)
          if (pdfFile && profile?.id) {
            console.log('Skipping PDF upload to storage bucket - keeping server-side only');
            // Use session URL for preview and API URL for storage
            offerLetterUrl = response.files?.pdf || sessionPdfUrl;
          } else {
            // Use session URL for preview
            offerLetterUrl = sessionPdfUrl;
          }

          // Create offer record in the database with 'draft' status
          console.log('Creating offer record in offers table...');
          try {
            const salaryString = fieldValues.salary?.replace(/[^0-9.-]+/g, '') || '0';
            const salaryAmount = parseFloat(salaryString);
            
            const offerRecord = {
              job_application_id: selectedWorkflowForOffer.job_application_id,
              salary_amount: salaryAmount > 0 ? salaryAmount : 50000,
              currency: fieldValues.currency || 'USD',
              start_date: fieldValues.start_date ? new Date(fieldValues.start_date).toISOString() : null,
              offer_letter_url: response.files?.pdf || null, // Use server-side URL
              status: 'draft' as const,
              benefits: fieldValues.benefits ? 
                (typeof fieldValues.benefits === 'string' ? [fieldValues.benefits] : Array.isArray(fieldValues.benefits) ? fieldValues.benefits : []) : 
                [],
              signing_bonus: fieldValues.signing_bonus ? parseFloat(String(fieldValues.signing_bonus).replace(/[^0-9.-]+/g, '')) : null,
              equity_percentage: fieldValues.equity_percentage ? parseFloat(String(fieldValues.equity_percentage)) : null,
              probation_period_months: fieldValues.probation_period_months ? parseInt(String(fieldValues.probation_period_months)) : null,
              notice_period_days: fieldValues.notice_period_days ? parseInt(String(fieldValues.notice_period_days)) : null,
              session_pdf_url: sessionPdfUrl,
              logs: JSON.stringify([{
                timestamp: new Date().toISOString(),
                action: 'offer_generated',
                api_request_id: response.request_id,
                session_pdf_url: sessionPdfUrl,
                storage_url: response.files?.pdf
              }]),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { data: newOffer, error: createError } = await supabase
              .from('offers')
              .insert(offerRecord as any)
              .select()
              .single();

            if (createError) {
              console.error('Error creating offer record:', createError);
              // Don't throw error, just log it and continue
            } else {
              console.log('Offer record created successfully:', newOffer);
              
              // Set offer expiration (7 days from now)
              try {
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 7);
                
                const { error: expirationError } = await supabase
                  .from('offers')
                  .update({
                    expires_at: expirationDate.toISOString(),
                    updated_at: new Date().toISOString()
                  } as any)
                  .eq('id', newOffer.id);

                if (expirationError) {
                  console.error('Error setting offer expiration:', expirationError);
                } else {
                  console.log(`Offer expiration set to ${expirationDate.toISOString()}`);
                }
              } catch (expirationError) {
                console.error('Error in setting expiration:', expirationError);
              }
            }
          } catch (offerError) {
            console.error('Error handling offer record:', offerError);
            // Don't throw error, just log it and continue
          }

        } catch (fileError) {
          console.error('Error handling files:', fileError);
          // Continue with workflow update even if file handling fails
        }

        // Update workflow in database (WITHOUT advancing to next step yet)
        console.log('Updating workflow with server-side PDF URL...');
        const { error: updateError } = await supabase
          .from('offer_workflow')
          .update({
            generated_offer_content: JSON.stringify(fieldValues),
            offer_details: {
              ...fieldValues,
              pdf_file_id: response.files?.pdf,
              docx_file_id: response.files?.docx,
              offer_letter_url: response.files?.pdf, // Use server-side URL
              session_pdf_url: sessionPdfUrl, // Keep session URL for preview
              api_request_id: response.request_id
            },
            offer_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedWorkflowForOffer.id);

        if (updateError) {
          console.error('Error updating workflow:', updateError);
        } else {
          console.log('Workflow updated successfully with server-side PDF URL');
        }

        // Set the generated offer URL for preview (session URL for immediate preview)
        setGeneratedOfferUrl(sessionPdfUrl); // Use session URL for immediate preview
        setGeneratedOfferData({
          ...fieldValues,
          pdf_file_id: response.files?.pdf,
          docx_file_id: response.files?.docx,
          offer_letter_url: response.files?.pdf, // Server-side URL for storage
          session_pdf_url: sessionPdfUrl, // Session URL for preview
          api_request_id: response.request_id
        });
        setPreviewPdfUrl(sessionPdfUrl); // Use session URL for preview

        setShowFieldsDialog(false);
        console.log('Opening preview dialog with session URL for immediate preview...', { 
          showPreviewDialog: true, 
          previewPdfUrl: sessionPdfUrl,
          sessionPdfUrl,
          serverSideUrl: response.files?.pdf,
          generatedOfferData: {
            ...fieldValues,
            pdf_file_id: response.files?.pdf,
            docx_file_id: response.files?.docx,
            offer_letter_url: response.files?.pdf,
            session_pdf_url: sessionPdfUrl,
            api_request_id: response.request_id
          }
        });
        setShowPreviewDialog(true); // Show preview with session URL

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

  const regenerateOfferWithChanges = async () => {
    if (!templateFile || !selectedWorkflowForOffer) {
      toast({
        title: "Error",
        description: "Template file or workflow not found",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsRegenerating(true);

      // Generate offer letter using the API with updated field values
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
        console.log('Offer regeneration response:', response);
        
        // Download and process files to session first
        let pdfFile: Blob | null = null;
        let offerLetterUrl: string | null = null;
        let sessionPdfUrl: string | null = null;

        try {
          if (response.files?.pdf) {
            console.log('Downloading regenerated PDF file to session:', response.files.pdf);
            pdfFile = await offerApiService.downloadFile(response.files.pdf);
            
            // Create a blob URL for immediate preview
            if (pdfFile) {
              sessionPdfUrl = URL.createObjectURL(pdfFile);
              console.log('Created session PDF URL for regenerated preview:', sessionPdfUrl);
            }
          }

          // Upload to storage bucket (optional - for permanent storage)
          if (pdfFile && profile?.id) {
            console.log('Skipping regenerated PDF upload to storage bucket - keeping server-side only');
            // Use server-side URL from API
            offerLetterUrl = response.files?.pdf || sessionPdfUrl;
          } else {
            offerLetterUrl = sessionPdfUrl;
          }

          // Update offer record in database if it exists
          try {
            console.log('Updating existing offer record for regeneration...');
            const salaryString = fieldValues.salary?.replace(/[^0-9.-]+/g, '') || '0';
            const salaryAmount = parseFloat(salaryString);
            
            const { data: existingOffer, error: findError } = await supabase
              .from('offers')
              .select('id, logs')
              .eq('job_application_id', selectedWorkflowForOffer.job_application_id)
              .single();

            if (!findError && existingOffer) {
              // Update existing offer record
              const existingLogs = existingOffer.logs || [];
              const updatedLogs = Array.isArray(existingLogs) ? existingLogs : 
                (typeof existingLogs === 'string' ? JSON.parse(existingLogs) : []);

              const updatedOfferData = {
                salary_amount: salaryAmount > 0 ? salaryAmount : 50000,
                currency: fieldValues.currency || 'USD',
                start_date: fieldValues.start_date ? new Date(fieldValues.start_date).toISOString() : null,
                offer_letter_url: response.files?.pdf || null,
                session_pdf_url: sessionPdfUrl,
                benefits: fieldValues.benefits ? 
                  (typeof fieldValues.benefits === 'string' ? [fieldValues.benefits] : Array.isArray(fieldValues.benefits) ? fieldValues.benefits : []) : 
                  [],
                signing_bonus: fieldValues.signing_bonus ? parseFloat(String(fieldValues.signing_bonus).replace(/[^0-9.-]+/g, '')) : null,
                equity_percentage: fieldValues.equity_percentage ? parseFloat(String(fieldValues.equity_percentage)) : null,
                probation_period_months: fieldValues.probation_period_months ? parseInt(String(fieldValues.probation_period_months)) : null,
                notice_period_days: fieldValues.notice_period_days ? parseInt(String(fieldValues.notice_period_days)) : null,
                logs: JSON.stringify([
                  ...updatedLogs,
                  {
                    timestamp: new Date().toISOString(),
                    action: 'offer_regenerated',
                    api_request_id: response.request_id,
                    session_pdf_url: sessionPdfUrl,
                    storage_url: response.files?.pdf
                  }
                ]),
                updated_at: new Date().toISOString()
              };

              const { error: updateError } = await supabase
                .from('offers')
                .update(updatedOfferData as any)
                .eq('id', existingOffer.id);

              if (updateError) {
                console.error('Error updating offer record:', updateError);
              } else {
                console.log('Offer record updated successfully for regeneration');
              }
            } else {
              console.error('No existing offer found to update:', findError);
            }
          } catch (offerError) {
            console.error('Error updating offer record during regeneration:', offerError);
          }

        } catch (fileError) {
          console.error('Error handling regenerated files:', fileError);
        }

        // Update workflow with new data (WITHOUT advancing step)
        const { error: updateError } = await supabase
          .from('offer_workflow')
          .update({
            generated_offer_content: JSON.stringify(fieldValues),
            offer_details: {
              ...fieldValues,
              pdf_file_id: response.files?.pdf,
              docx_file_id: response.files?.docx,
              offer_letter_url: response.files?.pdf, // Use server-side URL
              session_pdf_url: sessionPdfUrl, // Keep session URL for preview
              api_request_id: response.request_id,
              regenerated_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedWorkflowForOffer.id);

        if (updateError) {
          console.error('Error updating workflow:', updateError);
        } else {
          console.log('Workflow updated successfully with server-side PDF URL');
        }

        // Update preview data (session URL for immediate preview)
        setGeneratedOfferUrl(sessionPdfUrl); // Use session URL for preview
        setGeneratedOfferData({
          ...fieldValues,
          pdf_file_id: response.files?.pdf,
          docx_file_id: response.files?.docx,
          offer_letter_url: response.files?.pdf, // Server-side URL for storage
          session_pdf_url: sessionPdfUrl, // Session URL for preview
          api_request_id: response.request_id
        });
        setPreviewPdfUrl(sessionPdfUrl); // Use session URL for preview

        toast({
          title: "Offer Letter Regenerated!",
          description: "The offer letter has been updated with your changes.",
        });

      } else {
        throw new Error(response.message || 'Failed to regenerate offer letter');
      }

    } catch (error) {
      console.error('Error in regenerateOfferWithChanges:', error);
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Failed to regenerate offer letter",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
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
                onClick={() => createWorkflow({ job_application_id: selectedApplicationId })}
                disabled={!selectedApplicationId}
                className="w-full"
              >
                Create Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {workflows.map((workflow) => {
          const candidate = workflow.job_applications?.candidates?.profiles;
          const job = workflow.job_applications?.jobs;
          
          return (
            <Card key={workflow.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {job?.title} - {candidate?.first_name} {candidate?.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Started {new Date(workflow.created_at).toLocaleDateString()}
                    {workflow.priority_level && (
                      <span className="ml-3">
                        Priority: 
                        <Badge 
                          variant={workflow.priority_level <= 2 ? "destructive" : workflow.priority_level <= 3 ? "default" : "secondary"} 
                          className="ml-1"
                        >
                          {workflow.priority_level <= 2 ? "High" : workflow.priority_level <= 3 ? "Medium" : "Low"}
                        </Badge>
                      </span>
                    )}
                  </p>
                </div>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>Step {getStepIndex(workflow.current_step)} of 5</span>
                  </div>
                  <Progress value={(getStepIndex(workflow.current_step) / 5) * 100} className="h-2" />
                </div>

                {/* Workflow Steps */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-6">
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
                          <span className={`text-sm hidden md:block ${
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
                  
                  {workflow.status !== 'completed' && workflow.status !== 'failed' && workflow.status !== 'cancelled' && (
                    <div className="ml-4">
                      {getStepAction(workflow)}
                    </div>
                  )}
                </div>

                {/* Status Messages */}
                {workflow.status === 'completed' && workflow.candidate_response === 'accepted' && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Offer accepted by candidate</span>
                    {workflow.workflow_completed_at && (
                      <span className="text-xs text-green-500">
                        on {new Date(workflow.workflow_completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {(workflow.status === 'failed' || workflow.candidate_response === 'rejected') && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {workflow.candidate_response === 'rejected' ? 'Offer rejected by candidate' : 'Workflow failed'}
                    </span>
                    {workflow.candidate_comment && (
                      <span className="text-xs text-red-500 ml-2">
                        "{workflow.candidate_comment}"
                      </span>
                    )}
                  </div>
                )}

                {workflow.candidate_response === 'negotiating' && (
                  <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Candidate is negotiating terms</span>
                  </div>
                )}
              </div>
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
      {/* <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
      </Dialog> */}

      {/* Dynamic Fields Dialog */}
      <Dialog open={showFieldsDialog} onOpenChange={setShowFieldsDialog}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="shrink-0 p-6 pb-4">
            <DialogTitle>Fill Template Fields</DialogTitle>
            <DialogDescription>
              Complete the required fields to generate your offer letter.
            </DialogDescription>
          </DialogHeader>
          
          {/* Scrollable fields area */}
          <div className="flex-1 min-h-0 px-6">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                {extractedFields.filter(field => field.id !== 'currency').map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.id}
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={3}
                        className="text-sm resize-none"
                      />
                    ) : field.type === 'select' && field.options ? (
                      <Select 
                        value={fieldValues[field.id] || ''} 
                        onValueChange={(value) => handleInputChange(field.id, value)}
                      >
                        <SelectTrigger className="text-sm">
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
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="text-sm"
                      />
                    )}
                    
                    {field.description && (
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Fixed footer */}
          <DialogFooter className="shrink-0 p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowFieldsDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={generateOfferWithFields} 
              disabled={generatingOffer}
            >
              {generatingOffer ? "Generating..." : "Generate Offer Letter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offer Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={(open) => {
        console.log('Preview dialog onOpenChange:', open);
        if (!open) {
          // Clean up blob URLs when dialog closes
          if (previewPdfUrl && previewPdfUrl.startsWith('blob:')) {
            cleanupBlobUrl(previewPdfUrl);
          }
          if (generatedOfferData?.session_pdf_url && generatedOfferData.session_pdf_url.startsWith('blob:')) {
            cleanupBlobUrl(generatedOfferData.session_pdf_url);
          }
        }
        setShowPreviewDialog(open);
      }}>
        <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0">
          <DialogHeader className="shrink-0 p-6 pb-0">
            <DialogTitle>Review Offer Letter</DialogTitle>
            <DialogDescription>
              Review the generated offer letter and make any necessary edits.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 p-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Left side - PDF Preview (2/3 width) */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-lg font-semibold">Offer Letter Preview</h3>
                  <div className="flex space-x-2">
                    {(generatedOfferData?.pdf_file_id || generatedOfferData?.session_pdf_url) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (generatedOfferData?.session_pdf_url && generatedOfferData.session_pdf_url.startsWith('blob:')) {
                            const link = document.createElement('a');
                            link.href = generatedOfferData.session_pdf_url;
                            link.download = `offer_letter_${Date.now()}.pdf`;
                            link.click();
                          } else if (generatedOfferData?.pdf_file_id) {
                            downloadGeneratedOffer(generatedOfferData.pdf_file_id);
                          }
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-lg flex-1 bg-gray-50 overflow-auto">
                  {previewPdfUrl ? (
                    <div className="w-full h-full min-h-[500px]">
                      {previewPdfUrl.startsWith('blob:') ? (
                        <object 
                          data={previewPdfUrl}
                          type="application/pdf"
                          className="w-full h-full min-h-[500px] rounded-lg"
                          title="Offer Letter Preview"
                        >
                          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="mb-2">PDF preview not supported</p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = previewPdfUrl;
                                link.download = 'offer_letter.pdf';
                                link.click();
                              }}
                              className="flex items-center space-x-2"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download to View</span>
                            </Button>
                          </div>
                        </object>
                      ) : (
                        <iframe 
                          src={previewPdfUrl}
                          className="w-full h-full min-h-[500px] rounded-lg border-0"
                          title="Offer Letter Preview"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>PDF preview not available</p>
                      <p className="text-sm">Use the download button to view the file</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Edit Panel (1/3 width) */}
              <div className="flex flex-col h-full min-h-0">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-lg font-semibold">Quick Edits</h3>
                  <Button
                    onClick={regenerateOfferWithChanges}
                    disabled={isRegenerating}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    {isRegenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        <span>Update</span>
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Scrollable fields area with proper height constraints */}
                <div className="flex-1 min-h-0 -mr-2">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {extractedFields.filter(field => field.id !== 'currency').map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id} className="text-sm font-medium block">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.type === 'textarea' ? (
                            <Textarea
                              id={field.id}
                              value={fieldValues[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="min-h-[80px] text-sm resize-none w-full"
                              rows={4}
                            />
                          ) : field.type === 'select' && field.options ? (
                            <Select
                              value={fieldValues[field.id] || ''}
                              onValueChange={(value) => handleInputChange(field.id, value)}
                            >
                              <SelectTrigger className="text-sm h-10 w-full">
                                <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={field.id}
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                              value={fieldValues[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="text-sm h-10 w-full"
                            />
                          )}
                        </div>
                      ))}
                      {/* Bottom padding to ensure last field is accessible */}
                      <div className="h-6"></div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
          
          {/* Fixed footer with buttons */}
          <DialogFooter className="shrink-0 p-6 pt-4 border-t bg-white">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={async () => {
                setShowPreviewDialog(false);
                await advanceWorkflow(selectedWorkflowForOffer?.id || '', {});
                await fetchWorkflows();
                toast({
                  title: "Offer Letter Approved!",
                  description: "The offer letter is ready for HR approval.",
                });
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve & Continue to HR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Professional Background Check Modal */}
<Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
  <DialogContent className="max-w-md mx-auto p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border-0">
    <div className="relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60"></div>
      
      {/* Header with icon */}
      <div className="relative px-8 pt-8 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg ring-8 ring-blue-50 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Background Verification</h3>
        <p className="text-sm text-gray-600">Comprehensive candidate screening in progress</p>
      </div>

      {/* Content Area */}
      <div className="relative px-8 pb-8 min-h-[200px]">
        {!bgCheckResult ? (
          /* Loading State */
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="inline-flex items-center justify-center">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <FileCheck className="w-4 h-4 text-blue-500" />
                <p className="text-base font-medium text-gray-700">Running comprehensive checks...</p>
              </div>
              
              {/* Progress indicators */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Verifying identity</span>
                  <span>✓</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Criminal background</span>
                  <Loader2 className="w-3 h-3 animate-spin" />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Employment history</span>
                  <span>⏳</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Professional references</span>
                  <span>⏳</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">This may take a few moments...</p>
          </div>
        ) : (
          /* Result State */
          <div className="text-center space-y-6 animate-in fade-in-50 duration-500">
            {/* Status Icon with gradient background */}
            <div className="relative">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${
                bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required' 
                  ? 'from-green-500 to-emerald-600'
                  : bgCheckResult.status === 'failed'
                  ? 'from-red-500 to-rose-600'
                  : 'from-yellow-500 to-amber-600'
              } shadow-lg`}>
                <div className="w-18 h-18 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required' ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : bgCheckResult.status === 'failed' ? (
                    <XCircle className="w-8 h-8 text-red-500" />
                  ) : (
                    <Clock className="w-8 h-8 text-yellow-500" />
                  )}
                </div>
              </div>
              {(bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required') && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="space-y-2">
              <Badge 
                className={`text-lg px-4 py-2 rounded-full font-semibold ${
                  bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : bgCheckResult.status === 'failed'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                {bgCheckResult.status.toUpperCase().replace('_', ' ')}
              </Badge>
            </div>

            {/* Remarks */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                Verification Details
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {bgCheckResult.remarks}
              </p>
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => setShowResultDialog(false)}
              className={`w-full rounded-xl py-3 font-semibold transition-all duration-200 transform hover:scale-105 ${
                bgCheckResult.status === 'completed' || bgCheckResult.status === 'not_required'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
                  : bgCheckResult.status === 'failed'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
};



export default OfferWorkflowManager;