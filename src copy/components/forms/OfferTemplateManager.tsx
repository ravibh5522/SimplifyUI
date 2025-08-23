import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Plus,
  Loader2,
  Filter
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface OfferTemplate {
  id: string;
  template_name: string;
  template_content: string;
  created_at: string;
  updated_at: string;
  is_validated: boolean | null;
  country: string;
  job_role: string | null;
  validation_notes?: string | null;
  created_by: string;
}

interface OfferTemplateManagerProps {
  trigger?: React.ReactNode;
  onTemplateUploaded?: () => void;
}

const jobRoles = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UI/UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'HR Manager',
  'Finance Manager',
  'Operations Manager',
  'Business Analyst',
  'DevOps Engineer',
  'QA Engineer',
  'General'
];

const OfferTemplateManager = ({ trigger, onTemplateUploaded }: OfferTemplateManagerProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<OfferTemplate[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState('General');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, profile?.id]);

  // Filter templates when templates or roleFilter changes
  useEffect(() => {
    if (roleFilter === 'all') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(template => template.job_role === roleFilter));
    }
  }, [templates, roleFilter]);

  const fetchTemplates = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offer_templates')
        .select(`
          id,
          template_name,
          template_content,
          created_at,
          updated_at,
          is_validated,
          country,
          job_role,
          validation_notes,
          created_by
        `)
        .eq('created_by', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch offer templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadTemplate = async () => {
    if (!selectedFile || !profile?.id) return;

    try {
      setUploading(true);
      
      // Upload file to storage
      const fileName = `${profile.id}/${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('offer-templates')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        if (uploadError.message === "Bucket not found") {
          toast({
            title: "Storage bucket missing",
            description: "Please run the create_storage_bucket.sql script in your Supabase dashboard first",
            variant: "destructive",
          });
        }
        throw uploadError;
      }

      // For now, store just the file path as string (as per current types)  
      const templateContent = uploadData.path;

      // Make template name unique to avoid constraint violations
      // The database has a unique constraint on (company_id, template_name)
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.'));
      const uniqueTemplateName = `${nameWithoutExt}_${timestamp}_${randomSuffix}${fileExtension}`;

      // Handle company_id requirement
      // First, let's try without company_id to see if that's the issue
      let insertData: any = {
        template_name: uniqueTemplateName,
        template_content: templateContent,
        created_by: profile.id,
        country: 'Indonesia',
        job_role: selectedRole || 'General',
        is_validated: false
      };

      // Try to get or create a company first - company_id is REQUIRED
      console.log('Starting company lookup/creation for user:', profile.id);
      
      let companyId = null;
      
      try {
        // First try to find any existing company (companies are not user-specific)
        console.log('Searching for existing company...');
        const { data: existingCompany, error: findError } = await supabase
          .from('companies')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (findError) {
          console.error('Error finding existing company:', findError);
        }

        if (existingCompany) {
          console.log('✓ Found existing company:', existingCompany.id);
          companyId = existingCompany.id;
        } else {
          // No existing company, create one
          console.log('No existing company found. Creating new company...');
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: `${profile.email || 'User'}'s Company`,
              description: 'Auto-created company for offer templates',
              industry: 'Technology',
              size_range: '1-10',
              website: null,
              address: 'Jakarta, Indonesia',
              country: 'Indonesia',
              is_active: true,
              commission_rate: 0.00
            })
            .select('id')
            .single();

          if (companyError) {
            console.error('Failed to create company:', companyError);
            throw new Error(`Cannot create company: ${companyError.message}`);
          }

          if (newCompany) {
            console.log('✓ Created new company:', newCompany.id);
            companyId = newCompany.id;
          } else {
            throw new Error('Company creation returned no data');
          }
        }

        // Ensure we have a company_id before proceeding
        if (!companyId) {
          throw new Error('Could not obtain valid company ID');
        }

        console.log('Final company_id to use:', companyId);
        insertData.company_id = companyId;

      } catch (error) {
        console.error('Company handling failed completely:', error);
        toast({
          title: "Company setup required",
          description: "Unable to create or find company record. Please contact support.",
          variant: "destructive",
        });
        throw error; // Don't proceed without company_id since it's required
      }

      console.log('Creating template with unique name:', uniqueTemplateName);
      console.log('Final insert data:', insertData);

      // Create template record
      console.log('Attempting to insert template with data:', insertData);

      const { data: template, error: templateError } = await supabase
        .from('offer_templates')
        .insert(insertData)
        .select()
        .single();

      if (templateError) {
        console.error('Database insert error:', templateError);
        console.error('Error details:', {
          code: templateError.code,
          message: templateError.message,
          details: templateError.details,
          hint: templateError.hint
        });
        
        // Check specific error codes
        if (templateError.code === '23502') {
          toast({
            title: "Missing company information",
            description: "Company ID is required but not found. Please contact support.",
            variant: "destructive",
          });
        } else if (templateError.code === '23505') {
          toast({
            title: "Template name conflict",
            description: "A template with this name already exists. Please try again.",
            variant: "destructive",
          });
        } else if (templateError.code === '23503') {
          toast({
            title: "Foreign key constraint",
            description: "Company reference issue. Please contact support.",
            variant: "destructive",
          });
        } else if (templateError.code === '42501') {
          toast({
            title: "Permission denied",
            description: "You don't have permission to insert templates. Please check your account setup.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Database error",
            description: templateError.message || "Could not save template to database",
            variant: "destructive",
          });
        }
        throw templateError;
      }

      setTemplates(prev => [template as OfferTemplate, ...prev]);
      setSelectedFile(null);
      
      toast({
        title: "Template uploaded!",
        description: "Offer template has been uploaded successfully.",
      });

      // Reset file input
      const fileInput = document.getElementById('template-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onTemplateUploaded?.();
    } catch (error: any) {
      console.error('Error uploading template:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload the template",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteTemplate = async (templateId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('offer-templates')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion error (file may not exist):', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('offer_templates')
        .delete()
        .eq('id', templateId);

      if (dbError) throw dbError;

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      toast({
        title: "Template deleted",
        description: "Offer template has been removed successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Could not delete the template",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = async (template: OfferTemplate) => {
    try {
      const { data, error } = await supabase.storage
        .from('offer-templates')
        .download(template.template_content);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = template.template_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading template:', error);
      toast({
        title: "Download failed",
        description: error.message || "Could not download the template",
        variant: "destructive",
      });
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <FileText className="w-4 h-4 mr-2" />
      Offer Templates
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Offer Template Manager</DialogTitle>
          <DialogDescription>
            Upload and manage your offer letter templates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload New Template
              </CardTitle>
              <CardDescription>
                Upload PDF, DOC, or DOCX offer letter templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-file">Select Template File</Label>
                  <Input
                    id="template-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="job-role">Job Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Badge variant="outline">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                  </div>
                  <Button 
                    onClick={uploadTemplate} 
                    disabled={uploading}
                    size="sm"
                  >
                    {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Upload
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Templates List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Templates ({filteredTemplates.length})</CardTitle>
                  <CardDescription>
                    Manage your uploaded offer letter templates
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {jobRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading templates...</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No templates uploaded yet</p>
                  <p className="text-sm">Upload your first offer letter template above</p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No templates found for "{roleFilter}"</p>
                  <p className="text-sm">Try selecting a different role filter</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.template_name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {template.job_role || 'General'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Uploaded {new Date(template.created_at).toLocaleDateString()}
                            {template.is_validated && (
                              <Badge variant="outline" className="ml-2">Validated</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadTemplate(template)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Template</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{template.template_name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteTemplate(template.id, template.template_content)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferTemplateManager;