import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Bot, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

const DashboardLayout = ({ children, title, actions }: DashboardLayoutProps) => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

 const handleSignOut = async () => {
  try {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account."
    });
    // --- THIS IS THE CRITICAL MISSING LINE ---
    navigate('/auth'); // Redirect to the login page after successful sign-out
    
  } catch (error) {
    toast({
      title: "Sign out failed",
      description: "There was an error signing you out.",
      variant: "destructive"
    });
  }
};


const handleLogoClick = () => {
    const dashboardPath = '/dashboard';
    if (location.pathname !== dashboardPath) {
      navigate(dashboardPath);
    }
  };


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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button onClick={handleLogoClick} className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/9bf28cca-ee40-48d0-a419-8360a0879759.png" 
                  alt="SimplifyHiring Logo" 
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-xl font-bold text-gradient-primary">SimplifyHiring</span>
                </button>
              </div>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            </div>

            {/* Right side - Actions and User Menu */}
            <div className="flex items-center space-x-4">
              {actions}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                      <AvatarFallback>
                        {getInitials(profile?.first_name, profile?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {getRoleDisplayName(profile?.role)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;