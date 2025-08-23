import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Brain, DollarSign, TrendingUp, Download, RefreshCw, Calendar } from 'lucide-react';
import RecruitmentAnalytics from './RecruitmentAnalytics';
import AIPerformanceAnalytics from './AIPerformanceAnalytics';
import CostROIAnalytics from './CostROIAnalytics';

const AdvancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('recruitment');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // Refresh will be handled by child components through their useEffect
    window.location.reload();
  };

  const handleExport = () => {
    // In a real implementation, this would export analytics data
    console.log('Exporting analytics data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your recruitment performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analytics Categories</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                Real-time Data
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <Brain className="h-8 w-8 text-secondary" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                Machine Learning
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Tracking</p>
                <p className="text-2xl font-bold">Live</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                ROI Analysis
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold">Optimized</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                Predictive
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recruitment" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Recruitment Performance
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Performance
              </TabsTrigger>
              <TabsTrigger value="cost" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost & ROI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recruitment" className="space-y-6">
              <RecruitmentAnalytics />
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <AIPerformanceAnalytics />
            </TabsContent>

            <TabsContent value="cost" className="space-y-6">
              <CostROIAnalytics />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;