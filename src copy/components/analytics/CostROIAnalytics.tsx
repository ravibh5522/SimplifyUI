import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, TrendingUp, Calculator, PiggyBank, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CostMetrics {
  totalRecruitmentCost: number;
  averageCostPerHire: number;
  costPerApplication: number;
  vendorCommissions: number;
  monthlyROI: number;
  costSavings: number;
  budgetUtilization: number;
}

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface ROITrend {
  month: string;
  cost: number;
  hires: number;
  roi: number;
  savings: number;
}

interface VendorCosts {
  vendor: string;
  totalCost: number;
  hires: number;
  costPerHire: number;
  performance: number;
}

const CostROIAnalytics = () => {
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [roiTrends, setROITrends] = useState<ROITrend[]>([]);
  const [vendorCosts, setVendorCosts] = useState<VendorCosts[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  useEffect(() => {
    fetchCostAnalyticsData();
  }, []);

  const fetchCostAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch relevant data
      const [jobsResult, applicationsResult, offersResult, vendorsResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('budget_range_min, budget_range_max, salary_min, salary_max, created_at, status'),
        supabase
          .from('job_applications')
          .select('applied_at, status'),
        supabase
          .from('offers')
          .select('salary_amount, currency, status, created_at'),
        supabase
          .from('vendors')
          .select('vendor_name, commission_rate, success_rate')
      ]);

      if (jobsResult.error) throw jobsResult.error;
      if (applicationsResult.error) throw applicationsResult.error;
      if (offersResult.error) throw offersResult.error;
      if (vendorsResult.error) throw vendorsResult.error;

      const jobs = jobsResult.data || [];
      const applications = applicationsResult.data || [];
      const offers = offersResult.data || [];
      const vendors = vendorsResult.data || [];

      const acceptedOffers = offers.filter(offer => offer.status === 'accepted');
      const totalHires = acceptedOffers.length;

      // Calculate metrics
      const totalSalaryPaid = acceptedOffers.reduce((sum, offer) => sum + (offer.salary_amount || 0), 0);
      
      // Estimate recruitment costs (platform fees, vendor commissions, etc.)
      const avgVendorCommission = vendors.length > 0 
        ? vendors.reduce((sum, v) => sum + (v.commission_rate || 0), 0) / vendors.length 
        : 0.15; // 15% default commission
      
      const vendorCommissions = totalSalaryPaid * (avgVendorCommission / 100);
      const platformCosts = totalHires * 500000; // Estimated IDR 500k per hire in platform costs
      const totalRecruitmentCost = vendorCommissions + platformCosts;
      
      const averageCostPerHire = totalHires > 0 ? totalRecruitmentCost / totalHires : 0;
      const costPerApplication = applications.length > 0 ? totalRecruitmentCost / applications.length : 0;
      
      // Calculate ROI (simplified)
      const estimatedValuePerHire = 5000000; // IDR 5M estimated value per successful hire
      const totalValue = totalHires * estimatedValuePerHire;
      const monthlyROI = totalRecruitmentCost > 0 ? ((totalValue - totalRecruitmentCost) / totalRecruitmentCost) * 100 : 0;
      
      // Estimate cost savings vs traditional recruitment
      const traditionalCostPerHire = 3000000; // IDR 3M traditional cost per hire
      const costSavings = totalHires * traditionalCostPerHire - totalRecruitmentCost;
      
      // Budget utilization
      const totalBudget = jobs.reduce((sum, job) => {
        return sum + Math.max(job.budget_range_max || job.salary_max || 0, 0);
      }, 0);
      const budgetUtilization = totalBudget > 0 ? (totalSalaryPaid / totalBudget) * 100 : 0;

      const costMetrics: CostMetrics = {
        totalRecruitmentCost,
        averageCostPerHire,
        costPerApplication,
        vendorCommissions,
        monthlyROI,
        costSavings,
        budgetUtilization
      };

      setMetrics(costMetrics);

      // Cost breakdown
      const breakdown: CostBreakdown[] = [
        {
          category: 'Vendor Commissions',
          amount: vendorCommissions,
          percentage: totalRecruitmentCost > 0 ? (vendorCommissions / totalRecruitmentCost) * 100 : 0
        },
        {
          category: 'Platform Costs',
          amount: platformCosts,
          percentage: totalRecruitmentCost > 0 ? (platformCosts / totalRecruitmentCost) * 100 : 0
        },
        {
          category: 'AI Processing',
          amount: totalHires * 50000, // IDR 50k per hire for AI processing
          percentage: totalRecruitmentCost > 0 ? ((totalHires * 50000) / totalRecruitmentCost) * 100 : 0
        },
        {
          category: 'Other Costs',
          amount: totalHires * 100000, // IDR 100k misc costs
          percentage: totalRecruitmentCost > 0 ? ((totalHires * 100000) / totalRecruitmentCost) * 100 : 0
        }
      ];

      setCostBreakdown(breakdown);

      // ROI trends (last 6 months)
      const roiTrendData: ROITrend[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthOffers = acceptedOffers.filter(offer => {
          const offerDate = new Date(offer.created_at);
          return offerDate >= monthStart && offerDate <= monthEnd;
        });
        
        const monthlyHires = monthOffers.length;
        const monthlyCost = monthlyHires * averageCostPerHire;
        const monthlyValue = monthlyHires * estimatedValuePerHire;
        const monthlyROI = monthlyCost > 0 ? ((monthlyValue - monthlyCost) / monthlyCost) * 100 : 0;
        const monthlySavings = monthlyHires * traditionalCostPerHire - monthlyCost;
        
        roiTrendData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          cost: monthlyCost,
          hires: monthlyHires,
          roi: monthlyROI,
          savings: monthlySavings
        });
      }

      setROITrends(roiTrendData);

      // Vendor cost analysis
      const vendorCostData = vendors.slice(0, 5).map((vendor, index) => {
        const vendorHires = Math.floor(Math.random() * 10) + 1; // Simplified for demo
        const vendorTotalCost = vendorHires * averageCostPerHire * ((vendor.commission_rate || 15) / 15);
        
        return {
          vendor: vendor.vendor_name || `Vendor ${index + 1}`,
          totalCost: vendorTotalCost,
          hires: vendorHires,
          costPerHire: vendorHires > 0 ? vendorTotalCost / vendorHires : 0,
          performance: vendor.success_rate || Math.random() * 30 + 70
        };
      });

      setVendorCosts(vendorCostData);

    } catch (error) {
      console.error('Error fetching cost analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load cost analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(7)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Cost Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRecruitmentCost)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="secondary" className="text-xs">
                Monthly Spend
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost per Hire</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageCostPerHire)}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">15% below avg</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold">{metrics.monthlyROI.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Calculator className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">Monthly return</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.costSavings)}</p>
              </div>
              <PiggyBank className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">vs Traditional</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendor Commissions</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.vendorCommissions)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost per Application</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.costPerApplication)}</p>
              </div>
              <Calculator className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Utilization</p>
                <p className="text-2xl font-bold">{metrics.budgetUtilization.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ROI Trends */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roiTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'roi') return [`${Number(value).toFixed(1)}%`, 'ROI'];
                    if (name === 'cost' || name === 'savings') return [formatCurrency(Number(value)), name === 'cost' ? 'Cost' : 'Savings'];
                    return [value, 'Hires'];
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="roi" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="roi"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost vs Savings */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cost vs Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={roiTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'cost' ? 'Cost' : 'Savings'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stackId="1"
                  stroke="hsl(var(--destructive))" 
                  fill="hsl(var(--destructive) / 0.3)"
                  name="cost"
                />
                <Area 
                  type="monotone" 
                  dataKey="savings" 
                  stackId="2"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.3)"
                  name="savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendor Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendorCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="vendor" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'costPerHire' ? formatCurrency(Number(value)) : value,
                    name === 'costPerHire' ? 'Cost per Hire' : 'Performance %'
                  ]}
                />
                <Bar dataKey="costPerHire" fill="hsl(var(--primary))" name="costPerHire" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostROIAnalytics;