import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  RefreshCw, 
  Zap, 
  MessageSquare, 
  Database, 
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Globe,
  Search,
  Play,
  Square,
  Rocket
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AgentStats {
  totalGear: number;
  withDescriptions: number;
  withTechnoApps: number;
  completionRate: number;
}

interface GearItem {
  id: string;
  name: string;
  brand: string;
  category?: string;
  short_description?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GapSummary {
  totalItems: number;
  gapsFound: {
    description: number;
    technoApplications: number;
    notableArtists: number;
    famousTracks: number;
    youtubeVideos: number;
    images: number;
    features: number;
    notScraped: number;
  };
}

interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  itemsProcessed?: number;
}

interface FillGapsResult {
  id: string;
  name: string;
  gapScore?: number;
  scraped?: boolean;
  fieldsUpdated?: string[];
  success: boolean;
  error?: string;
}

const GearAgentAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [recentItems, setRecentItems] = useState<GearItem[]>([]);
  const [needsContent, setNeedsContent] = useState<GearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFillingGaps, setIsFillingGaps] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedGear, setSelectedGear] = useState<string | null>(null);
  const [scrapeResults, setScrapeResults] = useState<any[]>([]);
  const [firecrawlEnabled, setFirecrawlEnabled] = useState(false);
  const [gapSummary, setGapSummary] = useState<GapSummary | null>(null);
  const [fillGapsResults, setFillGapsResults] = useState<FillGapsResult[]>([]);
  
  // Pipeline state
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineAborted, setPipelineAborted] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [totalItemsToProcess, setTotalItemsToProcess] = useState(0);
  const [itemsProcessed, setItemsProcessed] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStatus();
    }
  }, [isAdmin]);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'status' }
      });

      if (error) throw error;

      setStats(data.stats);
      setRecentItems(data.recentItems || []);
      setNeedsContent(data.needsContent || []);
      setFirecrawlEnabled(data.firecrawlEnabled || false);
    } catch (err) {
      console.error('Failed to fetch agent status:', err);
      toast({
        title: 'Failed to fetch status',
        description: 'Could not connect to Gear Expert Agent',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrichSingle = async (gearId: string) => {
    setSelectedGear(gearId);
    setIsEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'enrich', gearId }
      });

      if (error) throw error;

      toast({
        title: 'Enrichment complete',
        description: data.message
      });

      fetchStatus();
    } catch (err) {
      console.error('Enrichment failed:', err);
      toast({
        title: 'Enrichment failed',
        variant: 'destructive'
      });
    } finally {
      setIsEnriching(false);
      setSelectedGear(null);
    }
  };

  const handleBatchEnrich = async () => {
    setIsEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'batch-enrich' }
      });

      if (error) throw error;

      toast({
        title: 'Batch enrichment complete',
        description: data.message
      });

      fetchStatus();
    } catch (err) {
      console.error('Batch enrichment failed:', err);
      toast({
        title: 'Batch enrichment failed',
        variant: 'destructive'
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const handleScrapeSingle = async (gearId: string) => {
    setSelectedGear(gearId);
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'scrape-equipboard', gearId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Scrape complete',
          description: `Found ${data.extracted?.notable_artists?.length || 0} artists for ${data.gearName}`
        });
        setScrapeResults(prev => [...prev, data]);
      } else {
        toast({
          title: 'No data found',
          description: data.error || 'Could not find gear on Equipboard',
          variant: 'destructive'
        });
      }

      fetchStatus();
    } catch (err) {
      console.error('Scrape failed:', err);
      toast({
        title: 'Scrape failed',
        variant: 'destructive'
      });
    } finally {
      setIsScraping(false);
      setSelectedGear(null);
    }
  };

  const handleBatchScrape = async () => {
    setIsScraping(true);
    setScrapeResults([]);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'batch-scrape-equipboard', limit: 3 }
      });

      if (error) throw error;

      toast({
        title: 'Batch scrape complete',
        description: data.message
      });

      setScrapeResults(data.results || []);
      fetchStatus();
    } catch (err) {
      console.error('Batch scrape failed:', err);
      toast({
        title: 'Batch scrape failed',
        variant: 'destructive'
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleGapAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'gap-analysis' }
      });

      if (error) throw error;

      setGapSummary(data.summary);
      toast({
        title: 'Gap analysis complete',
        description: data.message
      });
    } catch (err) {
      console.error('Gap analysis failed:', err);
      toast({
        title: 'Gap analysis failed',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFillGaps = async (batchSize: number = 5) => {
    setIsFillingGaps(true);
    setFillGapsResults([]);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'fill-gaps', limit: batchSize }
      });

      if (error) throw error;

      setFillGapsResults(data.results || []);
      toast({
        title: 'Gap filling complete',
        description: data.message
      });

      // Refresh status and gap analysis
      fetchStatus();
      handleGapAnalysis();
    } catch (err) {
      console.error('Fill gaps failed:', err);
      toast({
        title: 'Fill gaps failed',
        variant: 'destructive'
      });
    } finally {
      setIsFillingGaps(false);
    }
  };

  // Master Pipeline - runs full gap analysis and filling automatically
  const runFullPipeline = async () => {
    setIsPipelineRunning(true);
    setPipelineAborted(false);
    setFillGapsResults([]);
    setItemsProcessed(0);
    
    const steps: PipelineStep[] = [
      { id: 'analyze', name: 'Analyze Database Gaps', status: 'pending' },
      { id: 'fill', name: 'Fill Gaps in Batches', status: 'pending' },
      { id: 'verify', name: 'Verify & Report', status: 'pending' }
    ];
    setPipelineSteps(steps);
    setPipelineProgress(0);

    try {
      // Step 1: Analyze gaps
      updatePipelineStep('analyze', 'running', 'Scanning database for missing data...');
      
      const { data: gapData, error: gapError } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'gap-analysis' }
      });

      if (gapError) throw gapError;
      if (pipelineAborted) return;

      setGapSummary(gapData.summary);
      const totalGaps = gapData.summary?.gapsFound?.notScraped || 0;
      setTotalItemsToProcess(totalGaps);
      
      updatePipelineStep('analyze', 'completed', `Found ${totalGaps} items needing data`);
      setPipelineProgress(20);

      // Step 2: Fill gaps in batches
      updatePipelineStep('fill', 'running', 'Starting batch processing...');
      
      const batchSize = 5;
      let processed = 0;
      let allResults: FillGapsResult[] = [];
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 3;

      while (processed < totalGaps && !pipelineAborted && consecutiveErrors < maxConsecutiveErrors) {
        const { data: fillData, error: fillError } = await supabase.functions.invoke('gear-expert-agent', {
          body: { action: 'fill-gaps', limit: batchSize }
        });

        if (fillError) {
          consecutiveErrors++;
          console.error('Batch error:', fillError);
          continue;
        }

        consecutiveErrors = 0;
        const batchResults = fillData.results || [];
        allResults = [...allResults, ...batchResults];
        processed += batchResults.length;
        setItemsProcessed(processed);
        setFillGapsResults(allResults);

        // Update progress (20% to 80% for filling)
        const fillProgress = Math.min((processed / totalGaps) * 60, 60);
        setPipelineProgress(20 + fillProgress);
        updatePipelineStep('fill', 'running', `Processed ${processed}/${totalGaps} items...`);

        // Check if we're done (no more items returned)
        if (batchResults.length < batchSize) break;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (pipelineAborted) {
        updatePipelineStep('fill', 'error', 'Pipeline aborted by user');
        return;
      }

      updatePipelineStep('fill', 'completed', `Processed ${processed} items successfully`);
      setPipelineProgress(85);

      // Step 3: Verify & Report
      updatePipelineStep('verify', 'running', 'Generating final report...');
      
      // Refresh stats
      await fetchStatus();
      
      // Run final gap analysis to show remaining gaps
      const { data: finalGapData } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'gap-analysis' }
      });
      
      if (finalGapData?.summary) {
        setGapSummary(finalGapData.summary);
      }

      const successCount = allResults.filter(r => r.success).length;
      updatePipelineStep('verify', 'completed', `Completed: ${successCount}/${processed} items enriched`);
      setPipelineProgress(100);

      toast({
        title: 'Pipeline Complete! 🎉',
        description: `Successfully processed ${successCount} gear items`
      });

    } catch (err) {
      console.error('Pipeline failed:', err);
      toast({
        title: 'Pipeline failed',
        description: 'An error occurred during processing',
        variant: 'destructive'
      });
      
      // Mark current running step as error
      setPipelineSteps(prev => prev.map(step => 
        step.status === 'running' ? { ...step, status: 'error', message: 'Failed' } : step
      ));
    } finally {
      setIsPipelineRunning(false);
    }
  };

  const updatePipelineStep = (stepId: string, status: PipelineStep['status'], message: string) => {
    setPipelineSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  const abortPipeline = () => {
    setPipelineAborted(true);
    toast({
      title: 'Aborting pipeline...',
      description: 'Will stop after current batch completes'
    });
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatting(true);

    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'chat', query: userMessage }
      });

      if (error) throw error;

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error('Chat failed:', err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsChatting(false);
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-2">
                <Bot className="w-6 h-6 text-logo-green" />
                GEAR EXPERT AGENT
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                AI-powered gear database management
              </p>
            </div>
          </div>
          <Button onClick={fetchStatus} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Total Gear</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalGear || 0}</p>
                </div>
                <Database className="w-8 h-8 text-crimson/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">With Descriptions</p>
                  <p className="text-3xl font-bold text-logo-green">{stats?.withDescriptions || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-logo-green/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Techno Apps</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.withTechnoApps || 0}</p>
                </div>
                <Zap className="w-8 h-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Completion</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.completionRate || 0}%</p>
                </div>
                <div className="w-8 h-8 rounded-full border-4 border-crimson/30" 
                     style={{ 
                       background: `conic-gradient(hsl(var(--logo-green)) ${stats?.completionRate || 0}%, transparent 0)` 
                     }} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Master Pipeline Control */}
        <Card className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 border-2 border-logo-green/50 shadow-lg shadow-logo-green/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-lg flex items-center gap-3">
              <div className="p-2 bg-logo-green/20 rounded-lg">
                <Rocket className="w-6 h-6 text-logo-green" />
              </div>
              <div>
                <span className="text-logo-green">MASTER PIPELINE</span>
                <p className="text-xs text-muted-foreground font-normal mt-1">
                  Run full database enrichment with one click
                </p>
              </div>
            </CardTitle>
            <div className="flex gap-2">
              {!isPipelineRunning ? (
                <Button 
                  onClick={runFullPipeline}
                  disabled={!firecrawlEnabled}
                  size="lg"
                  className="bg-logo-green hover:bg-logo-green/80 text-black font-bold px-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Run Full Pipeline
                </Button>
              ) : (
                <Button 
                  onClick={abortPipeline}
                  variant="destructive"
                  size="lg"
                  className="font-bold px-6"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Pipeline
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!firecrawlEnabled && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                <p className="text-sm text-amber-500">
                  ⚠️ Firecrawl is not enabled. Connect Firecrawl to use the pipeline.
                </p>
              </div>
            )}

            {/* Pipeline Progress */}
            {(isPipelineRunning || pipelineSteps.length > 0) && (
              <div className="space-y-4">
                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-mono">Overall Progress</span>
                    <span className="text-foreground font-bold">{pipelineProgress}%</span>
                  </div>
                  <Progress value={pipelineProgress} className="h-3" />
                  {totalItemsToProcess > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {itemsProcessed} / {totalItemsToProcess} items processed
                    </p>
                  )}
                </div>

                {/* Pipeline Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {pipelineSteps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`p-4 rounded-lg border ${
                        step.status === 'completed' ? 'bg-logo-green/10 border-logo-green/50' :
                        step.status === 'running' ? 'bg-amber-500/10 border-amber-500/50' :
                        step.status === 'error' ? 'bg-crimson/10 border-crimson/50' :
                        'bg-zinc-800 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          STEP {index + 1}
                        </span>
                        {step.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-logo-green" />
                        )}
                        {step.status === 'running' && (
                          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                        )}
                        {step.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-crimson" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">{step.name}</p>
                      {step.message && (
                        <p className="text-xs text-muted-foreground mt-1">{step.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats when not running */}
            {!isPipelineRunning && pipelineSteps.length === 0 && (
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="text-center p-3 bg-zinc-800 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{gapSummary?.gapsFound?.notScraped || '?'}</p>
                  <p className="text-xs text-muted-foreground">Items to Process</p>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">~{Math.ceil((gapSummary?.gapsFound?.notScraped || 0) / 5)}</p>
                  <p className="text-xs text-muted-foreground">Batches Needed</p>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">~{Math.ceil((gapSummary?.gapsFound?.notScraped || 0) * 0.5)}</p>
                  <p className="text-xs text-muted-foreground">Est. Minutes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gap Analysis & Fill Gaps Section */}
        <Card className="bg-zinc-900 border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-500" />
              DATABASE GAP ANALYSIS
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={handleGapAnalysis} 
                disabled={isAnalyzing}
                size="sm"
                variant="outline"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Analyze Gaps
              </Button>
              <Button 
                onClick={() => handleFillGaps(5)} 
                disabled={isFillingGaps || !firecrawlEnabled}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {isFillingGaps ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Fill Gaps (5)
              </Button>
              <Button 
                onClick={() => handleFillGaps(10)} 
                disabled={isFillingGaps || !firecrawlEnabled}
                size="sm"
                variant="outline"
                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                {isFillingGaps ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Fill Gaps (10)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Analyzes the database for missing data and automatically scrapes Equipboard + generates AI content to fill gaps without destroying existing data.
            </p>

            {/* Gap Summary */}
            {gapSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-zinc-800 border border-border rounded">
                  <p className="text-xs text-muted-foreground font-mono">Not Scraped</p>
                  <p className="text-xl font-bold text-amber-500">{gapSummary.gapsFound.notScraped}</p>
                </div>
                <div className="p-3 bg-zinc-800 border border-border rounded">
                  <p className="text-xs text-muted-foreground font-mono">Missing Description</p>
                  <p className="text-xl font-bold text-foreground">{gapSummary.gapsFound.description}</p>
                </div>
                <div className="p-3 bg-zinc-800 border border-border rounded">
                  <p className="text-xs text-muted-foreground font-mono">Missing Artists</p>
                  <p className="text-xl font-bold text-foreground">{gapSummary.gapsFound.notableArtists}</p>
                </div>
                <div className="p-3 bg-zinc-800 border border-border rounded">
                  <p className="text-xs text-muted-foreground font-mono">Missing Tracks</p>
                  <p className="text-xl font-bold text-foreground">{gapSummary.gapsFound.famousTracks}</p>
                </div>
                <div className="p-3 bg-zinc-800 border border-border rounded">
                  <p className="text-xs text-muted-foreground font-mono">Missing Features</p>
                  <p className="text-xl font-bold text-foreground">{gapSummary.gapsFound.features}</p>
                </div>
                <div className="p-3 bg-zinc-800 border border-border rounded">
                  <p className="text-xs text-muted-foreground font-mono">Missing Techno Apps</p>
                  <p className="text-xl font-bold text-foreground">{gapSummary.gapsFound.technoApplications}</p>
                </div>
                <div className="p-3 bg-zinc-800 border border-border rounded">
                  <p className="text-xs text-muted-foreground font-mono">Missing Videos</p>
                  <p className="text-xl font-bold text-foreground">{gapSummary.gapsFound.youtubeVideos}</p>
                </div>
                <div className="p-3 bg-zinc-800 border border-border rounded">
                  <p className="text-xs text-muted-foreground font-mono">Missing Images</p>
                  <p className="text-xl font-bold text-foreground">{gapSummary.gapsFound.images}</p>
                </div>
              </div>
            )}

            {/* Fill Gaps Results */}
            {fillGapsResults.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-border">
                <p className="text-xs font-mono text-muted-foreground uppercase">Recent Fill Gaps Results</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {fillGapsResults.map((result, i) => (
                    <div key={i} className="p-2 bg-zinc-800 border border-border rounded text-xs flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground">{result.name}</span>
                        {result.gapScore && (
                          <span className="text-muted-foreground ml-2">(gap score: {result.gapScore})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.scraped && (
                          <Badge variant="outline" className="text-logo-green border-logo-green/50 text-[10px]">
                            SCRAPED
                          </Badge>
                        )}
                        {result.success ? (
                          <Badge variant="outline" className="text-logo-green border-logo-green/50 text-[10px]">
                            {result.fieldsUpdated?.length || 0} fields
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-crimson border-crimson/50 text-[10px]">
                            FAILED
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Needs Content Panel */}
          <Card className="bg-zinc-900 border-crimson/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                NEEDS CONTENT
              </CardTitle>
              <Button 
                onClick={handleBatchEnrich} 
                disabled={isEnriching || needsContent.length === 0}
                size="sm"
                className="bg-logo-green hover:bg-logo-green/80"
              >
                {isEnriching ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Enrich Batch (3)
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {needsContent.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All gear items have content!
                  </p>
                ) : (
                  needsContent.map((gear) => (
                    <div 
                      key={gear.id} 
                      className="flex items-center justify-between p-2 bg-zinc-800 border border-border rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{gear.name}</p>
                        <p className="text-xs text-muted-foreground">{gear.brand}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEnrichSingle(gear.id)}
                        disabled={isEnriching && selectedGear === gear.id}
                      >
                        {isEnriching && selectedGear === gear.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Items Panel */}
          <Card className="bg-zinc-900 border-crimson/20">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-crimson" />
                RECENT UPDATES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentItems.map((gear) => (
                  <div 
                    key={gear.id} 
                    className="flex items-center justify-between p-2 bg-zinc-800 border border-border rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{gear.name}</p>
                      <p className="text-xs text-muted-foreground">{gear.brand}</p>
                    </div>
                    {gear.short_description ? (
                      <Badge variant="outline" className="text-logo-green border-logo-green/50 text-[10px]">
                        HAS CONTENT
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/50 text-[10px]">
                        NEEDS CONTENT
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipboard Scraping Section */}
        <Card className="bg-zinc-900 border-logo-green/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-logo-green" />
              EQUIPBOARD SCRAPER
              {firecrawlEnabled ? (
                <Badge variant="outline" className="text-logo-green border-logo-green/50 text-[10px] ml-2">
                  FIRECRAWL ACTIVE
                </Badge>
              ) : (
                <Badge variant="outline" className="text-crimson border-crimson/50 text-[10px] ml-2">
                  FIRECRAWL DISABLED
                </Badge>
              )}
            </CardTitle>
            <Button 
              onClick={handleBatchScrape} 
              disabled={isScraping || !firecrawlEnabled}
              size="sm"
              className="bg-logo-green hover:bg-logo-green/80"
            >
              {isScraping ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Scrape Batch (3)
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Scrapes equipboard.com to find which artists use each gear, famous tracks, and detailed specifications.
            </p>
            
            {/* Scrape individual gear items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
              {needsContent.slice(0, 6).map((gear) => (
                <div 
                  key={gear.id} 
                  className="flex items-center justify-between p-2 bg-zinc-800 border border-border rounded"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{gear.name}</p>
                    <p className="text-xs text-muted-foreground">{gear.brand}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleScrapeSingle(gear.id)}
                    disabled={isScraping || !firecrawlEnabled}
                    className="ml-2"
                  >
                    {isScraping && selectedGear === gear.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {/* Scrape Results */}
            {scrapeResults.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-border">
                <p className="text-xs font-mono text-muted-foreground uppercase">Recent Scrape Results</p>
                {scrapeResults.map((result, i) => (
                  <div key={i} className="p-2 bg-zinc-800 border border-border rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{result.name || result.gearName}</span>
                      {result.success ? (
                        <Badge variant="outline" className="text-logo-green border-logo-green/50">
                          {result.artistsFound || 0} artists
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-crimson border-crimson/50">
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="bg-zinc-900 border-crimson/20">
          <CardHeader>
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-logo-green" />
              CHAT WITH GEAR EXPERT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chat Messages */}
              <div className="h-64 overflow-y-auto space-y-3 p-4 bg-zinc-800 border border-border rounded">
                {chatMessages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ask me anything about gear in the database...
                  </p>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded ${
                        msg.role === 'user' 
                          ? 'bg-crimson/20 ml-8' 
                          : 'bg-logo-green/10 mr-8'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1 font-mono uppercase">
                        {msg.role === 'user' ? 'You' : 'Gear Expert'}
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
                {isChatting && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="What synth is best for acid techno?"
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  className="flex-1 bg-zinc-800 border-border"
                />
                <Button 
                  onClick={handleChat} 
                  disabled={isChatting || !chatInput.trim()}
                  className="bg-logo-green hover:bg-logo-green/80"
                >
                  {isChatting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GearAgentAdmin;
