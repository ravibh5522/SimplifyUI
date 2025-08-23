import { DataType } from './types';
import { STATUS_COLORS } from './constants';

export const getSearchFields = (item: any, type: DataType): string[] => {
  switch (type) {
    case 'users':
      return [item.first_name, item.last_name, item.email, item.role];
    case 'companies':
      return [item.name, item.industry, item.country];
    case 'vendors':
      return [item.companies?.name, item.specialization?.join(' ')];
    case 'jobs':
    case 'activeJobs':
      return [item.title, item.companies?.name, item.location];
    case 'applications':
    case 'monthlyHires':
      return [item.candidates?.first_name, item.candidates?.last_name, item.jobs?.title];
    case 'my-applications':
    case 'in-review':
      // Define what parts of an application are searchable for a candidate
      return [
        item.jobs?.title,
        item.jobs?.companies?.name,
        item.status
      ];
       case 'my-interviews':
      return [
        item.job_title,
        item.company_name,
        item.status,
      ].filter(Boolean);
    case 'scheduledInterviews':
      const profile = item.job_applications?.candidates?.profiles;
      const job = item.job_applications?.jobs;
      return [
        profile?.first_name,
        profile?.last_name,
        profile?.email,
        job?.title,
        job?.companies?.name,
        item.interviewer_names, // This is the new field we will add for names
      ].filter(Boolean);
    default:
      return [];
  }
};

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || STATUS_COLORS.default;
};

export const applyStatusFilter = (item: any, type: DataType, filterValue: string): boolean => {
  if (filterValue === 'all') return true;
  
  switch (type) {
    case 'users':
      return item.role === filterValue;
    case 'companies':
    case 'vendors':
      return item.is_active === (filterValue === 'active');
    case 'jobs':
    case 'activeJobs':
    case 'applications':
    case 'monthlyHires':
      return item.status === filterValue;
     case 'my-applications':
    case 'in-review':
       case 'my-interviews': 
      case 'scheduledInterviews': // <-- ADDED HERE
      // The filter dropdown should work on the application's status
      return item.status === filterValue;
    default:
      return true;
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const getAIScoreVariant = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};