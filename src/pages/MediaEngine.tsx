import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap, Play, Pause, RefreshCw, Image, CheckCircle, Sparkles, AlertTriangle,
  Database, Clock, TrendingUp, Settings, Loader2, Search, Wand2
} from "lucide-react";
import { toast } from "sonner";

interface EngineStatus {
  totalAssets: number;
  selectedAssets: number;
  enrichedAssets: number;
  queuedJobs: number;
  runningJobs: number;
  failedJobs: number;
  engineReady: boolean;
}

interface PipelineResult {
  success: boolean;
  stats: {
    processed: number;
    fetched: number;
    verified: number;
    enriched: number;
    failed: number;
  };
  remaining?: number;
  message?: string;
}

const MediaEngine = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [status, setStatus] = useState<EngineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  
  // Settings
  const [batchSize, setBatchSize] = useState(5);
  const [autoVerify, setAutoVerify] = useState(true);
  const [autoEnrich, setAutoEnrich] = useState(true);
  
  // Single entity processing
  const [singleEntityType, setSingleEntityType] = useState("artist");
  const [singleEntityId, setSingleEntityId] = useState("");
  const [singleEntityName, setSingleEntityName] = useState("");
  const [processingSingle, setProcessingSingle] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("media-engine", {
        body: { action: "status" },
      });
      if (error) throw error;
      setStatus(data.status);
    } catch (e) {
      console.error("Status fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const runPipeline = async () => {
    setRunning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("media-engine", {
        body: { action: "run-pipeline", batchSize },
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      setResult(data);
      toast.success(`Processed ${data.stats.processed} entities`);
      fetchStatus();
    } catch (e: any) {
      console.error("Pipeline error:", e);
      toast.error(e.message || "Pipeline failed");
    } finally {
      setRunning(false);
    }
  };

  const runVerifyBatch = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("media-engine", {
        body: { action: "verify-batch", batchSize },
      });
      if (error) throw error;
      toast.success(`Verified ${data.stats.verified} entities`);
      fetchStatus();
    } catch (e) {
      toast.error("Verification failed");
    } finally {
      setRunning(false);
    }
  };

  const runEnrichBatch = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("media-engine", {
        body: { action: "enrich-batch", batchSize },
      });
      if (error) throw error;
      toast.success(`Enriched ${data.stats.enriched} assets`);
      fetchStatus();
    } catch (e) {
      toast.error("Enrichment failed");
    } finally {
      setRunning(false);
    }
  };

  const processSingleEntity = async () => {
    if (!singleEntityId || !singleEntityName) {
      toast.error("Please fill in entity ID and name");
      return;
    }
    setProcessingSingle(true);
    try {
      const { data, error } = await supabase.functions.invoke("media-engine", {
        body: {
          action: "process-single",
          entityType: singleEntityType,
          entityId: singleEntityId,
          entityName: singleEntityName,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast.success(`Pipeline complete for ${singleEntityName}`);
      setResult(data);
      setSingleEntityId("");
      setSingleEntityName("");
      fetchStatus();
    } catch (e: any) {
      toast.error(e.message || "Processing failed");
    } finally {
      setProcessingSingle(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    );
  }

  const enrichmentRate = status ? Math.round((status.enrichedAssets / Math.max(status.selectedAssets, 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-mono font-bold flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500" />
              Media Engine
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Auto Fetch → Verify → Curate → Enrich Pipeline
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={status?.engineReady ? "default" : "destructive"} className="gap-1">
              {status?.engineReady ? (
                <><CheckCircle className="w-3 h-3" /> AI Ready</>
              ) : (
                <><AlertTriangle className="w-3 h-3" /> AI Not Configured</>
              )}
            </Badge>
            <Button variant="outline" onClick={fetchStatus} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        {status && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Image className="w-3 h-3" />Total Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.totalAssets}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />Selected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{status.selectedAssets}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />Enriched
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">{status.enrichedAssets}</div>
                <div className="text-xs text-muted-foreground">{enrichmentRate}% of selected</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-500" />Queued
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{status.queuedJobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-blue-500" />Running
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{status.runningJobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{status.failedJobs}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pipeline"><Zap className="w-4 h-4 mr-2" />Full Pipeline</TabsTrigger>
            <TabsTrigger value="single"><Search className="w-4 h-4 mr-2" />Single Entity</TabsTrigger>
            <TabsTrigger value="batch"><Database className="w-4 h-4 mr-2" />Batch Operations</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Full Pipeline Tab */}
          <TabsContent value="pipeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Automated Pipeline
                </CardTitle>
                <CardDescription>
                  Run the complete pipeline: Find entities missing images → Fetch from providers → 
                  AI Verify → Select best → AI Enrich metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pipeline Visualization */}
                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Search className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium">Find Missing</span>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Image className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-sm font-medium">Fetch</span>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="text-sm font-medium">Verify</span>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                    </div>
                    <span className="text-sm font-medium">Enrich</span>
                  </div>
                </div>

                {/* Batch Size Control */}
                <div className="space-y-2">
                  <Label>Batch Size: {batchSize} entities</Label>
                  <Slider
                    value={[batchSize]}
                    onValueChange={([v]) => setBatchSize(v)}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher batch sizes process more entities but take longer
                  </p>
                </div>

                {/* Run Button */}
                <Button
                  size="lg"
                  onClick={runPipeline}
                  disabled={running}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {running ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Running Pipeline...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Run Full Pipeline
                    </>
                  )}
                </Button>

                {/* Results */}
                {result && (
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-5 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{result.stats.processed}</div>
                          <div className="text-xs text-muted-foreground">Processed</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-500">{result.stats.fetched}</div>
                          <div className="text-xs text-muted-foreground">Fetched</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-500">{result.stats.verified}</div>
                          <div className="text-xs text-muted-foreground">Verified</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-500">{result.stats.enriched}</div>
                          <div className="text-xs text-muted-foreground">Enriched</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-500">{result.stats.failed}</div>
                          <div className="text-xs text-muted-foreground">Failed</div>
                        </div>
                      </div>
                      {result.remaining !== undefined && result.remaining > 0 && (
                        <p className="text-sm text-center mt-4 text-muted-foreground">
                          {result.remaining} entities remaining. Run again to process more.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Single Entity Tab */}
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-500" />
                  Process Single Entity
                </CardTitle>
                <CardDescription>
                  Run the full pipeline for a specific artist, venue, or festival
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Entity Type</Label>
                    <Select value={singleEntityType} onValueChange={setSingleEntityType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="artist">Artist</SelectItem>
                        <SelectItem value="venue">Venue</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Entity ID</Label>
                    <Input
                      value={singleEntityId}
                      onChange={(e) => setSingleEntityId(e.target.value)}
                      placeholder="e.g., surgeon"
                    />
                  </div>
                  <div>
                    <Label>Entity Name</Label>
                    <Input
                      value={singleEntityName}
                      onChange={(e) => setSingleEntityName(e.target.value)}
                      placeholder="e.g., Surgeon"
                    />
                  </div>
                </div>
                <Button
                  onClick={processSingleEntity}
                  disabled={processingSingle}
                  className="w-full"
                >
                  {processingSingle ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Process Entity
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Operations Tab */}
          <TabsContent value="batch">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                    Batch Verify
                  </CardTitle>
                  <CardDescription>
                    Run AI verification on unverified assets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={runVerifyBatch} disabled={running} className="w-full">
                    {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Verify Batch ({batchSize})
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Batch Enrich
                  </CardTitle>
                  <CardDescription>
                    Add AI-generated metadata to selected assets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={runEnrichBatch} disabled={running} className="w-full">
                    {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Enrich Batch ({batchSize})
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Settings</CardTitle>
                <CardDescription>Configure the media engine behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Verify</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically verify images after fetching
                    </p>
                  </div>
                  <Switch checked={autoVerify} onCheckedChange={setAutoVerify} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Enrich</Label>
                    <p className="text-xs text-muted-foreground">
                      Generate AI metadata for new assets
                    </p>
                  </div>
                  <Switch checked={autoEnrich} onCheckedChange={setAutoEnrich} />
                </div>
                <div className="space-y-2">
                  <Label>Default Batch Size</Label>
                  <Slider
                    value={[batchSize]}
                    onValueChange={([v]) => setBatchSize(v)}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">Current: {batchSize} entities per run</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MediaEngine;
