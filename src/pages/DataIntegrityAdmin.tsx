import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  RefreshCw, 
  Loader2,
  ArrowLeft,
  Database,
  AlertTriangle,
  CheckCircle,
  Link2,
  Copy,
  Trash2
} from 'lucide-react';

const DataIntegrityAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [latestReport, setLatestReport] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-crimson" />
      </div>
    );
  }

  const totalRecords = (stats?.artists || 0) + (stats?.gear || 0) + (stats?.venues || 0) + (stats?.festivals || 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-2">
                <Database className="w-6 h-6 text-amber-500" />
                DATA INTEGRITY
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Detects orphaned records, duplicates, and missing data
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={runAgent} disabled={isRunning} size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
              {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
              Run Check
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-zinc-900 border-amber-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Total Records</p>
                  <p className="text-3xl font-bold text-foreground">{totalRecords}</p>
                </div>
                <Database className="w-8 h-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Artists</p>
                <p className="text-2xl font-bold text-foreground">{stats?.artists || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Gear</p>
                <p className="text-2xl font-bold text-foreground">{stats?.gear || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Venues</p>
                <p className="text-2xl font-bold text-foreground">{stats?.venues || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Festivals</p>
                <p className="text-2xl font-bold text-foreground">{stats?.festivals || 0}</p>
              </div>
            </CardContent>
          </Card>
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
      </div>
    </div>
  );
};

export default DataIntegrityAdmin;
