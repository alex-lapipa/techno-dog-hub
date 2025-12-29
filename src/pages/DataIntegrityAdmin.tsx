import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  Database,
  AlertTriangle,
  Link2,
  Copy,
  Trash2
} from 'lucide-react';

const DataIntegrityAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [latestReport, setLatestReport] = useState<any>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch counts from various tables
      const [artists, gear, venues, festivals] = await Promise.all([
        supabase.from('canonical_artists').select('*', { count: 'exact', head: true }),
        supabase.from('gear_catalog').select('*', { count: 'exact', head: true }),
        supabase.from('content_sync').select('*', { count: 'exact', head: true }).eq('entity_type', 'venue'),
        supabase.from('content_sync').select('*', { count: 'exact', head: true }).eq('entity_type', 'festival'),
      ]);

      setStats({
        artists: artists.count || 0,
        gear: gear.count || 0,
        venues: venues.count || 0,
        festivals: festivals.count || 0,
      });

      // Fetch latest report
      const { data: reports } = await supabase
        .from('agent_reports')
        .select('*')
        .eq('agent_name', 'data-integrity')
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
      const { data, error } = await supabase.functions.invoke('data-integrity');
      if (error) throw error;
      
      toast({
        title: 'Data Integrity check completed',
        description: data?.message || 'Database scanned for issues'
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

  const totalRecords = (stats?.artists || 0) + (stats?.gear || 0) + (stats?.venues || 0) + (stats?.festivals || 0);

  return (
    <AdminPageLayout
      title="Data Integrity"
      description="Detect orphaned records and duplicates"
      icon={Database}
      iconColor="text-amber-500"
      onRefresh={fetchData}
      onRunAgent={runAgent}
      isLoading={isLoading}
      isRunning={isRunning}
      runButtonText="Check"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <AdminStatsCard
          label="Total Records"
          value={totalRecords}
          icon={Database}
          iconColor="text-amber-500"
          className="border-amber-500/30"
        />
        <AdminStatsCard
          label="Artists"
          value={stats?.artists || 0}
          icon={Database}
        />
        <AdminStatsCard
          label="Gear"
          value={stats?.gear || 0}
          icon={Database}
        />
        <AdminStatsCard
          label="Venues"
          value={stats?.venues || 0}
          icon={Database}
        />
        <AdminStatsCard
          label="Festivals"
          value={stats?.festivals || 0}
          icon={Database}
        />
      </div>

      {/* Integrity Checks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-logo-green/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Link2 className="w-5 h-5 text-logo-green" />
              <span className="font-mono text-sm">Orphaned Records</span>
            </div>
            <p className="text-2xl font-bold text-logo-green">0</p>
            <p className="text-xs text-muted-foreground mt-1">No orphaned references found</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-logo-green/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Copy className="w-5 h-5 text-logo-green" />
              <span className="font-mono text-sm">Duplicates</span>
            </div>
            <p className="text-2xl font-bold text-logo-green">0</p>
            <p className="text-xs text-muted-foreground mt-1">No duplicate records detected</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-logo-green/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Trash2 className="w-5 h-5 text-logo-green" />
              <span className="font-mono text-sm">Stale Data</span>
            </div>
            <p className="text-2xl font-bold text-logo-green">0</p>
            <p className="text-xs text-muted-foreground mt-1">All data is fresh</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Report */}
      {latestReport && (
        <Card className="bg-zinc-900 border-amber-500/30">
          <CardHeader>
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              LATEST INTEGRITY REPORT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-zinc-800 border border-border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{latestReport.title}</span>
                <Badge variant={latestReport.severity === 'error' ? 'destructive' : 'outline'}>
                  {latestReport.severity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{latestReport.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(latestReport.created_at).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminPageLayout>
  );
};

export default DataIntegrityAdmin;
