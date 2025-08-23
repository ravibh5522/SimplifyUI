import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Zap, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIMetrics {
  totalScreenings: number;
  averageScore: number;
  highPerformingCandidates: number;
  aiInterviewSessions: number;
  assessmentAccuracy: number;
  processingTime: number;
  automationRate: number;
}

interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface AIPerformanceData {
  date: string;
  averageScore: number;
  totalScreenings: number;
  accuracy: number;
}

interface InterviewAnalysis {
  sessionId: string;
  candidateName: string;
  aiScore: number;
  humanScore: number;
  accuracy: number;
  date: string;
}

const AIPerformanceAnalytics = () => {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  const [performanceData, setPerformanceData] = useState<AIPerformanceData[]>([]);
  const [interviewAnalysis, setInterviewAnalysis] = useState<InterviewAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAIAnalyticsData();
  }, []);

  const fetchAIAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch AI-related data
      const [applicationsResult, interviewsResult, aiSessionsResult] = await Promise.all([
        supabase
          .from('job_applications')
          .select('ai_screening_score, ai_screening_notes, applied_at, status')
          .not('ai_screening_score', 'is', null),
        supabase
          .from('interviews')
          .select('ai_score, interviewer_score, ai_evaluation_score, created_at, status')
          .not('ai_score', 'is', null),
        supabase
          .from('ai_interview_sessions')
          .select('ai_assessment, created_at, status, conversation_history')
      ]);

      if (applicationsResult.error) throw applicationsResult.error;
      if (interviewsResult.error) throw interviewsResult.error;
      if (aiSessionsResult.error) throw aiSessionsResult.error;

      const applications = applicationsResult.data || [];
      const interviews = interviewsResult.data || [];
      const aiSessions = aiSessionsResult.data || [];

      // Calculate AI metrics
      const totalScreenings = applications.length;
      const averageScore = applications.length > 0 
        ? applications.reduce((sum, app) => sum + (app.ai_screening_score || 0), 0) / applications.length
        : 0;
      
      const highPerformingCandidates = applications.filter(app => (app.ai_screening_score || 0) >= 80).length;
      const aiInterviewSessions = aiSessions.length;
      
      // Calculate assessment accuracy (comparing AI scores with human scores)
      const interviewsWithBothScores = interviews.filter(
        interview => interview.ai_score && interview.interviewer_score
      );
      
      const assessmentAccuracy = interviewsWithBothScores.length > 0
        ? interviewsWithBothScores.reduce((sum, interview) => {
            const aiScore = interview.ai_score || 0;
            const humanScore = interview.interviewer_score || 0;
            const accuracy = 100 - Math.abs(aiScore - humanScore);
            return sum + Math.max(0, accuracy);
          }, 0) / interviewsWithBothScores.length
        : 0;

      // Estimate processing time (simplified)
      const processingTime = 2.5; // Average seconds
      const automationRate = totalScreenings > 0 ? 85 : 0; // Percentage of automated processes

      const aiMetrics: AIMetrics = {
        totalScreenings,
        averageScore,
        highPerformingCandidates,
        aiInterviewSessions,
        assessmentAccuracy,
        processingTime,
        automationRate
      };

      setMetrics(aiMetrics);

      // Score distribution
      const scoreRanges = [
        { range: '0-20', min: 0, max: 20 },
        { range: '21-40', min: 21, max: 40 },
        { range: '41-60', min: 41, max: 60 },
        { range: '61-80', min: 61, max: 80 },
        { range: '81-100', min: 81, max: 100 }
      ];

      const distribution = scoreRanges.map(range => {
        const count = applications.filter(app => {
          const score = app.ai_screening_score || 0;
          return score >= range.min && score <= range.max;
        }).length;
        
        return {
          range: range.range,
          count,
          percentage: totalScreenings > 0 ? Math.round((count / totalScreenings) * 100) : 0
        };
      });

      setScoreDistribution(distribution);

      // Performance data over time (last 30 days)
      const performanceMap = new Map<string, { scores: number[]; screenings: number; accuracies: number[] }>();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        performanceMap.set(dateStr, { scores: [], screenings: 0, accuracies: [] });
      }

      // Add application screening data
      applications.forEach(app => {
        const date = new Date(app.applied_at).toISOString().split('T')[0];
        if (performanceMap.has(date) && app.ai_screening_score) {
          const dayData = performanceMap.get(date)!;
          dayData.scores.push(app.ai_screening_score);
          dayData.screenings++;
        }
      });

      // Add accuracy data from interviews
      interviewsWithBothScores.forEach(interview => {
        const date = new Date(interview.created_at).toISOString().split('T')[0];
        if (performanceMap.has(date)) {
          const dayData = performanceMap.get(date)!;
          const accuracy = 100 - Math.abs((interview.ai_score || 0) - (interview.interviewer_score || 0));
          dayData.accuracies.push(Math.max(0, accuracy));
        }
      });

      const performanceArray = Array.from(performanceMap.entries()).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(),
        averageScore: data.scores.length > 0 
          ? data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length 
          : 0,
        totalScreenings: data.screenings,
        accuracy: data.accuracies.length > 0
          ? data.accuracies.reduce((sum, acc) => sum + acc, 0) / data.accuracies.length
          : 0
      }));

      setPerformanceData(performanceArray);

      // Interview analysis (AI vs Human scoring)
      const analysisData = interviewsWithBothScores.slice(0, 20).map((interview, index) => ({
        sessionId: `Session ${index + 1}`,
        candidateName: `Candidate ${index + 1}`,
        aiScore: interview.ai_score || 0,
        humanScore: interview.interviewer_score || 0,
        accuracy: 100 - Math.abs((interview.ai_score || 0) - (interview.interviewer_score || 0)),
        date: new Date(interview.created_at).toLocaleDateString()
      }));

      setInterviewAnalysis(analysisData);

    } catch (error) {
      console.error('Error fetching AI analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load AI analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Screenings</p>
                <p className="text-2xl font-bold">{metrics.totalScreenings}</p>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="secondary" className="text-xs">
                {metrics.averageScore.toFixed(1)} Avg Score
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Performers</p>
                <p className="text-2xl font-bold">{metrics.highPerformingCandidates}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">80+ Score</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assessment Accuracy</p>
                <p className="text-2xl font-bold">{metrics.assessmentAccuracy.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">vs Human Scores</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing Speed</p>
                <p className="text-2xl font-bold">{metrics.processingTime}s</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">Avg per screening</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Interview Sessions</p>
                <p className="text-2xl font-bold">{metrics.aiInterviewSessions}</p>
              </div>
              <Brain className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Automation Rate</p>
                <p className="text-2xl font-bold">{metrics.automationRate}%</p>
              </div>
              <Zap className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">AI Performance Grade</p>
              <Badge variant="default" className="text-lg px-4 py-2">
                {metrics.assessmentAccuracy >= 90 ? 'A+' : 
                 metrics.assessmentAccuracy >= 80 ? 'A' :
                 metrics.assessmentAccuracy >= 70 ? 'B' : 'C'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>AI Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="range" 
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
                    `${value} candidates (${scoreDistribution.find(d => d.count === value)?.percentage || 0}%)`,
                    'Count'
                  ]}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>AI Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
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
                />
                <Line 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Average Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Accuracy %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI vs Human Scoring */}
        <Card>
          <CardHeader>
            <CardTitle>AI vs Human Scoring Correlation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={interviewAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  dataKey="aiScore" 
                  name="AI Score"
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  type="number" 
                  dataKey="humanScore" 
                  name="Human Score"
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <ReferenceLine 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                />
                <Scatter dataKey="humanScore" fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Screening Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Screening Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
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
                />
                <Bar dataKey="totalScreenings" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIPerformanceAnalytics;