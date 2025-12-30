import { Button } from '@/components/ui/button';
import { Bot, RefreshCw } from 'lucide-react';
import { 
  AdminPageLayout,
  GearStatsGrid,
  GearPipelineControl,
  GearGapAnalysis,
  GearChatInterface,
  GearItemsPanel,
} from '@/components/admin';
import { useGearAgent } from '@/hooks/useGearAgent';

const GearAgentAdmin = () => {
  const {
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
  } = useGearAgent();

  return (
    <AdminPageLayout
      title="GEAR EXPERT AGENT"
      description="AI-powered gear database management"
      icon={Bot}
      iconColor="text-logo-green"
      onRefresh={fetchStatus}
      isLoading={isLoading}
      actions={
        <Button onClick={fetchStatus} variant="outline" size="sm" className="font-mono text-xs">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      }
    >
      {/* Stats Grid */}
      <GearStatsGrid stats={stats} />

      {/* Master Pipeline Control */}
      <GearPipelineControl
        isPipelineRunning={isPipelineRunning}
        firecrawlEnabled={firecrawlEnabled}
        pipelineProgress={pipelineProgress}
        pipelineSteps={pipelineSteps}
        totalItemsToProcess={totalItemsToProcess}
        itemsProcessed={itemsProcessed}
        gapSummary={gapSummary}
        onRunPipeline={runFullPipeline}
        onAbortPipeline={abortPipeline}
      />

      {/* Gap Analysis */}
      <GearGapAnalysis
        isAnalyzing={isAnalyzing}
        isFillingGaps={isFillingGaps}
        firecrawlEnabled={firecrawlEnabled}
        gapSummary={gapSummary}
        fillGapsResults={fillGapsResults}
        onAnalyze={handleGapAnalysis}
        onFillGaps={handleFillGaps}
      />

      {/* Items Panels & Scraper */}
      <GearItemsPanel
        needsContent={needsContent}
        recentItems={recentItems}
        isEnriching={isEnriching}
        isScraping={isScraping}
        selectedGear={selectedGear}
        firecrawlEnabled={firecrawlEnabled}
        scrapeResults={scrapeResults}
        onEnrichSingle={handleEnrichSingle}
        onBatchEnrich={handleBatchEnrich}
        onScrapeSingle={handleScrapeSingle}
        onBatchScrape={handleBatchScrape}
      />

      {/* Chat Interface */}
      <GearChatInterface
        chatMessages={chatMessages}
        chatInput={chatInput}
        isChatting={isChatting}
        onInputChange={setChatInput}
        onSendMessage={handleChat}
      />
    </AdminPageLayout>
  );
};

export default GearAgentAdmin;
