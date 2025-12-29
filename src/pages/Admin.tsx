import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, LogOut, Loader2, Play, CheckCircle2, XCircle, AlertCircle, Mail, ShieldAlert } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import AgentCard from "@/components/admin/AgentCard";
import ToolCard from "@/components/admin/ToolCard";
import AgentReportsList from "@/components/admin/AgentReportsList";
import RealtimeActivityFeed from "@/components/admin/RealtimeActivityFeed";
import ScheduledJobsStatus from "@/components/admin/ScheduledJobsStatus";
import AgentHealthSummary from "@/components/admin/AgentHealthSummary";
import AdminAIAssistant from "@/components/admin/AdminAIAssistant";
import { LeaderboardWidget } from "@/components/gamification";

const AdminLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({ 
        title: "Access denied", 
        description: error.message || "Invalid credentials.", 
        variant: "destructive" 
      });
    } else {
      toast({ title: "Signed in", description: "Checking admin access..." });
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
          <p className="font-mono text-xs text-muted-foreground text-center mb-6">Sign in with admin credentials</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              className="font-mono" 
              autoComplete="email"
            />
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              className="font-mono" 
              autoComplete="current-password"
            />
            <Button type="submit" variant="brutalist" className="w-full font-mono uppercase tracking-wider" disabled={loading || !email || !password}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

const AccessDenied = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out" });
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="relative bg-zinc-800 p-1">
        <div className="mx-2 border border-crimson/20 p-8" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 border border-crimson/50 bg-crimson/10 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-crimson" />
            </div>
          </div>
          <h2 className="font-mono text-xl uppercase tracking-tight mb-2">Access Denied</h2>
          <p className="font-mono text-xs text-muted-foreground mb-6">
            Your account does not have admin privileges.
          </p>
          <Button onClick={handleSignOut} variant="outline" className="font-mono text-xs uppercase tracking-wider">
            Sign Out
          </Button>
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
  const { logout, userEmail } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [agentRunStates, setAgentRunStates] = useState<AgentRunState[]>([]);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [sendingDigest, setSendingDigest] = useState(false);

  const handleLogout = () => {
    logout();
    toast({ title: "Session ended" });
    navigate("/");
  };

  const agents = [
    { name: "API", category: "Operations", description: "Keys, rate limits, and usage", status: "idle" as const, frameNumber: "00", functionName: "api-guardian", path: "/admin/api-guardian" },
    { name: "Health", category: "Operations", description: "System status and response times", status: "idle" as const, frameNumber: "01", functionName: "health-monitor", path: "/admin/health-monitor" },
    { name: "Security", category: "Security", description: "Access control and activity", status: "idle" as const, frameNumber: "02", functionName: "security-auditor", path: "/admin/security-auditor" },
    { name: "Data Integrity", category: "Operations", description: "Orphaned records and duplicates", status: "idle" as const, frameNumber: "03", functionName: "data-integrity", path: "/admin/data-integrity" },
    { name: "Media", category: "Content", description: "Pipeline status and jobs", status: "idle" as const, frameNumber: "04", functionName: "media-monitor", path: "/admin/media-monitor" },
    { name: "Submissions", category: "Content", description: "Pre-screen community submissions", status: "idle" as const, frameNumber: "05", functionName: "submissions-triage", path: "/admin/submissions-triage" },
    { name: "Analytics", category: "Growth", description: "Usage insights and trends", status: "idle" as const, frameNumber: "06", functionName: "analytics-reporter", path: "/admin/analytics-reporter" },
    { name: "Knowledge", category: "Growth", description: "Missing artists and content gaps", status: "idle" as const, frameNumber: "07", functionName: "knowledge-gap-detector", path: "/admin/knowledge-gap" },
    { name: "Gear", category: "Content", description: "Equipment database management", status: "idle" as const, frameNumber: "08", functionName: "gear-expert-agent", path: "/admin/gear-agent" },
  ];

  const runnableAgents = agents.filter(a => a.functionName);

  const updateAgentStatusInDb = async (agentName: string, status: string, errorMessage?: string) => {
    try {
      const updateData: Record<string, any> = {
        status,
        last_run_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (status === 'success') {
        updateData.last_success_at = new Date().toISOString();
        updateData.last_error_message = null;
      } else if (status === 'error' && errorMessage) {
        updateData.last_error_at = new Date().toISOString();
        updateData.last_error_message = errorMessage;
      }

      await supabase
        .from('agent_status')
        .update(updateData)
        .eq('agent_name', agentName);
    } catch (err) {
      console.error('Failed to update agent status:', err);
    }
  };

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
      
      // Update DB status to running
      await updateAgentStatusInDb(agent.name, 'running');
      
      try {
        const { error } = await supabase.functions.invoke(agent.functionName!);
        
        if (error) throw error;
        
        setAgentRunStates(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'success' } : s
        ));
        
        // Update DB status to success
        await updateAgentStatusInDb(agent.name, 'success');
        successCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setAgentRunStates(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'error', error: errorMsg } : s
        ));
        
        // Update DB status to error
        await updateAgentStatusInDb(agent.name, 'error', errorMsg);
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

  const sendWeeklyDigest = async () => {
    setSendingDigest(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-digest');
      if (error) throw error;
      toast({
        title: "Weekly digest sent",
        description: `${data?.emailsSent || 0} emails sent successfully`,
      });
    } catch (err) {
      toast({
        title: "Failed to send digest",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setSendingDigest(false);
    }
  };

  const completedCount = agentRunStates.filter(s => s.status === 'success' || s.status === 'error').length;
  const progressPercent = agentRunStates.length > 0 ? (completedCount / agentRunStates.length) * 100 : 0;

  const tools = [
    { name: "System Status", description: "Service health overview", path: "/admin/health", frameNumber: "01" },
    { name: "Users", description: "Manage permissions", path: "/admin/users", frameNumber: "02" },
    { name: "Media Engine", description: "Photo pipeline", path: "/admin/media-engine", frameNumber: "03" },
    { name: "Moderation", description: "Review submissions", path: "/admin/moderation", frameNumber: "04" },
    { name: "Submissions", description: "Full management", path: "/admin/submissions", frameNumber: "05" },
    { name: "Artists", description: "Database records", path: "/admin/dj-artists", frameNumber: "06" },
    { name: "News", description: "Articles and drafts", path: "/admin/news-agent", frameNumber: "07" },
    { name: "Analytics", description: "Usage metrics", path: "/analytics", frameNumber: "08" },
    { name: "Activity", description: "Action history", path: "/admin/activity-log", frameNumber: "09" },
    { name: "Images", description: "Generated assets", path: "/admin/images", frameNumber: "10" },
    { name: "API Docs", description: "Documentation", path: "/api-docs", frameNumber: "11" },
    { name: "Badges", description: "Gamification", path: "/admin/badges", frameNumber: "12" },
    { name: "XP Events", description: "Multipliers", path: "/admin/xp-events", frameNumber: "13" },
    { name: "Notifications", description: "Alert channels", path: "/admin/notifications", frameNumber: "14" },
    { name: "Gear", description: "Equipment database", path: "/admin/gear-agent", frameNumber: "15" },
    { name: "Ticketing", description: "Event tickets", path: "/admin/ticketing", frameNumber: "16" },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] text-crimson uppercase tracking-[0.3em] mb-2">// techno.dog</div>
          <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-tight">Control Room</h1>
          {userEmail && (
            <p className="font-mono text-xs text-muted-foreground mt-1">{userEmail}</p>
          )}
        </div>
        <Button variant="outline" onClick={handleLogout} className="font-mono text-xs uppercase tracking-wider">
          <LogOut className="w-4 h-4 mr-2" />End Session
        </Button>
      </div>

      {/* Automated Tasks Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="px-2 py-1 bg-crimson/20 border border-crimson/50">
            <span className="font-mono text-[10px] text-crimson uppercase tracking-widest">Automated</span>
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
          <Button
            variant="outline"
            size="sm"
            onClick={sendWeeklyDigest}
            disabled={sendingDigest}
            className="font-mono text-xs uppercase tracking-wider"
          >
            {sendingDigest ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-3 h-3 mr-2" />
                Send Digest
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
            <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">Tools</span>
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
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Authenticating..." />
      </div>
    );
  }

  // Determine what to show
  let content;
  if (!user) {
    // Not logged in - show login form
    content = <AdminLoginForm />;
  } else if (!isAdmin) {
    // Logged in but not admin - show access denied
    content = <AccessDenied />;
  } else {
    // Admin - show dashboard
    content = <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO title="Control Room" description="techno.dog administration" path="/admin" />
      <Header />
      <main className="pt-24 lg:pt-16">
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            {content}
          </div>
        </section>
      </main>
      <Footer />
      {/* AI Assistant - only show for admins */}
      {isAdmin && <AdminAIAssistant />}
    </div>
  );
};

export default Admin;
