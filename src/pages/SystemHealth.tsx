import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  RefreshCw,
  Database,
  HardDrive,
  Shield,
  Zap,
  Globe,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Bell,
  BellOff,
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";

interface HealthAlert {
  id: string;
  service_name: string;
  alert_type: string;
  severity: string;
  message: string;
  notified_at: string;
  resolved_at: string | null;
  created_at: string;
}

interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  latency?: number;
  message?: string;
  lastChecked: string;
}

interface SystemHealth {
  overall: "healthy" | "degraded" | "down";
  timestamp: string;
  database: HealthCheck;
  storage: HealthCheck;
  auth: HealthCheck;
  edgeFunctions: HealthCheck[];
  apiEndpoints: HealthCheck[];
  error?: string;
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "healthy":
      return <CheckCircle2 className="w-5 h-5 text-logo-green" />;
    case "degraded":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case "down":
      return <XCircle className="w-5 h-5 text-crimson" />;
    default:
      return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    healthy: "bg-logo-green/20 text-logo-green border-logo-green/30",
    degraded: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    down: "bg-crimson/20 text-crimson border-crimson/30",
    unknown: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <Badge className={`font-mono text-[10px] uppercase ${variants[status] || variants.unknown}`}>
      {status}
    </Badge>
  );
};

const HealthCard = ({
  title,
  icon: Icon,
  check,
}: {
  title: string;
  icon: React.ElementType;
  check: HealthCheck;
}) => (
  <div className="border border-border bg-card p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-sm uppercase tracking-tight">{title}</span>
      </div>
      <StatusIcon status={check.status} />
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">Status</span>
        <StatusBadge status={check.status} />
      </div>
      {check.latency !== undefined && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">Latency</span>
          <span className={`font-mono text-xs ${check.latency < 200 ? 'text-logo-green' : check.latency < 500 ? 'text-yellow-500' : 'text-crimson'}`}>
            {check.latency}ms
          </span>
        </div>
      )}
      {check.message && (
        <div className="pt-2 border-t border-border/50">
          <span className="font-mono text-[10px] text-muted-foreground">{check.message}</span>
        </div>
      )}
    </div>
  </div>
);

const FunctionRow = ({ check }: { check: HealthCheck }) => (
  <div className="flex items-center justify-between py-2 px-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
    <div className="flex items-center gap-3">
      <StatusIcon status={check.status} />
      <span className="font-mono text-xs">{check.name}</span>
    </div>
    <div className="flex items-center gap-4">
      {check.latency !== undefined && (
        <span className="font-mono text-[10px] text-muted-foreground">
          {check.latency}ms
        </span>
      )}
      <StatusBadge status={check.status} />
    </div>
  </div>
);

const HealthAlertsPanel = () => {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("health_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts(data || []);
    } catch (e) {
      console.error("Failed to fetch health alerts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("health-alerts-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "health_alerts",
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const getSeverityBadge = (severity: string, resolved: boolean) => {
    if (resolved) {
      return (
        <Badge className="bg-logo-green/20 text-logo-green border-logo-green/30 font-mono text-[9px] uppercase">
          Resolved
        </Badge>
      );
    }
    const variants: Record<string, string> = {
      critical: "bg-crimson/20 text-crimson border-crimson/30",
      warning: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      info: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    };
    return (
      <Badge className={`${variants[severity] || variants.warning} font-mono text-[9px] uppercase`}>
        {severity}
      </Badge>
    );
  };

  const activeAlerts = alerts.filter((a) => !a.resolved_at);
  const resolvedAlerts = alerts.filter((a) => a.resolved_at);

  if (loading) {
    return (
      <div className="border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-muted-foreground animate-pulse" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Health Alerts
          </h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {activeAlerts.length > 0 ? (
            <div className="relative">
              <Bell className="w-4 h-4 text-crimson" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-crimson rounded-full flex items-center justify-center">
                <span className="font-mono text-[8px] text-white">{activeAlerts.length}</span>
              </span>
            </div>
          ) : (
            <BellOff className="w-4 h-4 text-muted-foreground" />
          )}
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Health Alerts
          </h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {activeAlerts.length} active / {resolvedAlerts.length} resolved
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border/50">
          <CheckCircle2 className="w-8 h-8 mx-auto text-logo-green mb-2" />
          <p className="font-mono text-xs text-muted-foreground">No alerts recorded</p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">
            System monitoring is active
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 border transition-colors ${
                alert.resolved_at
                  ? "border-border/50 bg-muted/20"
                  : alert.severity === "critical"
                  ? "border-crimson/30 bg-crimson/5"
                  : "border-yellow-500/30 bg-yellow-500/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-medium">
                      {alert.service_name}
                    </span>
                    {getSeverityBadge(alert.severity, !!alert.resolved_at)}
                    <Badge variant="outline" className="font-mono text-[9px]">
                      {alert.alert_type}
                    </Badge>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground line-clamp-2">
                    {alert.message}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatTimeAgo(alert.created_at)}
                  </span>
                  {alert.resolved_at && (
                    <div className="font-mono text-[9px] text-logo-green mt-0.5">
                      ✓ {formatTimeAgo(alert.resolved_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SystemHealth = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("system-health");

      if (error) throw error;
      setHealth(data);
    } catch (e: any) {
      toast({
        title: "Health check failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchHealth();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Authenticating..." />
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/admin");
    return null;
  }

  const getOverallColor = (status?: string) => {
    switch (status) {
      case "healthy":
        return "text-logo-green";
      case "degraded":
        return "text-yellow-500";
      case "down":
        return "text-crimson";
      default:
        return "text-muted-foreground";
    }
  };

  const healthyCount = health
    ? [health.database, health.storage, health.auth, ...health.edgeFunctions, ...health.apiEndpoints].filter(
        (c) => c.status === "healthy"
      ).length
    : 0;

  const totalCount = health
    ? 3 + health.edgeFunctions.length + health.apiEndpoints.length
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="System Health"
        description="Real-time system status and health monitoring"
        path="/admin/health"
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
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
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-1">
                    // Monitoring
                  </div>
                  <h1 className="font-mono text-2xl md:text-3xl uppercase tracking-tight">
                    System Health
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`font-mono text-xs ${autoRefresh ? 'border-logo-green text-logo-green' : ''}`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {autoRefresh ? "Auto: ON" : "Auto: OFF"}
                </Button>
                <Button
                  variant="brutalist"
                  size="sm"
                  onClick={fetchHealth}
                  disabled={loading}
                  className="font-mono text-xs uppercase"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Overall Status */}
            <div className="border border-border bg-card p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Activity className={`w-8 h-8 ${getOverallColor(health?.overall)}`} />
                  <div>
                    <h2 className="font-mono text-lg uppercase tracking-tight">
                      System Status
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground">
                      {health?.timestamp
                        ? `Last checked: ${new Date(health.timestamp).toLocaleString()}`
                        : "Not checked yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-mono text-3xl uppercase ${getOverallColor(health?.overall)}`}>
                      {health?.overall || "---"}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {healthyCount}/{totalCount} services healthy
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {health?.error && (
              <div className="border border-crimson/50 bg-crimson/10 p-4 mb-6">
                <p className="font-mono text-xs text-crimson">{health.error}</p>
              </div>
            )}

            {/* Core Services */}
            <div className="mb-8">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Core Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {health?.database && (
                  <HealthCard title="Database" icon={Database} check={health.database} />
                )}
                {health?.storage && (
                  <HealthCard title="Storage" icon={HardDrive} check={health.storage} />
                )}
                {health?.auth && (
                  <HealthCard title="Auth Service" icon={Shield} check={health.auth} />
                )}
              </div>
            </div>

            {/* Edge Functions */}
            <div className="mb-8">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Edge Functions ({health?.edgeFunctions.length || 0})
              </h3>
              <div className="border border-border bg-card">
                {health?.edgeFunctions.map((fn) => (
                  <FunctionRow key={fn.name} check={fn} />
                ))}
                {!health?.edgeFunctions.length && (
                  <div className="p-4 text-center font-mono text-xs text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* API Endpoints */}
            <div className="mb-8">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                API Endpoints ({health?.apiEndpoints.length || 0})
              </h3>
              <div className="border border-border bg-card">
                {health?.apiEndpoints.map((ep) => (
                  <FunctionRow key={ep.name} check={ep} />
                ))}
                {!health?.apiEndpoints.length && (
                  <div className="p-4 text-center font-mono text-xs text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Health Alerts Panel */}
            <div className="mb-8">
              <HealthAlertsPanel />
            </div>

            {/* Latency Summary */}
            {health && (
              <div className="border border-border bg-card p-6">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Latency Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border border-border/50">
                    <div className="font-mono text-2xl text-logo-green">
                      {health.database.latency || 0}ms
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase mt-1">
                      Database
                    </div>
                  </div>
                  <div className="text-center p-4 border border-border/50">
                    <div className="font-mono text-2xl text-logo-green">
                      {health.storage.latency || 0}ms
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase mt-1">
                      Storage
                    </div>
                  </div>
                  <div className="text-center p-4 border border-border/50">
                    <div className="font-mono text-2xl text-logo-green">
                      {health.auth.latency || 0}ms
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase mt-1">
                      Auth
                    </div>
                  </div>
                  <div className="text-center p-4 border border-border/50">
                    <div className="font-mono text-2xl text-logo-green">
                      {Math.round(
                        health.edgeFunctions.reduce((a, b) => a + (b.latency || 0), 0) /
                          (health.edgeFunctions.length || 1)
                      )}ms
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase mt-1">
                      Avg. Functions
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SystemHealth;
