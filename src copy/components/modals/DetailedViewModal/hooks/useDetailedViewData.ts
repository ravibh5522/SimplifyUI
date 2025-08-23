import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DataType } from '../types';
import { getSearchFields, applyStatusFilter } from '../utils';
import { useAuth } from '@/hooks/useAuth';

export const useDetailedViewData = (
  type: DataType,
  open: boolean,
  initialData?: any[],
  defaultFilter?: string
) => {
  const { profile } = useAuth(); // We still need this to know a user is logged in
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setFilterValue(defaultFilter || 'all');
      setSearchTerm('');
    }
  }, [open, defaultFilter]);

  // buildQuery remains for your other working modals (Admin, etc.)
  const buildQuery = useCallback(() => {
    switch (type) {
        case 'users':
            return supabase.from('profiles').select('*, created_at').order('created_at', { ascending: false });
        case 'applications':
            return supabase.from('job_applications').select(`id, status, screening_score, applied_at, jobs!inner(title, companies!inner(name)), candidates!inner(profiles!inner(first_name, last_name, email))`).order('applied_at', { ascending: false });
        case 'scheduledInterviews':
             return supabase.from('interview_schedules').select(`id, scheduled_at, status, interview_type, job_applications!inner (jobs!inner (title, companies!inner (name)), candidates!inner (profiles!inner (first_name, last_name, email)))`).order('scheduled_at', { ascending: false });
      default:
        return null;
    }
  }, [type]);

  const fetchData = useCallback(async () => {
    if (!open || !profile?.id) return;
    if (initialData) {
      setData([[...initialData]]);
      return;
    }

    setLoading(true);
    try {
      let resultData: any[] = [];
  const typesThatNeedJobs = ['activeJobs', 'jobs'];
      const typesThatNeedApplications = ['applications', 'shortlisted', 'monthlyHires'];

      // 2. The final, intelligent IF/ELSE IF structure
      if (typesThatNeedJobs.includes(type)) {
        // It's a job-related modal, call the job function.
        const { data, error } = await supabase.rpc('get_jobs_for_role', {
          user_role: profile.role 
        });
        if (error) throw error;
        resultData = data || [];

      } else if (typesThatNeedApplications.includes(type)) {
        // It's an application-related modal, call our NEW application function.
        const { data, error } = await supabase.rpc('get_applications_for_role', {
          user_role: profile.role
        });
        if (error) throw error;
        resultData = data || [];

      } else if (type === 'my-interviews') {
        // --- THIS IS THE NEW, SIMPLE LOGIC ---
        // Call the database function directly. No complex joins, no RLS issues.
        const { data, error } = await supabase.rpc('get_my_scheduled_interviews');
        if (error) throw error;
        resultData = data;
        
      } else {
        // Fallback for all other modals, leaving them untouched.
        const query = buildQuery();
        if (query) {
            const { data, error } = await query;
            if (error) throw error;
            resultData = data || [];
        }
      }
      
      setData(resultData);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [open, initialData, profile, type,  buildQuery, toast]);

  const filterData = useCallback(() => {
    // ... no changes needed in this function ...
    const sourceData = data || [];
    let filtered = sourceData;
    if (searchTerm) {
      filtered = filtered.filter((item) => {
        const searchFields = getSearchFields(item, type);
        return searchFields.some(field => field?.toString().toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }
    filtered = filtered.filter((item) => applyStatusFilter(item, type, filterValue));
    setFilteredData(filtered);
  }, [data, searchTerm, filterValue, type]);

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  useEffect(() => {
    filterData();
  }, [data, searchTerm, filterValue, type]);

  return {
    data,
    filteredData,
    loading,
    searchTerm,
    filterValue,
    setSearchTerm,
    setFilterValue,
    refetchData: fetchData
  };
};




