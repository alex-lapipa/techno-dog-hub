import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Play, 
  Square, 
  CheckCircle, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  itemsProcessed?: number;
}

export interface GapSummary {
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

interface GearPipelineControlProps {
  isPipelineRunning: boolean;
  firecrawlEnabled: boolean;
  pipelineProgress: number;
  pipelineSteps: PipelineStep[];
  totalItemsToProcess: number;
  itemsProcessed: number;
  gapSummary: GapSummary | null;
  onRunPipeline: () => void;
  onAbortPipeline: () => void;
}

export const GearPipelineControl = ({
  isPipelineRunning,
  firecrawlEnabled,
  pipelineProgress,
  pipelineSteps,
  totalItemsToProcess,
  itemsProcessed,
  gapSummary,
  onRunPipeline,
  onAbortPipeline
}: GearPipelineControlProps) => {
  return (
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
              onClick={onRunPipeline}
              disabled={!firecrawlEnabled}
              size="lg"
              className="bg-logo-green hover:bg-logo-green/80 text-black font-bold px-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Run Full Pipeline
            </Button>
          ) : (
            <Button 
              onClick={onAbortPipeline}
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
  );
};

export default GearPipelineControl;
