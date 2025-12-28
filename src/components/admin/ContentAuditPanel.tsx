import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Image as ImageIcon,
  Users,
  Building,
  Calendar,
  Disc,
  Tag,
  Loader2,
} from "lucide-react";

// Import data for audit
import { artists } from "@/data/artists";
import { venues } from "@/data/venues";
import { festivals } from "@/data/festivals";
import { gear } from "@/data/gear";
import { labels } from "@/data/labels";

interface AuditResult {
  entityId: string;
  entityType: string;
  gaps: string[];
  missingImages: boolean;
  suggestedUpdates: Record<string, unknown>;
  confidenceScore: number;
  sources: string[];
  validationStatus: 'validated' | 'needs_review' | 'conflicting';
}

interface AnalysisResult {
  entityId: string;
  entityType: string;
  gaps: string[];
  missingImages: boolean;
  priority: 'high' | 'medium' | 'low';
  suggestedSearchQueries: string[];
}

export function ContentAuditPanel() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("all");

  const entityCounts = {
    artists: artists.length,
    venues: venues.length,
    festivals: festivals.length,
    gear: gear.length,
    labels: labels.length,
  };

  const getEntitiesForType = (type: string) => {
    switch (type) {
      case "artists":
        return artists.slice(0, 10).map(a => ({
          type: "artist" as const,
          id: a.id,
          name: a.name,
          currentData: a,
        }));
      case "venues":
        return venues.slice(0, 10).map(v => ({
          type: "venue" as const,
          id: v.id,
          name: v.name,
          currentData: v,
        }));
      case "festivals":
        return festivals.slice(0, 10).map(f => ({
          type: "festival" as const,
          id: f.id,
          name: f.name,
          currentData: f,
        }));
      case "gear":
        return gear.slice(0, 10).map(g => ({
          type: "gear" as const,
          id: g.id,
          name: g.name,
          currentData: g,
        }));
      case "labels":
        return labels.slice(0, 10).map(l => ({
          type: "label" as const,
          id: l.id,
          name: l.name,
          currentData: l,
        }));
      default:
        return [
          ...artists.slice(0, 3).map(a => ({ type: "artist" as const, id: a.id, name: a.name, currentData: a })),
          ...venues.slice(0, 2).map(v => ({ type: "venue" as const, id: v.id, name: v.name, currentData: v })),
          ...gear.slice(0, 2).map(g => ({ type: "gear" as const, id: g.id, name: g.name, currentData: g })),
        ];
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResults([]);

    try {
      const entities = getEntitiesForType(selectedType);
      
      toast.info(`Analyzing ${entities.length} entities...`);
      setProgress(20);

      const { data, error } = await supabase.functions.invoke("content-orchestrator", {
        body: {
          action: "analyze",
          entities,
          entityType: selectedType === "all" ? undefined : selectedType,
        },
      });

      if (error) throw error;

      setProgress(100);
      setAnalysisResults(data.results || []);
      
      toast.success(`Analysis complete: ${data.needsUpdate} entities need updates`);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runFullAudit = async () => {
    if (analysisResults.length === 0) {
      toast.error("Run analysis first to identify entities needing updates");
      return;
    }

    setIsAuditing(true);
    setProgress(0);
    setAuditResults([]);

    try {
      const entitiesToAudit = analysisResults
        .filter(r => r.priority === "high" || r.priority === "medium")
        .slice(0, 5)
        .map(r => {
          const entities = getEntitiesForType(r.entityType + "s");
          const entity = entities.find(e => e.id === r.entityId);
          return {
            ...entity,
            suggestedSearchQueries: r.suggestedSearchQueries,
          };
        })
        .filter(Boolean);

      toast.info(`Running cross-validation audit on ${entitiesToAudit.length} entities...`);
      setProgress(30);

      const { data, error } = await supabase.functions.invoke("content-orchestrator", {
        body: {
          action: "orchestrate",
          entities: entitiesToAudit,
        },
      });

      if (error) throw error;

      setProgress(100);
      setAuditResults(data.results || []);
      
      toast.success(`Audit complete: ${data.processed} entities validated`);
    } catch (error) {
      console.error("Audit error:", error);
      toast.error("Audit failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAuditing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "validated":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "needs_review":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "conflicting":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Search className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "artist":
        return <Users className="w-4 h-4" />;
      case "venue":
        return <Building className="w-4 h-4" />;
      case "festival":
        return <Calendar className="w-4 h-4" />;
      case "gear":
        return <Disc className="w-4 h-4" />;
      case "label":
        return <Tag className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-mono text-lg uppercase tracking-wider flex items-center gap-2">
          <Search className="w-5 h-5" />
          Content Audit & Validation
        </CardTitle>
        <CardDescription className="font-mono text-xs">
          Multi-model cross-validation with Firecrawl web research (Anthropic + OpenAI + Lovable AI)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Entity counts */}
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(entityCounts).map(([type, count]) => (
            <div key={type} className="text-center p-2 border border-border rounded">
              <div className="font-mono text-xs text-muted-foreground uppercase">{type}</div>
              <div className="font-mono text-lg">{count}</div>
            </div>
          ))}
        </div>

        {/* Type filter */}
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid grid-cols-6 bg-muted/30">
            <TabsTrigger value="all" className="font-mono text-xs">All</TabsTrigger>
            <TabsTrigger value="artists" className="font-mono text-xs">Artists</TabsTrigger>
            <TabsTrigger value="venues" className="font-mono text-xs">Venues</TabsTrigger>
            <TabsTrigger value="festivals" className="font-mono text-xs">Festivals</TabsTrigger>
            <TabsTrigger value="gear" className="font-mono text-xs">Gear</TabsTrigger>
            <TabsTrigger value="labels" className="font-mono text-xs">Labels</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || isAuditing}
            variant="outline"
            className="flex-1 font-mono text-xs"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                1. Analyze Gaps
              </>
            )}
          </Button>
          <Button
            onClick={runFullAudit}
            disabled={isAnalyzing || isAuditing || analysisResults.length === 0}
            className="flex-1 font-mono text-xs"
          >
            {isAuditing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Auditing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                2. Cross-Validate
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        {(isAnalyzing || isAuditing) && (
          <Progress value={progress} className="h-2" />
        )}

        {/* Analysis Results */}
        {analysisResults.length > 0 && (
          <div className="space-y-2">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Analysis Results ({analysisResults.length} need updates)
            </div>
            <ScrollArea className="h-48 border border-border rounded p-2">
              <div className="space-y-2">
                {analysisResults.map((result, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-muted/20 rounded text-xs">
                    {getTypeIcon(result.entityType)}
                    <div className="flex-1">
                      <div className="font-mono font-medium">{result.entityId}</div>
                      <div className="text-muted-foreground">
                        Gaps: {result.gaps.slice(0, 3).join(", ")}
                        {result.gaps.length > 3 && ` +${result.gaps.length - 3} more`}
                      </div>
                    </div>
                    <Badge variant={result.priority === "high" ? "destructive" : "secondary"}>
                      {result.priority}
                    </Badge>
                    {result.missingImages && (
                      <ImageIcon className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Audit Results */}
        {auditResults.length > 0 && (
          <div className="space-y-2">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Cross-Validation Results ({auditResults.length} validated)
            </div>
            <ScrollArea className="h-64 border border-border rounded p-2">
              <div className="space-y-3">
                {auditResults.map((result, i) => (
                  <div key={i} className="p-3 bg-muted/20 rounded space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.validationStatus)}
                      {getTypeIcon(result.entityType)}
                      <span className="font-mono font-medium text-sm">{result.entityId}</span>
                      <Badge variant="outline" className="ml-auto">
                        {Math.round(result.confidenceScore * 100)}% confidence
                      </Badge>
                    </div>
                    
                    {result.gaps.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Gaps:</span> {result.gaps.join(", ")}
                      </div>
                    )}

                    {Object.keys(result.suggestedUpdates).length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-green-500">Suggested updates:</span>
                        <pre className="mt-1 p-2 bg-background rounded text-[10px] overflow-x-auto">
                          {JSON.stringify(result.suggestedUpdates, null, 2)}
                        </pre>
                      </div>
                    )}

                    {result.missingImages && (
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <ImageIcon className="w-3 h-3" />
                        Missing images flagged
                      </div>
                    )}

                    {result.sources.length > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        Sources: {result.sources.slice(0, 2).join(", ")}
                        {result.sources.length > 2 && ` +${result.sources.length - 2} more`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
