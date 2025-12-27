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
} from "lucide-react";

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
        <div className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</div>
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
