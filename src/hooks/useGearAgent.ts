import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { PipelineStep, GapSummary } from '@/components/admin';

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

interface FillGapsResult {
  id: string;
  name: string;
  gapScore?: number;
  scraped?: boolean;
  fieldsUpdated?: string[];
  success: boolean;
  error?: string;
}

export const useGearAgent = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  // Core data state
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [recentItems, setRecentItems] = useState<GearItem[]>([]);
  const [needsContent, setNeedsContent] = useState<GearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firecrawlEnabled, setFirecrawlEnabled] = useState(false);
  
  // Operation states
  const [isEnriching, setIsEnriching] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFillingGaps, setIsFillingGaps] = useState(false);
  const [selectedGear, setSelectedGear] = useState<string | null>(null);
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Scrape and gap results
  const [scrapeResults, setScrapeResults] = useState<any[]>([]);
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
      toast({ title: 'Enrichment failed', variant: 'destructive' });
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
      toast({ title: 'Batch enrichment failed', variant: 'destructive' });
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
      toast({ title: 'Scrape failed', variant: 'destructive' });
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
      toast({ title: 'Batch scrape failed', variant: 'destructive' });
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
      toast({ title: 'Gap analysis failed', variant: 'destructive' });
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

      fetchStatus();
      handleGapAnalysis();
    } catch (err) {
      console.error('Fill gaps failed:', err);
      toast({ title: 'Fill gaps failed', variant: 'destructive' });
    } finally {
      setIsFillingGaps(false);
    }
  };

  const updatePipelineStep = (stepId: string, status: PipelineStep['status'], message: string) => {
    setPipelineSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

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

        const fillProgress = Math.min((processed / totalGaps) * 60, 60);
        setPipelineProgress(20 + fillProgress);
        updatePipelineStep('fill', 'running', `Processed ${processed}/${totalGaps} items...`);

        if (batchResults.length < batchSize) break;

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
      
      await fetchStatus();
      
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
      
      setPipelineSteps(prev => prev.map(step => 
        step.status === 'running' ? { ...step, status: 'error', message: 'Failed' } : step
      ));
    } finally {
      setIsPipelineRunning(false);
    }
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

  return {
    // Core data
    stats,
    recentItems,
    needsContent,
    isLoading,
    firecrawlEnabled,
    
    // Operation states
    isEnriching,
    isScraping,
    isChatting,
    isAnalyzing,
    isFillingGaps,
    selectedGear,
    
    // Chat
    chatInput,
    setChatInput,
    chatMessages,
    
    // Results
    scrapeResults,
    gapSummary,
    fillGapsResults,
    
    // Pipeline
    isPipelineRunning,
    pipelineSteps,
    pipelineProgress,
    totalItemsToProcess,
    itemsProcessed,
    
    // Actions
    fetchStatus,
    handleEnrichSingle,
    handleBatchEnrich,
    handleScrapeSingle,
    handleBatchScrape,
    handleGapAnalysis,
    handleFillGaps,
    runFullPipeline,
    abortPipeline,
    handleChat,
  };
};

export default useGearAgent;
