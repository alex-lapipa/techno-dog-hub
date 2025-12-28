import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Brain, RefreshCw, CheckCircle, XCircle, AlertTriangle, Lightbulb,
  Shield, Zap, Settings, Database, FileText, Users, Image, Newspaper,
  ArrowRight, Clock, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface AuditAnalysis {
  missingTools?: Array<{
    name: string;
    purpose: string;
    priority: string;
    complexity: string;
    features?: string[];
  }>;
  functionalityGaps?: Record<string, {
    working?: string[];
    missing?: string[];
    improvements?: string[];
  }>;
  endToEndVerification?: Record<string, {
    status: string;
    issues?: string[];
    complete?: boolean;
  }>;
  securityRecommendations?: string[];
  automationOpportunities?: string[];
  rawAnalysis?: string;
}

interface AuditResult {
  success: boolean;
  stats: Record<string, any>;
  analysis: AuditAnalysis;
  timestamp: string;
}

const AdminAudit = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const runAudit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-audit", {
        body: { action: "analyze" },
      });

      if (error) throw error;
      
      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please wait and try again.");
        } else if (data.error.includes("credits")) {
          toast.error("AI credits exhausted. Please add funds to continue.");
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setResult(data);
      toast.success("AI audit complete");
    } catch (error) {
      console.error("Audit error:", error);
      toast.error("Failed to run audit");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-audit", {
        body: { action: "get-stats" },
      });
      if (error) throw error;
      setResult({ success: true, stats: data.stats, analysis: {}, timestamp: new Date().toISOString() });
      toast.success("Stats loaded");
    } catch (error) {
      toast.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
      critical: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    };
    return <Badge variant={variants[priority.toLowerCase()] || "outline"}>{priority}</Badge>;
  };

  const getComplexityBadge = (complexity: string) => {
    const colors: Record<string, string> = {
      simple: "text-green-500",
      moderate: "text-yellow-500",
      complex: "text-red-500",
    };
    return <Badge variant="outline" className={colors[complexity.toLowerCase()]}>{complexity}</Badge>;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-mono font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-crimson" />
              Admin Audit (AI-Powered)
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI analysis of admin tools, functionality gaps, and recommendations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchStats} disabled={loading}>
              <Database className="w-4 h-4 mr-2" />
              Load Stats Only
            </Button>
            <Button onClick={runAudit} disabled={loading} className="bg-crimson hover:bg-crimson/90">
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Run AI Audit
            </Button>
          </div>
        </div>

        {/* Current Stats Dashboard */}
        {result?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Image className="w-3 h-3" />Media Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.stats.mediaAssets?.total || 0}</div>
                <div className="text-xs text-muted-foreground">
                  {result.stats.mediaAssets?.selected || 0} selected
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />Pipeline Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.stats.pipelineJobs?.total || 0}</div>
                <div className="text-xs text-muted-foreground">
                  {result.stats.pipelineJobs?.queued || 0} queued
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <FileText className="w-3 h-3" />Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.stats.submissions?.total || 0}</div>
                <div className="text-xs text-muted-foreground">
                  {result.stats.submissions?.pending || 0} pending
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Newspaper className="w-3 h-3" />Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.stats.articles?.total || 0}</div>
                <div className="text-xs text-muted-foreground">
                  {result.stats.articles?.published || 0} published
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />DJ Artists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.stats.djArtists || 0}</div>
                <div className="text-xs text-muted-foreground">in database</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.stats.communityProfiles?.total || 0}</div>
                <div className="text-xs text-muted-foreground">
                  {result.stats.communityProfiles?.verified || 0} verified
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Analysis Results */}
        {result?.analysis && Object.keys(result.analysis).length > 0 && (
          <Tabs defaultValue="missing" className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="missing" className="text-xs">
                <Lightbulb className="w-3 h-3 mr-1" />Missing Tools
              </TabsTrigger>
              <TabsTrigger value="gaps" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />Gaps
              </TabsTrigger>
              <TabsTrigger value="e2e" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />E2E Check
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />Security
              </TabsTrigger>
              <TabsTrigger value="automation" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />Automation
              </TabsTrigger>
            </TabsList>

            {/* Missing Tools */}
            <TabsContent value="missing">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Admin Tools to Add</CardTitle>
                  <CardDescription>AI-identified gaps in admin functionality</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.analysis.missingTools ? (
                    <div className="space-y-4">
                      {result.analysis.missingTools.map((tool, i) => (
                        <div key={i} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{tool.name}</h4>
                            <div className="flex gap-2">
                              {getPriorityBadge(tool.priority)}
                              {getComplexityBadge(tool.complexity)}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{tool.purpose}</p>
                          {tool.features && (
                            <div className="flex flex-wrap gap-1">
                              {tool.features.map((f, j) => (
                                <Badge key={j} variant="outline" className="text-xs">{f}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : result.analysis.rawAnalysis ? (
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg overflow-auto max-h-[600px]">
                      {result.analysis.rawAnalysis}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">No suggestions available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Functionality Gaps */}
            <TabsContent value="gaps">
              <Card>
                <CardHeader>
                  <CardTitle>Existing Tool Analysis</CardTitle>
                  <CardDescription>What's working and what needs improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.analysis.functionalityGaps ? (
                    <Accordion type="multiple" className="w-full">
                      {Object.entries(result.analysis.functionalityGaps).map(([tool, gaps]) => (
                        <AccordionItem key={tool} value={tool}>
                          <AccordionTrigger className="text-sm font-medium">{tool}</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3">
                              {gaps.working && gaps.working.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-green-500 mb-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Working Well
                                  </h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {gaps.working.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {gaps.missing && gaps.missing.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-red-500 mb-1 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Missing
                                  </h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {gaps.missing.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {gaps.improvements && gaps.improvements.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-yellow-500 mb-1 flex items-center gap-1">
                                    <Lightbulb className="w-3 h-3" /> Improvements
                                  </h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {gaps.improvements.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-muted-foreground">Run audit to see gap analysis</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* End-to-End Verification */}
            <TabsContent value="e2e">
              <Card>
                <CardHeader>
                  <CardTitle>End-to-End Flow Verification</CardTitle>
                  <CardDescription>Checking if critical workflows are complete</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.analysis.endToEndVerification ? (
                    <div className="space-y-4">
                      {Object.entries(result.analysis.endToEndVerification).map(([flow, status]) => (
                        <div key={flow} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{flow.replace(/_/g, " ")}</h4>
                            {status.complete ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />Complete
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />Incomplete
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{status.status}</p>
                          {status.issues && status.issues.length > 0 && (
                            <div className="mt-2">
                              <h5 className="text-xs font-medium text-red-400 mb-1">Issues:</h5>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {status.issues.map((issue, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <XCircle className="w-3 h-3 mt-1 text-red-400 flex-shrink-0" />
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Run audit to see E2E verification</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Security Recommendations
                  </CardTitle>
                  <CardDescription>Identified security concerns and fixes</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.analysis.securityRecommendations && result.analysis.securityRecommendations.length > 0 ? (
                    <ul className="space-y-3">
                      {result.analysis.securityRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No security issues identified (or run audit first)</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation */}
            <TabsContent value="automation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Automation Opportunities
                  </CardTitle>
                  <CardDescription>Tasks that could be automated to save time</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.analysis.automationOpportunities && result.analysis.automationOpportunities.length > 0 ? (
                    <ul className="space-y-3">
                      {result.analysis.automationOpportunities.map((opp, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Run audit to see automation opportunities</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Initial State */}
        {!result && !loading && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready for AI Audit</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Click "Run AI Audit" to have AI analyze your admin tools, identify gaps, 
                verify end-to-end functionality, and suggest improvements.
              </p>
              <Button onClick={runAudit} className="bg-crimson hover:bg-crimson/90">
                <Brain className="w-4 h-4 mr-2" />
                Run AI Audit Now
              </Button>
            </CardContent>
          </Card>
        )}

        {result?.timestamp && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Last audit: {new Date(result.timestamp).toLocaleString()}
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminAudit;
