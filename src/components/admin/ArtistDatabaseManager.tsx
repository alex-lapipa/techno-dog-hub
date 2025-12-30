import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Brain, 
  Search, 
  CheckCircle, 
  FileText, 
  Image, 
  Database,
  Play,
  Loader2,
  AlertCircle,
  Zap,
  Globe,
  Bot,
  Scale,
  GitMerge,
  GitFork,
  Sparkles
} from 'lucide-react';

interface AgentStatus {
  id: string;
  agent_name: string;
  function_name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  last_run_at: string | null;
  last_success_at: string | null;
  last_error_message: string | null;
  run_count: number;
  success_count: number;
  error_count: number;
  config: Record<string, any>;
}

interface PipelineStats {
  totalArtists: number;
  withEmbeddings: number;
  withPhotos: number;
  pendingEnrichment: number;
  recentErrors: number;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'Artist Enrichment': <Brain className="w-4 h-4" />,
  'Artist Research': <Search className="w-4 h-4" />,
  'Artist Verification': <CheckCircle className="w-4 h-4" />,
  'Artist Synthesis': <FileText className="w-4 h-4" />,
  'Photo Pipeline': <Image className="w-4 h-4" />,
  'DB Consolidation': <Database className="w-4 h-4" />,
};

const MODEL_BADGES: Record<string, { label: string; className: string }> = {
  openai: { label: 'GPT', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  anthropic: { label: 'Claude', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  gemini: { label: 'Gemini', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  firecrawl: { label: 'Firecrawl', className: 'bg-crimson/20 text-crimson border-crimson/30' },
};

interface ArchitectureAudit {
  openai_analysis: {
    model: string;
    recommendation: string;
    confidence: number;
    reasoning: string;
    pros: string[];
    cons: string[];
  };
  anthropic_analysis: {
    model: string;
    recommendation: string;
    confidence: number;
    reasoning: string;
    pros: string[];
    cons: string[];
  };
  consensus: {
    models_agree: boolean;
    recommendation: string;
    average_confidence: number;
    reasoning: string;
    combined_pros: string[];
    combined_cons: string[];
  };
  action_items: string[];
  database_stats: Record<string, any>;
  current_issues: string[];
}

export const ArtistDatabaseManager = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [architectureAudit, setArchitectureAudit] = useState<ArchitectureAudit | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time agent status updates
    const channel = supabase
      .channel('artist-agent-status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agent_status'
      }, () => {
        fetchAgents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAgents(), fetchStats()]);
    setLoading(false);
  };

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('agent_status')
      .select('*')
      .in('function_name', [
        'artist-enrichment-orchestrator',
        'artist-research',
        'artist-verification',
        'artist-synthesis',
        'artist-photo-pipeline',
        'database-consolidation'
      ])
      .order('agent_name');

    if (!error && data) {
      setAgents(data as unknown as AgentStatus[]);
    }
  };

  const fetchStats = async () => {
    // Get counts from various tables
    const [djArtists, canonical, photos, queue] = await Promise.all([
      supabase.from('dj_artists').select('*', { count: 'exact', head: true }),
      supabase.from('canonical_artists').select('*', { count: 'exact', head: true }),
      supabase.from('canonical_artists').select('*', { count: 'exact', head: true }).not('photo_url', 'is', null),
      supabase.from('artist_enrichment_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    setStats({
      totalArtists: (djArtists.count || 0) + (canonical.count || 0),
      withEmbeddings: djArtists.count || 0,
      withPhotos: photos.count || 0,
      pendingEnrichment: queue.count || 0,
      recentErrors: agents.filter(a => a.status === 'error').length,
    });
  };

  const runAgent = async (agent: AgentStatus) => {
    setRunningAgents(prev => new Set(prev).add(agent.agent_name));
    
    try {
      // Update status to running
      await supabase
        .from('agent_status')
        .update({ status: 'running', last_run_at: new Date().toISOString() })
        .eq('id', agent.id);

      const { data, error } = await supabase.functions.invoke(agent.function_name);
      
      if (error) throw error;

      await supabase
        .from('agent_status')
        .update({ 
          status: 'success',
          last_success_at: new Date().toISOString(),
          success_count: (agent.success_count || 0) + 1,
          run_count: (agent.run_count || 0) + 1,
          last_error_message: null
        })
        .eq('id', agent.id);

      toast.success(`${agent.agent_name} completed`, {
        description: data?.message || 'Agent finished successfully'
      });

      fetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      
      await supabase
        .from('agent_status')
        .update({ 
          status: 'error',
          last_error_message: message,
          error_count: (agent.error_count || 0) + 1,
          run_count: (agent.run_count || 0) + 1
        })
        .eq('id', agent.id);

      toast.error(`${agent.agent_name} failed`, { description: message });
    } finally {
      setRunningAgents(prev => {
        const next = new Set(prev);
        next.delete(agent.agent_name);
        return next;
      });
    }
  };

  const runFullPipeline = async () => {
    toast.info('Starting full enrichment pipeline...');
    
    // Run in sequence: Research → Verification → Synthesis
    const pipeline = agents.filter(a => 
      ['Artist Enrichment', 'Artist Research', 'Artist Verification', 'Artist Synthesis'].includes(a.agent_name)
    ).sort((a, b) => {
      const order = ['Artist Enrichment', 'Artist Research', 'Artist Verification', 'Artist Synthesis'];
      return order.indexOf(a.agent_name) - order.indexOf(b.agent_name);
    });

    for (const agent of pipeline) {
      await runAgent(agent);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-yellow-400';
      case 'success': return 'text-logo-green';
      case 'error': return 'text-crimson';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'success': return <CheckCircle className="w-3 h-3" />;
      case 'error': return <AlertCircle className="w-3 h-3" />;
      default: return <div className="w-2 h-2 rounded-full bg-muted-foreground" />;
    }
  };

  const runArchitectureAudit = async () => {
    setAuditLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('artist-db-architect', {
        body: { action: 'analyze' }
      });
      
      if (error) throw error;
      
      setArchitectureAudit(data);
      toast.success('Architecture audit complete', {
        description: `Recommendation: ${data.consensus?.recommendation?.toUpperCase()}`
      });
    } catch (err) {
      toast.error('Audit failed', { 
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setAuditLoading(false);
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'consolidate': return <GitMerge className="w-4 h-4" />;
      case 'keep_separate': return <GitFork className="w-4 h-4" />;
      case 'hybrid': return <Sparkles className="w-4 h-4" />;
      default: return <Scale className="w-4 h-4" />;
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'consolidate': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'keep_separate': return 'text-logo-green bg-logo-green/20 border-logo-green/30';
      case 'hybrid': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="agents" className="space-y-6">
      <TabsList className="bg-background border border-border">
        <TabsTrigger value="agents" className="data-[state=active]:bg-logo-green/20">
          <Bot className="w-4 h-4 mr-2" />
          Agents
        </TabsTrigger>
        <TabsTrigger value="architecture" className="data-[state=active]:bg-logo-green/20">
          <Scale className="w-4 h-4 mr-2" />
          DB Architecture
        </TabsTrigger>
      </TabsList>

      <TabsContent value="agents" className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-2xl font-mono">{stats?.totalArtists || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Artists</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-logo-green" />
              <span className="text-2xl font-mono">{stats?.withEmbeddings || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">With Embeddings</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-400" />
              <span className="text-2xl font-mono">{stats?.withPhotos || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">With Photos</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-yellow-400" />
              <span className="text-2xl font-mono">{stats?.pendingEnrichment || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-crimson" />
              <span className="text-2xl font-mono">{agents.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active Agents</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Control */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-logo-green" />
                Artist Knowledge Pipeline
              </CardTitle>
              <CardDescription className="mt-1">
                Multi-model orchestration: OpenAI + Anthropic + Gemini + Firecrawl
              </CardDescription>
            </div>
            <Button 
              onClick={runFullPipeline}
              disabled={runningAgents.size > 0}
              className="gap-2"
            >
              {runningAgents.size > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Pipeline
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const isRunning = runningAgents.has(agent.agent_name);
              const models = agent.config?.models || [];
              const uses = agent.config?.uses || [];
              
              return (
                <Card 
                  key={agent.id} 
                  className={`border-border transition-all ${
                    isRunning ? 'border-yellow-500/50 bg-yellow-500/5' : ''
                  } ${agent.status === 'error' ? 'border-crimson/50' : ''}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={getStatusColor(isRunning ? 'running' : agent.status)}>
                          {AGENT_ICONS[agent.agent_name] || <Bot className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-mono text-sm font-medium">{agent.agent_name}</h4>
                          <p className="text-[10px] text-muted-foreground">
                            {agent.config?.description || agent.function_name}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 ${getStatusColor(isRunning ? 'running' : agent.status)}`}>
                        {getStatusIcon(isRunning ? 'running' : agent.status)}
                        <span className="text-[10px] uppercase">
                          {isRunning ? 'running' : agent.status}
                        </span>
                      </div>
                    </div>

                    {/* Model badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {[...models, ...uses].map((model: string) => (
                        <Badge 
                          key={model}
                          variant="outline" 
                          className={`text-[9px] px-1.5 py-0 ${MODEL_BADGES[model]?.className || ''}`}
                        >
                          {MODEL_BADGES[model]?.label || model}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                      <span>Runs: {agent.run_count || 0}</span>
                      <span className="text-logo-green">✓ {agent.success_count || 0}</span>
                      <span className="text-crimson">✗ {agent.error_count || 0}</span>
                    </div>

                    {/* Last run */}
                    {agent.last_run_at && (
                      <p className="text-[10px] text-muted-foreground mb-3">
                        Last: {new Date(agent.last_run_at).toLocaleString()}
                      </p>
                    )}

                    {/* Error message */}
                    {agent.last_error_message && agent.status === 'error' && (
                      <p className="text-[10px] text-crimson mb-3 truncate" title={agent.last_error_message}>
                        {agent.last_error_message}
                      </p>
                    )}

                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs"
                      onClick={() => runAgent(agent)}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Run
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="architecture" className="space-y-6">
        {/* Architecture Audit Card */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-logo-green" />
                  Database Architecture Audit
                </CardTitle>
                <CardDescription className="mt-1">
                  Dual-model analysis: OpenAI GPT-4o + Anthropic Claude for consensus recommendation
                </CardDescription>
              </div>
              <Button 
                onClick={runArchitectureAudit}
                disabled={auditLoading}
                className="gap-2"
              >
                {auditLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Run Audit
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!architectureAudit ? (
              <div className="text-center py-12 text-muted-foreground">
                <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click "Run Audit" to analyze database architecture</p>
                <p className="text-xs mt-2">OpenAI and Anthropic will provide recommendations</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Consensus Card */}
                <Card className={`border-2 ${getRecommendationColor(architectureAudit.consensus?.recommendation)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getRecommendationIcon(architectureAudit.consensus?.recommendation)}
                        <div>
                          <h3 className="font-mono text-lg font-bold uppercase">
                            {architectureAudit.consensus?.recommendation?.replace('_', ' ')}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {architectureAudit.consensus?.models_agree 
                              ? '✓ Both models agree' 
                              : '⚠ Models disagree'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {((architectureAudit.consensus?.average_confidence || 0) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-sm mb-4">{architectureAudit.consensus?.reasoning}</p>
                    
                    {/* Pros and Cons */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-xs font-mono uppercase text-logo-green mb-2">Pros</h4>
                        <ul className="text-xs space-y-1">
                          {architectureAudit.consensus?.combined_pros?.slice(0, 5).map((pro, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 mt-0.5 text-logo-green shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-mono uppercase text-crimson mb-2">Cons</h4>
                        <ul className="text-xs space-y-1">
                          {architectureAudit.consensus?.combined_cons?.slice(0, 5).map((con, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <AlertCircle className="w-3 h-3 mt-0.5 text-crimson shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Model Analyses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* OpenAI Analysis */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          GPT-4o
                        </Badge>
                        OpenAI Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono uppercase">
                          {architectureAudit.openai_analysis?.recommendation?.replace('_', ' ')}
                        </span>
                        <Badge variant="outline">
                          {((architectureAudit.openai_analysis?.confidence || 0) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {architectureAudit.openai_analysis?.reasoning}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Anthropic Analysis */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          Claude
                        </Badge>
                        Anthropic Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono uppercase">
                          {architectureAudit.anthropic_analysis?.recommendation?.replace('_', ' ')}
                        </span>
                        <Badge variant="outline">
                          {((architectureAudit.anthropic_analysis?.confidence || 0) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {architectureAudit.anthropic_analysis?.reasoning}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Items */}
                {architectureAudit.action_items && architectureAudit.action_items.length > 0 && (
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-mono uppercase">
                        Recommended Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {architectureAudit.action_items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-logo-green font-mono">{i + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Current Issues */}
                {architectureAudit.current_issues && architectureAudit.current_issues.length > 0 && (
                  <Card className="border-crimson/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-mono uppercase text-crimson">
                        Current Issues Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {architectureAudit.current_issues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <AlertCircle className="w-3 h-3 mt-0.5 text-crimson shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Database Stats */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono uppercase">
                      Database Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(architectureAudit.database_stats || {}).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-xl font-mono">{String(value)}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">
                            {key.replace(/_/g, ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ArtistDatabaseManager;
