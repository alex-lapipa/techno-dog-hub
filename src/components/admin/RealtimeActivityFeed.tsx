import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, XCircle, Edit, Shield, ShieldOff, Image, 
  Trash2, Plus, Activity, Clock, User
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Json } from "@/integrations/supabase/types";

interface AuditLogEntry {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  details: Json | null;
  created_at: string;
  admin_user_id: string;
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
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Subscribe to real-time updates
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
      .subscribe();

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
    <div className="border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-4 h-4 text-logo-green" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Live Activity
          </h3>
        </div>
        <Link 
          to="/admin/activity-log" 
          className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          View all →
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
          <p className="font-mono text-xs text-muted-foreground">
            No recent activity
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
  );
};

export default RealtimeActivityFeed;
