import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  RefreshCw, 
  Loader2,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Calendar
} from 'lucide-react';

const AnalyticsReporterAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [latestReport, setLatestReport] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch analytics insights
      const { data: insightData } = await supabase
        .from('analytics_insights')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(10);
      
      setInsights(insightData || []);

      // Fetch latest report
      const { data: reports } = await supabase
        .from('agent_reports')
        .select('*')
        .eq('agent_name', 'analytics-reporter')
        .order('created_at', { ascending: false })
        .limit(1);

      if (reports && reports.length > 0) {
        setLatestReport(reports[0]);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('analytics-reporter');
      if (error) throw error;
      
      toast({
        title: 'Analytics Reporter completed',
        description: data?.message || 'Insights generated'
      });
      
      fetchData();
    } catch (err) {
      toast({
        title: 'Agent failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-crimson" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-logo-green" />
                ANALYTICS REPORTER
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Generates weekly usage insights and trends
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate('/analytics')} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Full Analytics
            </Button>
            <Button onClick={runAgent} disabled={isRunning} size="sm" className="bg-logo-green hover:bg-logo-green/80">
              {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
              Generate Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Insights</p>
                  <p className="text-3xl font-bold text-foreground">{insights.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-logo-green/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Last Report</p>
                  <p className="text-sm font-bold text-foreground">
                    {latestReport ? new Date(latestReport.created_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Status</p>
                  <p className="text-xl font-bold text-logo-green">ACTIVE</p>
                </div>
                <BarChart3 className="w-8 h-8 text-logo-green/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Schedule</p>
                  <p className="text-sm font-bold text-foreground">Weekly</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights List */}
        <Card className="bg-zinc-900 border-crimson/20">
          <CardHeader>
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-logo-green" />
              GENERATED INSIGHTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No insights generated yet. Run the agent to generate insights.</p>
              ) : (
                insights.map((insight) => (
                  <div key={insight.id} className="p-4 bg-zinc-800 border border-border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{insight.title}</span>
                      <Badge variant="outline">{insight.insight_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(insight.generated_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsReporterAdmin;
