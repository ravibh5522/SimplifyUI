import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditUserModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => void;
}

const EditUserModal = ({ userId, open, onOpenChange, onUserUpdated }: EditUserModalProps) => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'candidate' as 'super_admin' | 'client' | 'vendor' | 'candidate',
    company_name: '',
    is_active: true
  });

  useEffect(() => {
    if (open) {
      fetchCompaniesAndVendors();
      if (userId) {
        fetchUserData();
      }
    }
  }, [open, userId]);

  const fetchCompaniesAndVendors = async () => {
    try {
      const [companiesResult, vendorsResult] = await Promise.all([
        supabase.from('companies').select('id, name').eq('is_active', true).order('name'),
        supabase.from('vendors').select('id, companies(name)').eq('is_active', true)
      ]);

      setCompanies(companiesResult.data || []);
      setVendors(vendorsResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch companies and vendors",
        variant: "destructive"
      });
    }
  };

  const fetchUserData = async () => {
    if (!userId) return;
    
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: (data.role as 'super_admin' | 'client' | 'vendor' | 'candidate') || 'candidate',
        company_name: data.company_name || '',
        is_active: data.is_active
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive"
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Updated",
        description: "User has been successfully updated."
      });

      onOpenChange(false);
      onUserUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssociationOptions = () => {
    if (formData.role === 'client' || formData.role === 'vendor') {
      const options = formData.role === 'client' 
        ? companies.map(company => ({ value: company.name, label: company.name }))
        : vendors.map(vendor => ({ value: vendor.companies?.name || '', label: vendor.companies?.name || '' })).filter(v => v.value);
      
      return options;
    }
    return [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Edit User</span>
          </DialogTitle>
          <DialogDescription>
            Update user information and settings.
          </DialogDescription>
        </DialogHeader>
        
        {fetchLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value, company_name: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.role === 'client' || formData.role === 'vendor') && (
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  {formData.role === 'client' ? 'Company' : 'Vendor Company'} *
                </Label>
                <Select value={formData.company_name} onValueChange={(value) => setFormData({ ...formData, company_name: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${formData.role === 'client' ? 'company' : 'vendor company'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAssociationOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select value={formData.is_active.toString()} onValueChange={(value) => setFormData({ ...formData, is_active: value === 'true' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;