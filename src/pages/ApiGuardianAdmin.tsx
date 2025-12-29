import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  Key,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { AdminPageLayout, AdminStatsCard, AdminDataTable } from '@/components/admin';

const ApiGuardianAdmin = () => {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [keysRes, reportsRes] = await Promise.all([
        supabase
          .from('api_keys')
          .select('id, name, prefix, status, last_used_at, total_requests, rate_limit_per_day')
          .order('last_used_at', { ascending: false })
          .limit(10),
        supabase
          .from('agent_reports')
          .select('*')
          .eq('agent_name', 'api-guardian')
          .order('created_at', { ascending: false })
          .limit(1)
      ]);
      
      setApiKeys(keysRes.data || []);
      if (reportsRes.data?.[0]) setReport(reportsRes.data[0]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('api-guardian');
      if (error) throw error;
      
      toast({
        title: 'API Guardian completed',
        description: data?.message || 'Agent ran successfully'
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

  const activeKeys = apiKeys.filter(k => k.status === 'active').length;
  const totalRequests = apiKeys.reduce((acc, k) => acc + (k.total_requests || 0), 0);

  return (
    <AdminPageLayout
      title="API"
      description="Keys, rate limits, and usage"
      icon={Shield}
      iconColor="text-crimson"
      onRefresh={fetchData}
      onRunAgent={runAgent}
      isLoading={isLoading}
      isRunning={isRunning}
      runButtonText="Scan"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard 
          label="API Keys" 
          value={apiKeys.length} 
          icon={Key}
          iconColor="text-crimson/60"
        />
        <AdminStatsCard 
          label="Active Keys" 
          value={activeKeys} 
          icon={CheckCircle}
          iconColor="text-logo-green/60"
        />
        <AdminStatsCard 
          label="Total Requests" 
          value={totalRequests.toLocaleString()} 
          icon={Activity}
          iconColor="text-amber-500/60"
        />
        <AdminStatsCard 
          label="Last Scan" 
          value={report?.created_at ? new Date(report.created_at).toLocaleDateString() : 'Never'} 
          icon={Clock}
          iconColor="text-muted-foreground/60"
          subtext={report?.created_at ? new Date(report.created_at).toLocaleTimeString() : undefined}
        />
      </div>

      {/* API Keys Table */}
      <AdminDataTable
        title="API KEYS"
        icon={Key}
        iconColor="text-crimson"
        data={apiKeys}
        emptyMessage="No API keys found"
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (item) => (
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.prefix}...</p>
              </div>
            )
          },
          {
            key: 'total_requests',
            header: 'Requests',
            className: 'text-right',
            render: (item) => (
              <span className="text-xs text-muted-foreground">
                {item.total_requests?.toLocaleString() || 0} requests
              </span>
            )
          },
          {
            key: 'status',
            header: 'Status',
            className: 'text-right',
            render: (item) => (
              <Badge variant={item.status === 'active' ? 'default' : 'destructive'}>
                {item.status}
              </Badge>
            )
          }
        ]}
      />

      {/* Latest Report */}
      {report && (
        <AdminDataTable
          title="LATEST REPORT"
          icon={Shield}
          iconColor="text-amber-500"
          data={[report]}
          columns={[
            {
              key: 'title',
              header: 'Title',
              render: (item) => (
                <div>
                  <span className="font-medium text-foreground">{item.title}</span>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              )
            },
            {
              key: 'severity',
              header: 'Severity',
              className: 'text-right',
              render: (item) => (
                <Badge variant={item.severity === 'error' ? 'destructive' : 'outline'}>
                  {item.severity}
                </Badge>
              )
            }
          ]}
        />
      )}
    </AdminPageLayout>
  );
};

export default ApiGuardianAdmin;
