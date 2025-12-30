import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  Workflow,
  Play,
  Search,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface AuditResult {
  entity_id: string;
  entity_name: string;
  gaps: string[];
  confidence: number;
  suggested_updates: string[];
}

const ContentOrchestratorAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [stats, setStats] = useState({
    entitiesAudited: 0,
    gapsFound: 0,
    updatesApplied: 0,
    lastRun: ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch latest orchestrator reports
      const { data: reports } = await supabase
        .from('agent_reports')
        .select('*')
        .or('agent_name.eq.content-orchestrator,agent_name.eq.Content Orchestrator')
        .order('created_at', { ascending: false })
        .limit(10);

      if (reports && reports.length > 0) {
        const latest = reports[0];
        const details = latest.details as Record<string, any> | null;
        setStats({
          entitiesAudited: details?.entities_processed || 0,
          gapsFound: details?.gaps_found || 0,
          updatesApplied: details?.updates_applied || 0,
          lastRun: new Date(latest.created_at).toLocaleDateString()
        });

        // Extract audit results from details
        if (details?.results) {
          setAuditResults(details.results);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-orchestrator', {
        body: { action: 'analyze', entityType: 'artist' }
      });
      if (error) throw error;
      
      toast({
        title: 'Analysis completed',
        description: `Analyzed ${data?.results?.length || 0} entities`
      });
      
      if (data?.results) {
        setAuditResults(data.results);
      }
      
      fetchData();
    } catch (err) {
      toast({
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runOrchestration = async () => {
    setIsOrchestrating(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-orchestrator', {
        body: { action: 'orchestrate' }
      });
      if (error) throw error;
      
      toast({
        title: 'Orchestration completed',
        description: `Processed ${data?.processedCount || 0} entities`
      });
      
      fetchData();
    } catch (err) {
      toast({
        title: 'Orchestration failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <AdminPageLayout
      title="Content Orchestrator"
      description="AI-powered content audit and enrichment pipeline"
      icon={Workflow}
      iconColor="text-logo-green"
      onRefresh={fetchData}
      isLoading={isLoading}
      actions={
        <div className="flex gap-2">
          <Button 
            onClick={runAnalysis} 
            disabled={isAnalyzing || isOrchestrating}
            variant="outline" 
            size="sm" 
            className="font-mono text-xs uppercase"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
          <Button 
            onClick={runOrchestration} 
            disabled={isAnalyzing || isOrchestrating}
            variant="brutalist" 
            size="sm" 
            className="font-mono text-xs uppercase"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            {isOrchestrating ? 'Running...' : 'Orchestrate'}
          </Button>
        </div>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Entities Audited"
          value={stats.entitiesAudited}
          icon={Search}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Gaps Found"
          value={stats.gapsFound}
          icon={AlertTriangle}
          iconColor="text-amber-500"
        />
        <AdminStatsCard
          label="Updates Applied"
          value={stats.updatesApplied}
          icon={CheckCircle}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Last Run"
          value={stats.lastRun || 'Never'}
          icon={Zap}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="bg-zinc-800 border border-border">
          <TabsTrigger value="results" className="font-mono text-xs uppercase">
            Audit Results
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="font-mono text-xs uppercase">
            Pipeline Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Card className="bg-zinc-900 border-crimson/20">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-logo-green" />
                AUDIT RESULTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No audit results. Run an analysis to identify content gaps.
                  </p>
                ) : (
                  auditResults.map((result, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-zinc-800 border border-border rounded"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-sm">{result.entity_name}</p>
                          <p className="text-xs text-muted-foreground">ID: {result.entity_id}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`font-mono text-[10px] ${
                            result.confidence > 0.7 ? 'text-logo-green' : 'text-amber-500'
                          }`}
                        >
                          {Math.round(result.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      {result.gaps.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Gaps:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.gaps.map((gap, gIdx) => (
                              <Badge key={gIdx} variant="secondary" className="text-[10px]">
                                {gap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.suggested_updates.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {result.suggested_updates.slice(0, 3).map((update, uIdx) => (
                              <li key={uIdx}>{update}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card className="bg-zinc-900 border-crimson/20">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Workflow className="w-4 h-4 text-logo-green" />
                PIPELINE OVERVIEW
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-800 border border-border rounded">
                  <p className="font-mono text-sm mb-2">Content Orchestration Flow</p>
                  <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Fetch entities to audit (prioritize high-value items)</li>
                    <li>Call content-researcher for data gathering</li>
                    <li>Call content-validator for cross-validation</li>
                    <li>Apply verified updates to database</li>
                    <li>Generate audit report</li>
                  </ol>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-zinc-800 border border-logo-green/30 rounded text-center">
                    <p className="font-mono text-xs text-muted-foreground">Research</p>
                    <p className="font-mono text-lg text-logo-green">Ready</p>
                  </div>
                  <div className="p-3 bg-zinc-800 border border-logo-green/30 rounded text-center">
                    <p className="font-mono text-xs text-muted-foreground">Validation</p>
                    <p className="font-mono text-lg text-logo-green">Ready</p>
                  </div>
                  <div className="p-3 bg-zinc-800 border border-logo-green/30 rounded text-center">
                    <p className="font-mono text-xs text-muted-foreground">Enrichment</p>
                    <p className="font-mono text-lg text-logo-green">Ready</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default ContentOrchestratorAdmin;
