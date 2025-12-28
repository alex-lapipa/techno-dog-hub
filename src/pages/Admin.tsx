import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, LogOut, Loader2, Play, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import AgentCard from "@/components/admin/AgentCard";
import ToolCard from "@/components/admin/ToolCard";
import AgentReportsList from "@/components/admin/AgentReportsList";
import RealtimeActivityFeed from "@/components/admin/RealtimeActivityFeed";
import ScheduledJobsStatus from "@/components/admin/ScheduledJobsStatus";
import AgentHealthSummary from "@/components/admin/AgentHealthSummary";
import { LeaderboardWidget } from "@/components/gamification";

const AdminLoginForm = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(password);
    if (success) {
      toast({ title: "Access granted", description: "Welcome back." });
    } else {
      toast({ title: "Access denied", description: "Invalid password.", variant: "destructive" });
    }
    setPassword("");
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="relative bg-zinc-800 p-1">
        <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around py-3">
          {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />)}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-3">
          {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />)}
        </div>
        <div className="mx-2 border border-crimson/20 p-8" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 border border-crimson/50 bg-crimson/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-crimson" />
            </div>
          </div>
          <h2 className="font-mono text-xl uppercase tracking-tight text-center mb-2">Control Room</h2>
          <p className="font-mono text-xs text-muted-foreground text-center mb-6">Enter password to continue</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="font-mono text-center tracking-widest" autoFocus />
            <Button type="submit" variant="brutalist" className="w-full font-mono uppercase tracking-wider" disabled={loading || !password}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Enter"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

type AgentRunStatus = 'pending' | 'running' | 'success' | 'error';

interface AgentRunState {
  name: string;
  functionName: string;
  status: AgentRunStatus;
  error?: string;
}

const AdminDashboard = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [agentRunStates, setAgentRunStates] = useState<AgentRunState[]>([]);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);

  const handleLogout = () => {
    logout();
    toast({ title: "Session ended" });
    navigate("/");
  };

  const agents = [
    { name: "API Guardian", category: "Operations", description: "Monitors developer API health, keys, rate limits, and RAG content", status: "idle" as const, frameNumber: "00", functionName: "api-guardian" },
    { name: "Health Monitor", category: "Operations", description: "Checks edge functions, database, and API response times", status: "idle" as const, frameNumber: "01", functionName: "health-monitor" },
    { name: "Security Auditor", category: "Security", description: "Scans for access control issues and suspicious activity", status: "idle" as const, frameNumber: "02", functionName: "security-auditor" },
    { name: "Data Integrity", category: "Operations", description: "Detects orphaned records, duplicates, and missing data", status: "idle" as const, frameNumber: "03", functionName: "data-integrity" },
    { name: "Media Monitor", category: "Content", description: "Tracks media pipeline status and failed jobs", status: "idle" as const, frameNumber: "04", functionName: "media-monitor" },
    { name: "Submissions Triage", category: "Content", description: "Pre-screens community submissions for review", status: "idle" as const, frameNumber: "05", functionName: "submissions-triage" },
    { name: "Analytics Reporter", category: "Growth", description: "Generates weekly usage insights and trends", status: "idle" as const, frameNumber: "06", functionName: "analytics-reporter" },
    { name: "Knowledge Gap", category: "Growth", description: "Identifies missing artists, data, and content gaps", status: "idle" as const, frameNumber: "07", functionName: "knowledge-gap-detector" },
  ];

  const runnableAgents = agents.filter(a => a.functionName);

  const runAllAgents = async () => {
    setIsRunningAll(true);
    
    const initialStates: AgentRunState[] = runnableAgents.map(a => ({
      name: a.name,
      functionName: a.functionName!,
      status: 'pending' as AgentRunStatus
    }));
    setAgentRunStates(initialStates);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < runnableAgents.length; i++) {
      const agent = runnableAgents[i];
      setCurrentAgentIndex(i);
      
      setAgentRunStates(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'running' } : s
      ));
      
      try {
        const { error } = await supabase.functions.invoke(agent.functionName!);
        
        if (error) throw error;
        
        setAgentRunStates(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'success' } : s
        ));
        successCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setAgentRunStates(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'error', error: errorMsg } : s
        ));
        errorCount++;
      }
    }
    
    setCurrentAgentIndex(-1);
    setIsRunningAll(false);
    
    toast({
      title: "All agents completed",
      description: `${successCount} succeeded, ${errorCount} failed`,
      variant: errorCount > 0 ? "destructive" : "default"
    });
  };

  const completedCount = agentRunStates.filter(s => s.status === 'success' || s.status === 'error').length;
  const progressPercent = agentRunStates.length > 0 ? (completedCount / agentRunStates.length) * 100 : 0;

  const tools = [
    { name: "System Status", description: "Real-time status of all services", path: "/admin/health", frameNumber: "T1" },
    { name: "User Management", description: "Manage users and permissions", path: "/admin/users", frameNumber: "T2" },
    { name: "Media Engine", description: "Photo acquisition pipeline", path: "/admin/media-engine", frameNumber: "T3" },
    { name: "Content Moderation", description: "Review community submissions", path: "/admin/moderation", frameNumber: "T4" },
    { name: "Submissions", description: "Full submission management", path: "/admin/submissions", frameNumber: "T5" },
    { name: "Artist Database", description: "Manage artist records", path: "/admin/dj-artists", frameNumber: "T6" },
    { name: "News Management", description: "Article generation and editing", path: "/admin/news-agent", frameNumber: "T7" },
    { name: "Analytics", description: "Site usage metrics", path: "/analytics", frameNumber: "T8" },
    { name: "Activity Log", description: "Admin action history", path: "/admin/activity-log", frameNumber: "T9" },
    { name: "Image Gallery", description: "Generated image management", path: "/admin/images", frameNumber: "T10" },
    { name: "API Docs", description: "Admin API documentation", path: "/api-docs", frameNumber: "T11" },
    { name: "Badge Admin", description: "Manage gamification badges", path: "/admin/badges", frameNumber: "T12" },
    { name: "XP Events", description: "Manage XP multiplier events", path: "/admin/xp-events", frameNumber: "T13" },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] text-crimson uppercase tracking-[0.3em] mb-2">// techno.dog</div>
          <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-tight">Control Room</h1>
        </div>
        <Button variant="outline" onClick={handleLogout} className="font-mono text-xs uppercase tracking-wider">
          <LogOut className="w-4 h-4 mr-2" />End Session
        </Button>
      </div>

      {/* Agents Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="px-2 py-1 bg-crimson/20 border border-crimson/50">
            <span className="font-mono text-[10px] text-crimson uppercase tracking-widest">Automated Agents</span>
          </div>
          <div className="flex-1 h-px bg-crimson/20" />
          <Button
            variant="brutalist"
            size="sm"
            onClick={runAllAgents}
            disabled={isRunningAll}
            className="font-mono text-xs uppercase tracking-wider"
          >
            {isRunningAll ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-2" />
                Run All
              </>
            )}
          </Button>
        </div>
        
        {/* Progress Panel */}
        {agentRunStates.length > 0 && (
          <div className="mb-6 p-4 bg-zinc-900/50 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Progress: {completedCount}/{agentRunStates.length}
              </span>
              {!isRunningAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAgentRunStates([])}
                  className="font-mono text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
            <Progress value={progressPercent} className="h-2 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {agentRunStates.map((state, idx) => (
                <div
                  key={state.name}
                  className={`p-2 border text-center ${
                    state.status === 'running' ? 'border-amber-500/50 bg-amber-500/10' :
                    state.status === 'success' ? 'border-logo-green/50 bg-logo-green/10' :
                    state.status === 'error' ? 'border-crimson/50 bg-crimson/10' :
                    'border-border bg-background/50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {state.status === 'running' && <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />}
                    {state.status === 'success' && <CheckCircle2 className="w-3 h-3 text-logo-green" />}
                    {state.status === 'error' && <XCircle className="w-3 h-3 text-crimson" />}
                    {state.status === 'pending' && <AlertCircle className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground truncate" title={state.name}>
                    {state.name.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.name} {...agent} />
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="px-2 py-1 bg-logo-green/20 border border-logo-green/50">
            <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">Manual Tools</span>
          </div>
          <div className="flex-1 h-px bg-logo-green/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.path} {...tool} />
          ))}
        </div>
      </section>

      {/* Status Panels */}
      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
        <AgentHealthSummary />
        <AgentReportsList />
        <RealtimeActivityFeed />
        <ScheduledJobsStatus />
        <LeaderboardWidget limit={8} />
      </section>
    </div>
  );
};

const Admin = () => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO title="Control Room" description="techno.dog administration" path="/admin" />
      <Header />
      <main className="pt-24 lg:pt-16">
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            {isAdmin ? <AdminDashboard /> : <AdminLoginForm />}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;