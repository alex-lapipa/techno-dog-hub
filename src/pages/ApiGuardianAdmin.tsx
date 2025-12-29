import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  RefreshCw, 
  Loader2,
  ArrowLeft,
  Shield,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const ApiGuardianAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);

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
      // Fetch API keys
      const { data: keys } = await supabase
        .from('api_keys')
        .select('id, name, prefix, status, last_used_at, total_requests, rate_limit_per_day')
        .order('last_used_at', { ascending: false })
        .limit(10);
      
      setApiKeys(keys || []);

      // Fetch latest report
      const { data: reports } = await supabase
        .from('agent_reports')
        .select('*')
        .eq('agent_name', 'api-guardian')
        .order('created_at', { ascending: false })
        .limit(1);

      if (reports && reports.length > 0) {
        setReport(reports[0]);
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-crimson" />
      </div>
    );
  }

  const activeKeys = apiKeys.filter(k => k.status === 'active').length;
  const totalRequests = apiKeys.reduce((acc, k) => acc + (k.total_requests || 0), 0);

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
                <Shield className="w-6 h-6 text-crimson" />
                API GUARDIAN
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Monitors developer API health, keys, and rate limits
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={runAgent} disabled={isRunning} size="sm" className="bg-crimson hover:bg-crimson/80">
              {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
              Run Agent
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">API Keys</p>
                  <p className="text-3xl font-bold text-foreground">{apiKeys.length}</p>
                </div>
                <Key className="w-8 h-8 text-crimson/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Active Keys</p>
                  <p className="text-3xl font-bold text-logo-green">{activeKeys}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-logo-green/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Total Requests</p>
                  <p className="text-3xl font-bold text-foreground">{totalRequests.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Last Scan</p>
                  <p className="text-sm font-bold text-foreground">
                    {report?.created_at ? new Date(report.created_at).toLocaleString() : 'Never'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys List */}
        <Card className="bg-zinc-900 border-crimson/20">
          <CardHeader>
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-crimson" />
              API KEYS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {apiKeys.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No API keys found</p>
              ) : (
                apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 bg-zinc-800 border border-border rounded">
                    <div>
                      <p className="text-sm font-medium text-foreground">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{key.prefix}...</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {key.total_requests?.toLocaleString() || 0} requests
                      </span>
                      <Badge variant={key.status === 'active' ? 'default' : 'destructive'}>
                        {key.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Report */}
        {report && (
          <Card className="bg-zinc-900 border-crimson/20">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                LATEST REPORT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-zinc-800 border border-border rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{report.title}</span>
                  <Badge variant={report.severity === 'error' ? 'destructive' : 'outline'}>
                    {report.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApiGuardianAdmin;
