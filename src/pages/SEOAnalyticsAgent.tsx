import { useState, useEffect } from 'react';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Globe,
  Target,
  FileText,
  RefreshCw,
  Loader2,
  BarChart3,
  MapPin,
  Calendar,
  Send
} from 'lucide-react';

interface SEOReport {
  overallScore: number;
  summary: string;
  criticalIssues: Array<{ page: string; issue: string; recommendation: string }>;
  warnings: Array<{ page: string; issue: string; recommendation: string }>;
  keywordOpportunities: Array<{ keyword: string; searchVolume: string; competition: string; recommendation: string }>;
  contentGaps: string[];
  technicalChecks: Array<{ check: string; status: string; details: string }>;
  weeklyPriorities: string[];
  competitorInsights: string;
  regionalOptimization: {
    europe?: string;
    northAmerica?: string;
    asia?: string;
    latam?: string;
  };
  timestamp: string;
  siteMetrics?: {
    artists: number;
    festivals: number;
    venues: number;
    gear: number;
    labels: number;
  };
  analyticsSnapshot?: {
    pageViews: number;
    searches: number;
    errors: number;
  };
}

const SEOAnalyticsAgent = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [latestReport, setLatestReport] = useState<SEOReport | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [customQuery, setCustomQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .eq('insight_type', 'seo_audit')
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setReports(data || []);
      if (data && data.length > 0 && data[0].data) {
        setLatestReport(data[0].data as unknown as SEOReport);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch SEO reports',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-analytics-agent', {
        body: { action: 'audit' },
      });

      if (error) throw error;

      toast({
        title: 'SEO Audit Complete',
        description: `Score: ${data.report?.overallScore || 'N/A'}`,
      });

      setLatestReport(data.report);
      fetchReports();
    } catch (error) {
      console.error('Error running audit:', error);
      toast({
        title: 'Error',
        description: 'Failed to run SEO audit',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const askQuestion = async () => {
    if (!customQuery.trim()) return;
    
    setIsQuerying(true);
    setQueryResponse('');
    
    try {
      const response = await supabase.functions.invoke('admin-ai-assistant', {
        body: {
          query: `As an SEO specialist for techno.dog, answer this question using the latest SEO data and best practices: ${customQuery}`,
          context: latestReport ? JSON.stringify(latestReport) : 'No recent audit data available',
        },
      });

      if (response.error) throw response.error;
      setQueryResponse(response.data?.response || 'No response received');
    } catch (error) {
      console.error('Error querying AI:', error);
      setQueryResponse('Error: Failed to get AI response. Please try again.');
    } finally {
      setIsQuerying(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-logo-green';
    if (score >= 60) return 'text-yellow-500';
    return 'text-crimson';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-logo-green" />;
      case 'fail': return <XCircle className="w-4 h-4 text-crimson" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <AdminPageLayout
      title="SEO Analytics Agent"
      description="AI-powered SEO auditing and optimization"
      icon={Search}
      iconColor="text-logo-green"
      onRunAgent={runAudit}
      isRunning={isRunning}
      runButtonText="Run Audit"
      onRefresh={fetchReports}
      isLoading={isLoading}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-border p-4">
          <div className="flex items-center gap-3">
            <Target className={`w-5 h-5 ${getScoreColor(latestReport?.overallScore || 0)}`} />
            <div>
              <div className="text-xs text-muted-foreground font-mono">SEO Score</div>
              <div className={`text-2xl font-bold font-mono ${getScoreColor(latestReport?.overallScore || 0)}`}>
                {latestReport?.overallScore || '--'}
              </div>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-border p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${latestReport?.criticalIssues?.length ? 'text-crimson' : 'text-logo-green'}`} />
            <div>
              <div className="text-xs text-muted-foreground font-mono">Critical Issues</div>
              <div className="text-2xl font-bold font-mono">{latestReport?.criticalIssues?.length || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-border p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-xs text-muted-foreground font-mono">Warnings</div>
              <div className="text-2xl font-bold font-mono">{latestReport?.warnings?.length || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-border p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground font-mono">Content Items</div>
              <div className="text-2xl font-bold font-mono">
                {latestReport?.siteMetrics ? Object.values(latestReport.siteMetrics).reduce((a, b) => a + b, 0) : '--'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Score Progress */}
      {latestReport?.overallScore && (
        <Card className="bg-zinc-900 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm">Overall SEO Health</span>
              <span className={`font-mono text-lg font-bold ${getScoreColor(latestReport.overallScore)}`}>
                {latestReport.overallScore}/100
              </span>
            </div>
            <Progress value={latestReport.overallScore} className="h-3" />
            <p className="mt-3 text-sm text-muted-foreground font-mono">
              {latestReport.summary}
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList className="bg-zinc-900">
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="regional">Regional SEO</TabsTrigger>
          <TabsTrigger value="ask">Ask AI</TabsTrigger>
        </TabsList>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {/* Critical Issues */}
          {latestReport?.criticalIssues && latestReport.criticalIssues.length > 0 && (
            <Card className="bg-zinc-900 border-crimson/30">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-crimson" />
                  Critical Issues ({latestReport.criticalIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {latestReport.criticalIssues.map((issue, i) => (
                      <div key={i} className="p-3 bg-crimson/10 border border-crimson/20 rounded">
                        <div className="font-mono text-xs text-crimson mb-1">{issue.page}</div>
                        <div className="text-sm font-medium">{issue.issue}</div>
                        <div className="text-xs text-muted-foreground mt-1">{issue.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {latestReport?.warnings && latestReport.warnings.length > 0 && (
            <Card className="bg-zinc-900 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Warnings ({latestReport.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {latestReport.warnings.map((warning, i) => (
                      <div key={i} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                        <div className="font-mono text-xs text-yellow-500 mb-1">{warning.page}</div>
                        <div className="text-sm font-medium">{warning.issue}</div>
                        <div className="text-xs text-muted-foreground mt-1">{warning.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Weekly Priorities */}
          {latestReport?.weeklyPriorities && (
            <Card className="bg-zinc-900 border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-logo-green" />
                  This Week's Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {latestReport.weeklyPriorities.map((priority, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-logo-green/5 border border-logo-green/20 rounded">
                      <Badge variant="outline" className="font-mono text-xs">
                        {i + 1}
                      </Badge>
                      <span className="text-sm">{priority}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-4">
          {latestReport?.keywordOpportunities && latestReport.keywordOpportunities.length > 0 && (
            <Card className="bg-zinc-900 border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-logo-green" />
                  Keyword Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestReport.keywordOpportunities.map((kw, i) => (
                    <div key={i} className="p-3 border border-border rounded hover:border-logo-green/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-medium">{kw.keyword}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            Vol: {kw.searchVolume}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${kw.competition === 'low' ? 'text-logo-green' : kw.competition === 'medium' ? 'text-yellow-500' : 'text-crimson'}`}
                          >
                            Comp: {kw.competition}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{kw.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {latestReport?.contentGaps && latestReport.contentGaps.length > 0 && (
            <Card className="bg-zinc-900 border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-yellow-500" />
                  Content Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {latestReport.contentGaps.map((gap, i) => (
                    <div key={i} className="p-2 bg-yellow-500/5 border border-yellow-500/20 rounded text-sm">
                      {gap}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical">
          {latestReport?.technicalChecks && (
            <Card className="bg-zinc-900 border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Technical SEO Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestReport.technicalChecks.map((check, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border border-border rounded">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <div className="font-mono text-sm font-medium">{check.check}</div>
                        <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional">
          {latestReport?.regionalOptimization && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(latestReport.regionalOptimization).map(([region, recommendation]) => (
                <Card key={region} className="bg-zinc-900 border-border">
                  <CardHeader>
                    <CardTitle className="font-mono text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-logo-green" />
                      {region === 'northAmerica' ? 'North America' : 
                       region === 'latam' ? 'Latin America' : 
                       region.charAt(0).toUpperCase() + region.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{recommendation}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {latestReport?.competitorInsights && (
            <Card className="bg-zinc-900 border-border mt-4">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-logo-green" />
                  Competitor Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{latestReport.competitorInsights}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ask AI Tab */}
        <TabsContent value="ask">
          <Card className="bg-zinc-900 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-logo-green" />
                Ask SEO Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask about SEO strategy, keyword optimization, regional targeting..."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="flex-1 bg-background"
                />
                <Button 
                  onClick={askQuestion} 
                  disabled={isQuerying || !customQuery.trim()}
                  className="shrink-0"
                >
                  {isQuerying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {queryResponse && (
                <div className="p-4 bg-logo-green/5 border border-logo-green/20 rounded">
                  <p className="text-sm whitespace-pre-wrap">{queryResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report History */}
      <Card className="bg-zinc-900 border-border">
        <CardHeader>
          <CardTitle className="font-mono text-sm">Audit History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className="flex items-center justify-between p-2 border border-border rounded hover:bg-background/50 cursor-pointer"
                  onClick={() => setLatestReport(report.data as unknown as SEOReport)}
                >
                  <span className="font-mono text-xs">{report.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getScoreColor((report.data as any)?.overallScore || 0)}
                    >
                      {(report.data as any)?.overallScore || '--'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
};

export default SEOAnalyticsAgent;
