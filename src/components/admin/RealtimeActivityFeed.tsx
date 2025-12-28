import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, XCircle, Edit, Shield, Image, 
  Trash2, Plus, Activity, Clock, AlertTriangle, 
  Info, Zap, Bot
} from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Json } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

interface AuditLogEntry {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  details: Json | null;
  created_at: string;
  admin_user_id: string;
}

interface AgentReport {
  id: string;
  agent_name: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
  isNew?: boolean;
}

const getActionIcon = (actionType: string) => {
  if (actionType.includes("approved")) return <CheckCircle className="w-3 h-3 text-green-500" />;
  if (actionType.includes("rejected") || actionType.includes("revoked")) return <XCircle className="w-3 h-3 text-red-500" />;
  if (actionType.includes("edited")) return <Edit className="w-3 h-3 text-yellow-500" />;
  if (actionType.includes("granted")) return <Shield className="w-3 h-3 text-purple-500" />;
  if (actionType.includes("selected")) return <Image className="w-3 h-3 text-blue-500" />;
  if (actionType.includes("deleted")) return <Trash2 className="w-3 h-3 text-red-500" />;
  if (actionType.includes("added")) return <Plus className="w-3 h-3 text-green-500" />;
  return <Activity className="w-3 h-3 text-muted-foreground" />;
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
    case 'error':
      return <AlertTriangle className="w-3 h-3 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
    default:
      return <Info className="w-3 h-3 text-blue-400" />;
  }
};

const formatActionType = (actionType: string): string => {
  return actionType
    .replace(/_/g, " ")
    .replace(/submission /g, "")
    .replace(/media asset /g, "asset ");
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const RealtimeActivityFeed = () => {
  const [activities, setActivities] = useState<AuditLogEntry[]>([]);
  const [agentReports, setAgentReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const fetchActivities = async () => {
    try {
      const [auditResult, agentResult] = await Promise.all([
        supabase
          .from("admin_audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("agent_reports")
          .select("id, agent_name, title, severity, status, created_at")
          .order("created_at", { ascending: false })
          .limit(8)
      ]);

      if (auditResult.data) setActivities(auditResult.data);
      if (agentResult.data) setAgentReports(agentResult.data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Subscribe to real-time updates for both tables
    const channel = supabase
      .channel("admin-activity-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_audit_log",
        },
        (payload) => {
          const newEntry = payload.new as AuditLogEntry;
          setActivities((prev) => [newEntry, ...prev.slice(0, 4)]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_reports",
        },
        (payload) => {
          const newReport = payload.new as AgentReport;
          setAgentReports((prev) => [{ ...newReport, isNew: true }, ...prev.slice(0, 7)]);
          
          // Remove "new" highlight after animation
          setTimeout(() => {
            setAgentReports((prev) => 
              prev.map((r) => r.id === newReport.id ? { ...r, isNew: false } : r)
            );
          }, 3000);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-muted-foreground animate-pulse" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Live Activity
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-6 h-6 bg-muted rounded" />
              <div className="flex-1 h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Zap className="w-4 h-4 text-logo-green" />
            <span className={cn(
              "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full",
              isConnected ? "bg-green-500 animate-pulse" : "bg-muted"
            )} />
          </div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Live Activity
          </h3>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground uppercase">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger 
            value="agents" 
            className="font-mono text-[10px] uppercase tracking-wider py-2 rounded-none data-[state=active]:bg-crimson/10 data-[state=active]:border-b-2 data-[state=active]:border-crimson"
          >
            <Bot className="w-3 h-3 mr-1.5" />
            Agent Reports ({agentReports.length})
          </TabsTrigger>
          <TabsTrigger 
            value="admin" 
            className="font-mono text-[10px] uppercase tracking-wider py-2 rounded-none data-[state=active]:bg-logo-green/10 data-[state=active]:border-b-2 data-[state=active]:border-logo-green"
          >
            <Activity className="w-3 h-3 mr-1.5" />
            Admin Actions ({activities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-0">
          <div className="max-h-[280px] overflow-y-auto">
            {agentReports.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="font-mono text-xs text-muted-foreground">
                  No agent reports yet
                </p>
                <p className="font-mono text-[10px] text-muted-foreground/70 mt-1">
                  Run an agent to see live updates
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {agentReports.map((report, index) => (
                  <div
                    key={report.id}
                    className={cn(
                      "flex items-start gap-3 p-3 transition-all duration-500",
                      report.isNew && "bg-crimson/10 animate-pulse",
                      index === 0 && !report.isNew && "bg-muted/30"
                    )}
                  >
                    <div className="mt-0.5">
                      {getSeverityIcon(report.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-mono text-[9px] px-1.5 py-0.5 bg-muted uppercase tracking-wider">
                          {report.agent_name.split(' ')[0]}
                        </span>
                        {report.isNew && (
                          <span className="font-mono text-[8px] px-1 py-0.5 bg-crimson text-white uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-foreground/90 truncate">
                        {report.title}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(report.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="admin" className="mt-0">
          <div className="max-h-[280px] overflow-y-auto p-4">
            {activities.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="font-mono text-xs text-muted-foreground">
                  No recent admin activity
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 p-2 -mx-2 rounded transition-colors ${
                      index === 0 ? "bg-logo-green/5 border-l-2 border-logo-green" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      {getActionIcon(activity.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs capitalize">
                          {formatActionType(activity.action_type)}
                        </span>
                        <Badge variant="outline" className="font-mono text-[9px] uppercase">
                          {activity.entity_type}
                        </Badge>
                      </div>
                      {activity.details && typeof activity.details === 'object' && !Array.isArray(activity.details) && (
                        <p className="font-mono text-[10px] text-muted-foreground truncate mt-0.5">
                          {(activity.details as Record<string, string>).submission_name || 
                           (activity.details as Record<string, string>).entity_name ||
                           (activity.details as Record<string, string>).target_email ||
                           activity.entity_id?.slice(0, 8)}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-border p-2">
            <Link 
              to="/admin/activity-log" 
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors block text-center"
            >
              View full activity log →
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeActivityFeed;
