import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import ClientDashboard from '@/components/dashboards/ClientDashboard';
import VendorDashboard from '@/components/dashboards/VendorDashboard';
import CandidateDashboard from '@/components/dashboards/CandidateDashboard';
import InterviewerDashboard from '@/components/dashboards/InterviewerDashboard';

import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Setting up your profile...</h2>
          <p className="text-muted-foreground">Please wait while we complete your account setup.</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  switch (profile.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <ClientDashboard />;
    case 'vendor':
      return <VendorDashboard />;
    case 'interviewer':
      return <InterviewerDashboard />;
    case 'candidate':
      return <CandidateDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Invalid Role</h2>
            <p className="text-muted-foreground">Your account role is not recognized. Please contact support.</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;