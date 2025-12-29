import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Zap, Loader2 } from 'lucide-react';
import { GapSummary } from './GearPipelineControl';

interface FillGapsResult {
  id: string;
  name: string;
  gapScore?: number;
  scraped?: boolean;
  fieldsUpdated?: string[];
  success: boolean;
  error?: string;
}

interface GearGapAnalysisProps {
  isAnalyzing: boolean;
  isFillingGaps: boolean;
  firecrawlEnabled: boolean;
  gapSummary: GapSummary | null;
  fillGapsResults: FillGapsResult[];
  onAnalyze: () => void;
  onFillGaps: (batchSize: number) => void;
}

export const GearGapAnalysis = ({
  isAnalyzing,
  isFillingGaps,
  firecrawlEnabled,
  gapSummary,
  fillGapsResults,
  onAnalyze,
  onFillGaps
}: GearGapAnalysisProps) => {
  return (
    <Card className="bg-zinc-900 border-amber-500/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-mono text-sm flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-500" />
          DATABASE GAP ANALYSIS
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={onAnalyze} 
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
            onClick={() => onFillGaps(5)} 
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
            onClick={() => onFillGaps(10)} 
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
  );
};

export default GearGapAnalysis;
