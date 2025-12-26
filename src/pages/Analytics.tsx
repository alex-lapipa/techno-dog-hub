import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  MousePointer, 
  Eye,
  Brain,
  RefreshCw,
  Lock
} from 'lucide-react';

interface AnalyticsData {
  summary: string;
  insights: Array<{
    type: string;
    title: string;
    content: string;
  }>;
  metrics: {
    engagementScore: number;
    growthTrend: 'up' | 'down' | 'stable';
  };
  rawData: {
    totalEvents: number;
    uniqueUsers: number;
    topPages: Array<[string, number]>;
    peakHours: Array<{ hour: number; count: number }>;
  };
}

interface EventStats {
  date: string;
  count: number;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const Analytics = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchEventStats();
    }
  }, [isAdmin]);

  const fetchEventStats = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      // Group by date
      const grouped: Record<string, number> = {};
      data?.forEach((event) => {
        const date = new Date(event.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        grouped[date] = (grouped[date] || 0) + 1;
      });

      const stats = Object.entries(grouped)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEventStats(stats);
    } catch (error) {
      console.error('Failed to fetch event stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setGeneratingInsights(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
          return;
        }
        if (response.status === 402) {
          toast.error('AI credits exhausted. Please add funds.');
          return;
        }
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setAnalyticsData(data);
      toast.success('AI insights generated successfully');
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'engagement':
        return 'default';
      case 'content':
        return 'secondary';
      case 'trend':
        return 'outline';
      case 'recommendation':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need admin privileges to view analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Analytics Dashboard | Global Techno Knowledge</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered insights into user behavior
            </p>
          </div>
          <Button 
            onClick={generateInsights} 
            disabled={generatingInsights}
            className="gap-2"
          >
            {generatingInsights ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            Generate AI Insights
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData?.rawData.totalEvents || eventStats.reduce((a, b) => a + b.count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData?.rawData.uniqueUsers || '—'}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {analyticsData?.metrics.engagementScore || '—'}
                {analyticsData?.metrics.growthTrend && getTrendIcon(analyticsData.metrics.growthTrend)}
              </div>
              <p className="text-xs text-muted-foreground">AI-calculated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Growth Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize flex items-center gap-2">
                {analyticsData?.metrics.growthTrend || '—'}
                {analyticsData?.metrics.growthTrend && getTrendIcon(analyticsData.metrics.growthTrend)}
              </div>
              <p className="text-xs text-muted-foreground">vs. previous period</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Events Over Time</CardTitle>
              <CardDescription>Daily event count for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64" />
              ) : eventStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={eventStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData?.rawData.topPages ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={analyticsData.rawData.topPages.slice(0, 5).map(([page, count]) => ({
                      page: page.length > 15 ? page.slice(0, 15) + '...' : page,
                      count
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="page" type="category" className="text-xs" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Generate insights to see top pages
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Peak Hours Chart */}
        {analyticsData?.rawData.peakHours && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Peak Activity Hours</CardTitle>
              <CardDescription>When users are most active (24h format)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analyticsData.rawData.peakHours.map((h, i) => ({
                      name: `${h.hour}:00`,
                      value: h.count
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {analyticsData.rawData.peakHours.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* AI Summary */}
        {analyticsData?.summary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{analyticsData.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        {analyticsData?.insights && analyticsData.insights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">AI-Generated Insights</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {analyticsData.insights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <Badge variant={getInsightBadgeVariant(insight.type)}>
                        {insight.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{insight.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Analytics;
