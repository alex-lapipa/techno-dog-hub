import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Database, 
  Zap, 
  Globe, 
  Search, 
  Loader2 
} from 'lucide-react';

interface GearItem {
  id: string;
  name: string;
  brand: string;
  category?: string;
  short_description?: string;
}

interface ScrapeResult {
  name?: string;
  gearName?: string;
  success: boolean;
  artistsFound?: number;
}

interface GearItemsPanelProps {
  needsContent: GearItem[];
  recentItems: GearItem[];
  isEnriching: boolean;
  isScraping: boolean;
  selectedGear: string | null;
  firecrawlEnabled: boolean;
  scrapeResults: ScrapeResult[];
  onEnrichSingle: (gearId: string) => void;
  onBatchEnrich: () => void;
  onScrapeSingle: (gearId: string) => void;
  onBatchScrape: () => void;
}

export const GearItemsPanel = ({
  needsContent,
  recentItems,
  isEnriching,
  isScraping,
  selectedGear,
  firecrawlEnabled,
  scrapeResults,
  onEnrichSingle,
  onBatchEnrich,
  onScrapeSingle,
  onBatchScrape
}: GearItemsPanelProps) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Content Panel */}
        <Card className="bg-zinc-900 border-crimson/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              NEEDS CONTENT
            </CardTitle>
            <Button 
              onClick={onBatchEnrich} 
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
                      onClick={() => onEnrichSingle(gear.id)}
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
            onClick={onBatchScrape} 
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
                  onClick={() => onScrapeSingle(gear.id)}
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
    </>
  );
};

export default GearItemsPanel;
