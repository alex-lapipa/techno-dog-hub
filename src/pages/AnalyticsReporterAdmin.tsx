import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Calendar
} from 'lucide-react';

const AnalyticsReporterAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [latestReport, setLatestReport] = useState<any>(null);

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

  return (
    <AdminPageLayout
      title="ANALYTICS REPORTER"
      description="Generates weekly usage insights and trends"
      icon={BarChart3}
      iconColor="text-logo-green"
      onRefresh={fetchData}
      onRunAgent={runAgent}
      isLoading={isLoading}
      isRunning={isRunning}
      agentButtonText="Generate Report"
      agentButtonColor="bg-logo-green hover:bg-logo-green/80"
      actions={
        <Button onClick={() => navigate('/analytics')} variant="outline" size="sm" className="font-mono text-xs">
          <Eye className="w-4 h-4 mr-2" />
          Full Analytics
        </Button>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Insights"
          value={insights.length}
          icon={TrendingUp}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Last Report"
          value={latestReport ? new Date(latestReport.created_at).toLocaleDateString() : 'Never'}
          icon={Calendar}
        />
        <AdminStatsCard
          label="Status"
          value="ACTIVE"
          icon={BarChart3}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Schedule"
          value="Weekly"
          icon={Users}
        />
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
    </AdminPageLayout>
  );
};

export default AnalyticsReporterAdmin;
