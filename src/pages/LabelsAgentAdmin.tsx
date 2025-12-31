import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminPageLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Disc, 
  RefreshCw, 
  Play, 
  Database, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Globe,
  Music,
  TrendingUp
} from "lucide-react";

interface LabelStats {
  totalLabels: number;
  enrichedLabels: number;
  pendingLabels: number;
  documentsCount: number;
  claimsCount: number;
  enrichmentRate: number;
  recentRuns: any[];
}

interface GapSummary {
  noDescription: number;
  noBio: number;
  noPhilosophy: number;
  noArtists: number;
  lowScore: number;
  pending: number;
}

const LabelsAgentAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<LabelStats | null>(null);
  const [gaps, setGaps] = useState<GapSummary | null>(null);
  const [labels, setLabels] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const { data: statsData } = await supabase.functions.invoke('labels-agent', {
        body: { action: 'get_stats' }
      });
      if (statsData) setStats(statsData);

      // Fetch gaps
      const { data: gapsData } = await supabase.functions.invoke('labels-agent', {
        body: { action: 'gap_analysis' }
      });
      if (gapsData?.summary) setGaps(gapsData.summary);

      // Fetch labels from database
      const { data: labelsData } = await supabase
        .from('labels')
        .select('id, label_name, slug, headquarters_city, headquarters_country, founded_year, enrichment_status, enrichment_score, last_enriched_at')
        .order('label_name');
      
      if (labelsData) setLabels(labelsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const runAction = async (action: string, params?: any) => {
    setIsRunning(true);
    setCurrentAction(action);
    setProgress(10);

    try {
      const { data, error } = await supabase.functions.invoke('labels-agent', {
        body: { action, params }
      });

      setProgress(90);

      if (error) throw error;

      toast({
        title: "Action completed",
        description: `${action} finished successfully`
      });

      // Refresh data
      await fetchData();
      setProgress(100);

      return data;
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentAction('');
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const enrichSingleLabel = async (labelId: string, labelName: string) => {
    toast({
      title: "Enriching label",
      description: `Starting enrichment for ${labelName}...`
    });

    await runAction('enrich_label', { labelId, forceRefresh: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-mono">Access denied</p>
      </div>
    );
  }

  return (
    <AdminPageLayout
      title="Labels Agent"
      description="Techno record label researcher with multi-model AI orchestration"
      icon={Disc}
      onRefresh={fetchData}
      isLoading={isLoading}
    >
      {/* Progress bar */}
      {isRunning && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              Running: {currentAction}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Disc className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">Total Labels</span>
            </div>
            <p className="font-mono text-2xl">{stats?.totalLabels || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="font-mono text-xs text-muted-foreground">Enriched</span>
            </div>
            <p className="font-mono text-2xl">{stats?.enrichedLabels || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="font-mono text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="font-mono text-2xl">{stats?.pendingLabels || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs text-muted-foreground">Documents</span>
            </div>
            <p className="font-mono text-2xl">{stats?.documentsCount || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-xs text-muted-foreground">Claims</span>
            </div>
            <p className="font-mono text-2xl">{stats?.claimsCount || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs text-muted-foreground">Enrichment Rate</span>
            </div>
            <p className="font-mono text-2xl">{stats?.enrichmentRate || 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="bg-card/50 border border-border">
          <TabsTrigger value="pipeline" className="font-mono text-xs">Pipeline</TabsTrigger>
          <TabsTrigger value="labels" className="font-mono text-xs">Labels</TabsTrigger>
          <TabsTrigger value="gaps" className="font-mono text-xs">Gap Analysis</TabsTrigger>
          <TabsTrigger value="runs" className="font-mono text-xs">Recent Runs</TabsTrigger>
        </TabsList>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Sync Static Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground mb-4">
                  Sync labels from static file to database without overwriting enriched data.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => runAction('sync_from_static')}
                  disabled={isRunning}
                  className="w-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRunning && currentAction === 'sync_from_static' ? 'animate-spin' : ''}`} />
                  Sync Labels
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground mb-4">
                  Analyze missing data and identify labels needing enrichment.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => runAction('gap_analysis')}
                  disabled={isRunning}
                  className="w-full"
                >
                  <Search className={`w-4 h-4 mr-2 ${isRunning && currentAction === 'gap_analysis' ? 'animate-spin' : ''}`} />
                  Analyze Gaps
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Enrich Batch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground mb-4">
                  Enrich next 5 pending labels using multi-model AI.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => runAction('enrich_batch', { batchSize: 5 })}
                  disabled={isRunning}
                  className="w-full"
                >
                  <Sparkles className={`w-4 h-4 mr-2 ${isRunning && currentAction === 'enrich_batch' ? 'animate-spin' : ''}`} />
                  Enrich Batch
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  Full Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground mb-4">
                  Sync + Gap Analysis + Enrich pending labels.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => runAction('full_pipeline', { batchSize: 5 })}
                  disabled={isRunning}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Play className={`w-4 h-4 mr-2 ${isRunning && currentAction === 'full_pipeline' ? 'animate-spin' : ''}`} />
                  Run Pipeline
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Model Orchestration Info */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm">Multi-Model Orchestration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-xs">Primary</Badge>
                  <p className="font-mono text-xs text-muted-foreground">Gemini 2.5 Flash</p>
                  <p className="font-mono text-[10px] text-muted-foreground/70">Fast general tasks</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-xs">Research</Badge>
                  <p className="font-mono text-xs text-muted-foreground">GPT-5 Mini</p>
                  <p className="font-mono text-[10px] text-muted-foreground/70">Deep research & extraction</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-xs">Validation</Badge>
                  <p className="font-mono text-xs text-muted-foreground">Gemini 2.5 Pro</p>
                  <p className="font-mono text-[10px] text-muted-foreground/70">Quality validation</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-xs">Scraping</Badge>
                  <p className="font-mono text-xs text-muted-foreground">Firecrawl</p>
                  <p className="font-mono text-[10px] text-muted-foreground/70">Discogs, RA, websites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Labels Tab */}
        <TabsContent value="labels">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm">Labels Database</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {labels.map((label) => (
                    <div 
                      key={label.id} 
                      className="flex items-center justify-between p-3 rounded border border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Disc className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-mono text-sm">{label.label_name}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {label.headquarters_city}, {label.headquarters_country}
                            {label.founded_year && ` • Est. ${label.founded_year}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(label.enrichment_status)}>
                          {label.enrichment_status || 'pending'}
                        </Badge>
                        {label.enrichment_score && (
                          <span className="font-mono text-xs text-muted-foreground">
                            {label.enrichment_score}%
                          </span>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => enrichSingleLabel(label.id, label.label_name)}
                          disabled={isRunning}
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="gaps">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-muted-foreground">No Description</span>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
                <p className="font-mono text-3xl">{gaps?.noDescription || 0}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-muted-foreground">No Bio</span>
                  <FileText className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="font-mono text-3xl">{gaps?.noBio || 0}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-muted-foreground">No Philosophy</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <p className="font-mono text-3xl">{gaps?.noPhilosophy || 0}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-muted-foreground">No Artists</span>
                  <Music className="w-4 h-4 text-blue-400" />
                </div>
                <p className="font-mono text-3xl">{gaps?.noArtists || 0}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-muted-foreground">Low Score (&lt;50)</span>
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                </div>
                <p className="font-mono text-3xl">{gaps?.lowScore || 0}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-muted-foreground">Pending</span>
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="font-mono text-3xl">{gaps?.pending || 0}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Runs Tab */}
        <TabsContent value="runs">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm">Recent Enrichment Runs</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentRuns && stats.recentRuns.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentRuns.map((run: any) => (
                    <div key={run.id} className="p-3 rounded border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(run.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        Type: {run.run_type}
                        {run.models_used && ` • Models: ${run.models_used.length}`}
                      </p>
                      {run.stats && (
                        <p className="font-mono text-xs text-muted-foreground mt-1">
                          AI calls: {run.stats.aiCalls || 0} • Scrapes: {run.stats.firecrawlScrapes || 0}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-sm text-muted-foreground text-center py-8">
                  No enrichment runs yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default LabelsAgentAdmin;
