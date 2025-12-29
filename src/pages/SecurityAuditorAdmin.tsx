import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  ShieldAlert,
  Lock,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';

const SecurityAuditorAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [latestReport, setLatestReport] = useState<any>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch admin audit log
      const { data: logs } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setAuditLog(logs || []);

      // Fetch latest security report
      const { data: reports } = await supabase
        .from('agent_reports')
        .select('*')
        .eq('agent_name', 'security-auditor')
        .order('created_at', { ascending: false })
        .limit(1);

      if (reports && reports.length > 0) {
        setLatestReport(reports[0]);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('security-auditor');
      if (error) throw error;
      
      toast({
        title: 'Security Auditor completed',
        description: data?.message || 'Security scan complete'
      });
      
      fetchData();
    } catch (err) {
      toast({
        title: 'Agent failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const actionCounts = auditLog.reduce((acc, log) => {
    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminPageLayout
      title="Security"
      description="Access control and activity monitoring"
      icon={ShieldAlert}
      iconColor="text-crimson"
      onRefresh={fetchData}
      onRunAgent={runAgent}
      isLoading={isLoading}
      isRunning={isRunning}
      runButtonText="Audit"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Audit Events"
          value={auditLog.length}
          icon={Eye}
          iconColor="text-crimson"
        />
        <AdminStatsCard
          label="Action Types"
          value={Object.keys(actionCounts).length}
          icon={Lock}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Status"
          value="SECURE"
          icon={CheckCircle}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Threats"
          value={0}
          icon={AlertTriangle}
        />
      </div>

      {/* Audit Log */}
      <Card className="bg-zinc-900 border-crimson/20">
        <CardHeader>
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-crimson" />
            ADMIN AUDIT LOG
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No audit events</p>
            ) : (
              auditLog.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-zinc-800 border border-border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{log.action_type}</p>
                    <p className="text-xs text-muted-foreground truncate">{log.entity_type}: {log.entity_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
};

export default SecurityAuditorAdmin;
