import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  Search,
  Filter,
  Clock,
  CheckCircle
} from 'lucide-react';
import AddUserModal from '@/components/forms/AddUserModal';

const VendorDashboard = () => {
  const dashboardActions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
      <AddUserModal onUserAdded={() => {}} />
      <Button variant="hero" size="sm">
        <Search className="w-4 h-4 mr-2" />
        Browse Jobs
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Vendor Dashboard" actions={dashboardActions}>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Assignments
              </CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground">Jobs you're working on</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Candidates Submitted
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">85</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">73%</div>
              <p className="text-xs text-muted-foreground">Placements/submissions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$24,500</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Assignments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Assignments</CardTitle>
                  <CardDescription>Jobs you're currently working on</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Senior React Developer",
                    company: "TechCorp Indonesia",
                    deadline: "2024-02-15",
                    status: "In Progress",
                    candidates: 5
                  },
                  {
                    title: "Product Manager",
                    company: "StartupXYZ",
                    deadline: "2024-02-20",
                    status: "In Progress",
                    candidates: 3
                  },
                  {
                    title: "DevOps Engineer",
                    company: "CloudTech Ltd",
                    deadline: "2024-02-25",
                    status: "Pending",
                    candidates: 0
                  }
                ].map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{assignment.title}</h4>
                      <p className="text-sm text-muted-foreground">{assignment.company}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Due {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground">{assignment.candidates}</div>
                      <div className="text-xs text-muted-foreground">Candidates</div>
                    </div>
                    <Badge variant={assignment.status === 'In Progress' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Your recruitment performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Time to Fill</span>
                  <span className="text-sm font-medium">18 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Client Satisfaction</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">4.8/5</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xs ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Placements</span>
                  <span className="text-sm font-medium">147</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Since</span>
                  <span className="text-sm font-medium">March 2023</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Recent Achievements</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">Top performer badge earned</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">50+ successful placements milestone</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">Client referral bonus earned</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Jobs</CardTitle>
                <CardDescription>New opportunities matching your expertise</CardDescription>
              </div>
              <Button variant="hero">Browse All Jobs</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Full Stack Developer",
                  company: "InnovateTech",
                  location: "Jakarta",
                  budget: "$5,000 - $8,000",
                  posted: "2 hours ago",
                  applicants: 12
                },
                {
                  title: "Data Scientist",
                  company: "DataDriven Corp",
                  location: "Remote",
                  budget: "$6,000 - $10,000",
                  posted: "1 day ago",
                  applicants: 8
                },
                {
                  title: "UI/UX Designer",
                  company: "CreativeStudio",
                  location: "Bali",
                  budget: "$3,000 - $5,000",
                  posted: "2 days ago",
                  applicants: 15
                }
              ].map((job, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-muted-foreground">Budget: {job.budget}</span>
                      <span className="text-xs text-muted-foreground">Posted {job.posted}</span>
                    </div>
                  </div>
                  <div className="text-center mr-4">
                    <div className="text-sm font-medium text-foreground">{job.applicants}</div>
                    <div className="text-xs text-muted-foreground">Applicants</div>
                  </div>
                  <Button variant="outline" size="sm">Apply</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;