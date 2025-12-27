import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Brain,
  Cpu,
  Zap,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Bot,
  Shield,
  Activity,
  Bell,
  History,
  Eye,
  Settings,
  ChevronRight,
} from "lucide-react";

interface PipelineStep {
  step: string;
  agent: "claude" | "gpt";
  status: "pending" | "running" | "completed" | "failed";
  result?: any;
  error?: string;
}

interface OrchestrationStatus {
  claudeConfigured: boolean;
  gptConfigured: boolean;
  recentPipelineRuns: number;
  systemStats: any;
}

const REVIEW_TARGETS = [
  { id: "admin-tools", name: "Admin Tools Suite", description: "Review all admin management tools" },
  { id: "media-engine", name: "Media Engine", description: "Image pipeline and AI generation" },
  { id: "user-management", name: "User Management", description: "Role and access control systems" },
  { id: "news-agent", name: "News Agent", description: "AI news generation system" },
  { id: "content-sync", name: "Content Sync", description: "Data synchronization systems" },
  { id: "api-security", name: "API Security", description: "API keys and authentication" },
  { id: "database-schema", name: "Database Schema", description: "Tables, RLS policies, functions" },
  { id: "frontend-ux", name: "Frontend UX", description: "User interface and experience" },
];

const AdminControlCenter = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  // State
  const [status, setStatus] = useState<OrchestrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState("admin-tools");
  const [additionalContext, setAdditionalContext] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [implementResult, setImplementResult] = useState<any>(null);
  const [validateResult, setValidateResult] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStatus();
    }
  }, [isAdmin]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-orchestration", {
        body: { action: "status" },
      });
      if (error) throw error;
      setStatus(data.status);
      setRecentEvents(data.recentEvents || []);
    } catch (e) {
      console.error("Status fetch error:", e);
      toast.error("Failed to fetch orchestration status");
    } finally {
      setLoading(false);
    }
  };

  const runFullPipeline = async () => {
    setRunning(true);
    setCurrentStep("Starting pipeline...");
    setPipelineSteps([
      { step: "review", agent: "claude", status: "pending" },
      { step: "implement", agent: "gpt", status: "pending" },
      { step: "validate", agent: "claude", status: "pending" },
    ]);
    setReviewResult(null);
    setImplementResult(null);
    setValidateResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-orchestration", {
        body: {
          action: "full-pipeline",
          target: selectedTarget,
          context: additionalContext,
          dryRun,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error("Pipeline failed");

      setPipelineSteps(data.pipeline.steps);
      
      // Extract results from each step
      const steps = data.pipeline.steps;
      if (steps[0]?.result) setReviewResult(steps[0].result);
      if (steps[1]?.result) setImplementResult(steps[1].result);
      if (steps[2]?.result) setValidateResult(steps[2].result);

      toast.success("AI Pipeline completed successfully");
      fetchStatus();
    } catch (e: any) {
      console.error("Pipeline error:", e);
      toast.error(e.message || "Pipeline failed");
    } finally {
      setRunning(false);
      setCurrentStep(null);
    }
  };

  const runSingleStep = async (step: "review" | "implement" | "validate") => {
    setRunning(true);
    setCurrentStep(`Running ${step}...`);

    try {
      const body: any = {
        action: step,
        target: selectedTarget,
        context: additionalContext,
        dryRun,
      };

      if (step === "implement" && reviewResult) {
        body.previousPlan = JSON.stringify(reviewResult);
      }
      if (step === "validate" && implementResult) {
        body.previousChanges = JSON.stringify(implementResult);
      }

      const { data, error } = await supabase.functions.invoke("ai-orchestration", {
        body,
      });

      if (error) throw error;

      if (step === "review") setReviewResult(data.result);
      if (step === "implement") setImplementResult(data.result);
      if (step === "validate") setValidateResult(data.result);

      toast.success(`${step} completed`);
      fetchStatus();
    } catch (e: any) {
      toast.error(e.message || `${step} failed`);
    } finally {
      setRunning(false);
      setCurrentStep(null);
    }
  };

  if (authLoading || (!isAdmin && !authLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getStepIcon = (step: PipelineStep) => {
    if (step.status === "completed") return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (step.status === "failed") return <XCircle className="w-5 h-5 text-red-500" />;
    if (step.status === "running") return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Admin Control Center"
        description="AI-powered orchestration and monitoring"
        path="/admin/control-center"
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="font-mono text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
                    // AI Orchestration
                  </div>
                  <h1 className="font-mono text-2xl md:text-3xl uppercase tracking-tight flex items-center gap-3">
                    <Brain className="w-7 h-7 text-purple-500" />
                    Admin Control Center
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={status?.claudeConfigured ? "default" : "destructive"} className="gap-1">
                  <Bot className="w-3 h-3" />
                  Claude {status?.claudeConfigured ? "Ready" : "Missing"}
                </Badge>
                <Badge variant={status?.gptConfigured ? "default" : "destructive"} className="gap-1">
                  <Cpu className="w-3 h-3" />
                  GPT {status?.gptConfigured ? "Ready" : "Missing"}
                </Badge>
                <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-purple-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Bot className="w-8 h-8 text-purple-500" />
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">Claude</div>
                      <div className="font-mono text-lg">Architect</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">GPT</div>
                      <div className="font-mono text-lg">Implementer</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">Pipeline Runs</div>
                      <div className="font-mono text-lg">{status?.recentPipelineRuns || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-yellow-500" />
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">Mode</div>
                      <div className="font-mono text-lg">{dryRun ? "Dry Run" : "Live"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="pipeline" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                <TabsTrigger value="pipeline"><Zap className="w-4 h-4 mr-2" />Pipeline</TabsTrigger>
                <TabsTrigger value="results"><Eye className="w-4 h-4 mr-2" />Results</TabsTrigger>
                <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />History</TabsTrigger>
                <TabsTrigger value="monitoring"><Bell className="w-4 h-4 mr-2" />Monitoring</TabsTrigger>
              </TabsList>

              {/* Pipeline Tab */}
              <TabsContent value="pipeline" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Pipeline Configuration
                      </CardTitle>
                      <CardDescription>
                        Select target and configure the AI review pipeline
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Review Target</Label>
                        <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REVIEW_TARGETS.map((target) => (
                              <SelectItem key={target.id} value={target.id}>
                                <div>
                                  <div className="font-medium">{target.name}</div>
                                  <div className="text-xs text-muted-foreground">{target.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Additional Context (Optional)</Label>
                        <Textarea
                          value={additionalContext}
                          onChange={(e) => setAdditionalContext(e.target.value)}
                          placeholder="Add specific concerns, areas to focus on, or requirements..."
                          className="min-h-[100px] font-mono text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <Label>Dry Run Mode</Label>
                          <p className="text-xs text-muted-foreground">
                            {dryRun ? "Changes will be simulated, not applied" : "Changes will be applied for real"}
                          </p>
                        </div>
                        <Switch checked={dryRun} onCheckedChange={setDryRun} />
                      </div>

                      <Button
                        size="lg"
                        onClick={runFullPipeline}
                        disabled={running || !status?.claudeConfigured || !status?.gptConfigured}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {running ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {currentStep || "Running..."}
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Run Full AI Pipeline
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pipeline Visualization */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        AI Pipeline Flow
                      </CardTitle>
                      <CardDescription>
                        Claude reviews → GPT implements → Claude validates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Step 1: Claude Review */}
                      <div className="flex items-center gap-4 p-4 border border-purple-500/30 rounded-lg bg-purple-500/5">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Bot className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-mono text-sm font-medium">Step 1: Claude Review</div>
                          <div className="text-xs text-muted-foreground">
                            Analyzes target, identifies issues, creates improvement plan
                          </div>
                        </div>
                        {pipelineSteps[0] && getStepIcon(pipelineSteps[0])}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSingleStep("review")}
                          disabled={running}
                        >
                          Run
                        </Button>
                      </div>

                      <div className="flex justify-center">
                        <ChevronRight className="w-6 h-6 text-muted-foreground rotate-90" />
                      </div>

                      {/* Step 2: GPT Implement */}
                      <div className="flex items-center gap-4 p-4 border border-green-500/30 rounded-lg bg-green-500/5">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Cpu className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-mono text-sm font-medium">Step 2: GPT Implement</div>
                          <div className="text-xs text-muted-foreground">
                            Executes Claude's plan with targeted, minimal changes
                          </div>
                        </div>
                        {pipelineSteps[1] && getStepIcon(pipelineSteps[1])}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSingleStep("implement")}
                          disabled={running || !reviewResult}
                        >
                          Run
                        </Button>
                      </div>

                      <div className="flex justify-center">
                        <ChevronRight className="w-6 h-6 text-muted-foreground rotate-90" />
                      </div>

                      {/* Step 3: Claude Validate */}
                      <div className="flex items-center gap-4 p-4 border border-blue-500/30 rounded-lg bg-blue-500/5">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-mono text-sm font-medium">Step 3: Claude Validate</div>
                          <div className="text-xs text-muted-foreground">
                            Verifies changes, checks for regressions, confirms safety
                          </div>
                        </div>
                        {pipelineSteps[2] && getStepIcon(pipelineSteps[2])}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSingleStep("validate")}
                          disabled={running || !implementResult}
                        >
                          Run
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Review Result */}
                  <Card className="border-purple-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Bot className="w-4 h-4 text-purple-500" />
                        Claude Review
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        {reviewResult ? (
                          <pre className="font-mono text-xs whitespace-pre-wrap">
                            {JSON.stringify(reviewResult, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-muted-foreground text-sm">No review results yet</p>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Implementation Result */}
                  <Card className="border-green-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Cpu className="w-4 h-4 text-green-500" />
                        GPT Implementation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        {implementResult ? (
                          <pre className="font-mono text-xs whitespace-pre-wrap">
                            {JSON.stringify(implementResult, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-muted-foreground text-sm">No implementation results yet</p>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Validation Result */}
                  <Card className="border-blue-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Claude Validation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        {validateResult ? (
                          <pre className="font-mono text-xs whitespace-pre-wrap">
                            {JSON.stringify(validateResult, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-muted-foreground text-sm">No validation results yet</p>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Recent Pipeline Runs
                    </CardTitle>
                    <CardDescription>
                      History of AI orchestration events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentEvents.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No pipeline runs recorded yet</p>
                    ) : (
                      <div className="space-y-3">
                        {recentEvents.map((event, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                            <Badge variant="outline" className="font-mono text-xs">
                              {(event.metadata as any)?.agent || "unknown"}
                            </Badge>
                            <div className="flex-1">
                              <div className="font-mono text-sm">{(event.metadata as any)?.action || event.event_name}</div>
                              <div className="text-xs text-muted-foreground">
                                Target: {(event.metadata as any)?.target || "unknown"}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Monitoring Tab */}
              <TabsContent value="monitoring">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        System Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Claude API</span>
                          <Badge variant={status?.claudeConfigured ? "default" : "destructive"}>
                            {status?.claudeConfigured ? "Connected" : "Not Connected"}
                          </Badge>
                        </div>
                        <Progress value={status?.claudeConfigured ? 100 : 0} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>GPT API</span>
                          <Badge variant={status?.gptConfigured ? "default" : "destructive"}>
                            {status?.gptConfigured ? "Connected" : "Not Connected"}
                          </Badge>
                        </div>
                        <Progress value={status?.gptConfigured ? 100 : 0} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pipeline Status</span>
                          <Badge variant="outline">Ready</Badge>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-yellow-500" />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 border border-muted rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div>
                            <div className="font-mono text-sm font-medium">Dry Run Mode Enabled</div>
                            <div className="text-xs text-muted-foreground">
                              All pipeline operations will be simulated. Toggle off to apply real changes.
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-muted rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <div className="font-mono text-sm font-medium">Both AI Models Connected</div>
                            <div className="text-xs text-muted-foreground">
                              Claude (Anthropic) and GPT (OpenAI) are ready for orchestration.
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminControlCenter;
