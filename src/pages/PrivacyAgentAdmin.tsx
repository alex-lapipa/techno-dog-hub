import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  Eye,
  Clock,
  Database,
  Users,
  Cookie,
  FileText,
  ExternalLink,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';

interface PrivacyAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  affected_entity: string;
  affected_count: number;
  status: string;
  created_at: string;
}

interface ConsentStats {
  total_sessions: number;
  analytics_granted: number;
  marketing_granted: number;
  personalization_granted: number;
}

interface RetentionRule {
  id: string;
  table_name: string;
  retention_days: number;
  deletion_strategy: string;
  last_cleanup_at: string | null;
  records_deleted: number;
  is_active: boolean;
}

interface ThirdPartyIntegration {
  id: string;
  name: string;
  provider: string;
  integration_type: string;
  data_shared: string[];
  dpa_signed: boolean;
  is_active: boolean;
  last_reviewed_at: string | null;
}

const PrivacyAgentAdmin = () => {
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [alerts, setAlerts] = useState<PrivacyAlert[]>([]);
  const [consentStats, setConsentStats] = useState<ConsentStats | null>(null);
  const [retentionRules, setRetentionRules] = useState<RetentionRule[]>([]);
  const [integrations, setIntegrations] = useState<ThirdPartyIntegration[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch privacy alerts
      const { data: alertsData } = await supabase
        .from('privacy_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setAlerts(alertsData || []);

      // Fetch consent statistics
      const { data: consentData } = await supabase
        .from('consent_records')
        .select('consent_type, is_granted');
      
      if (consentData) {
        const uniqueSessions = new Set(consentData.map((c: any) => c.session_id)).size;
        const stats: ConsentStats = {
          total_sessions: uniqueSessions || consentData.length / 3, // Approximate
          analytics_granted: consentData.filter((c: any) => c.consent_type === 'analytics' && c.is_granted).length,
          marketing_granted: consentData.filter((c: any) => c.consent_type === 'marketing' && c.is_granted).length,
          personalization_granted: consentData.filter((c: any) => c.consent_type === 'personalization' && c.is_granted).length,
        };
        setConsentStats(stats);
      }

      // Fetch retention rules
      const { data: rulesData } = await supabase
        .from('data_retention_rules')
        .select('*')
        .order('table_name');
      setRetentionRules(rulesData || []);

      // Fetch third-party integrations
      const { data: integrationsData } = await supabase
        .from('third_party_integrations')
        .select('*')
        .order('name');
      setIntegrations(integrationsData || []);

      // Fetch last scan time
      const { data: lastRunData } = await supabase
        .from('privacy_agent_runs')
        .select('finished_at')
        .eq('status', 'completed')
        .order('finished_at', { ascending: false })
        .limit(1)
        .single();
      if (lastRunData) {
        setLastScan(lastRunData.finished_at);
      }
    } catch (error) {
      console.error('Error fetching privacy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runPrivacyScan = async () => {
    setIsScanning(true);
    try {
      const { error } = await supabase.functions.invoke('privacy-watchdog');
      if (error) throw error;
      toast.success('Privacy scan completed');
      await fetchData();
    } catch (error) {
      console.error('Error running privacy scan:', error);
      toast.error('Failed to run privacy scan');
    } finally {
      setIsScanning(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: string) => {
    try {
      await supabase
        .from('privacy_alerts')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', alertId);
      toast.success(`Alert marked as ${status}`);
      await fetchData();
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'acknowledged': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'false_positive': return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default: return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminPageLayout
        title="Privacy Agent"
        subtitle="Loading..."
        stats={[]}
        icon={Shield}
        isLoading={true}
      >
        <div />
      </AdminPageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminPageLayout
        title="Privacy Agent"
        subtitle="Access denied"
        stats={[]}
        icon={Shield}
      >
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </AdminPageLayout>
    );
  }

  const openAlerts = alerts.filter(a => a.status === 'open');
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'open');

  const stats = [
    { label: 'Open Alerts', value: openAlerts.length.toString(), icon: AlertTriangle },
    { label: 'Critical Issues', value: criticalAlerts.length.toString(), icon: XCircle },
    { label: 'Consent Rate', value: consentStats ? `${Math.round((consentStats.analytics_granted / Math.max(consentStats.total_sessions, 1)) * 100)}%` : '—', icon: Cookie },
    { label: 'Last Scan', value: lastScan ? format(new Date(lastScan), 'MMM d, HH:mm') : 'Never', icon: Clock },
  ];

  return (
    <AdminPageLayout
      title="Privacy Watchdog"
      subtitle="GDPR compliance monitoring and privacy alerts"
      stats={stats}
      icon={Shield}
      actions={
        <Button
          onClick={runPrivacyScan}
          disabled={isScanning}
          className="font-mono text-xs gap-2 bg-logo-green text-background hover:bg-logo-green/90"
        >
          {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Privacy Scan
        </Button>
      }
    >
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="font-mono">
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alerts ({openAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="consent" className="gap-2">
            <Cookie className="w-4 h-4" />
            Consent Analytics
          </TabsTrigger>
          <TabsTrigger value="retention" className="gap-2">
            <Database className="w-4 h-4" />
            Data Retention
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Third Parties
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-logo-green mx-auto mb-4" />
                <p className="text-muted-foreground font-mono">No privacy alerts. All systems compliant.</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'high' ? '#f97316' : '#eab308' }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(alert.status)}
                        <h3 className="font-mono text-sm font-medium">{alert.title}</h3>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                        <span>Entity: {alert.affected_entity}</span>
                        <span>Affected: {alert.affected_count}</span>
                        <span>{format(new Date(alert.created_at), 'MMM d, HH:mm')}</span>
                      </div>
                    </div>
                    {alert.status === 'open' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                          className="font-mono text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Acknowledge
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAlertStatus(alert.id, 'resolved')}
                          className="font-mono text-xs text-green-500"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Consent Analytics Tab */}
        <TabsContent value="consent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-logo-green" />
                  Analytics Consent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-foreground mb-2">
                  {consentStats ? Math.round((consentStats.analytics_granted / Math.max(consentStats.total_sessions, 1)) * 100) : 0}%
                </div>
                <Progress 
                  value={consentStats ? (consentStats.analytics_granted / Math.max(consentStats.total_sessions, 1)) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  {consentStats?.analytics_granted || 0} granted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Marketing Consent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-foreground mb-2">
                  {consentStats ? Math.round((consentStats.marketing_granted / Math.max(consentStats.total_sessions, 1)) * 100) : 0}%
                </div>
                <Progress 
                  value={consentStats ? (consentStats.marketing_granted / Math.max(consentStats.total_sessions, 1)) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  {consentStats?.marketing_granted || 0} granted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Personalization Consent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-foreground mb-2">
                  {consentStats ? Math.round((consentStats.personalization_granted / Math.max(consentStats.total_sessions, 1)) * 100) : 0}%
                </div>
                <Progress 
                  value={consentStats ? (consentStats.personalization_granted / Math.max(consentStats.total_sessions, 1)) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  {consentStats?.personalization_granted || 0} granted
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Retention Tab */}
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-logo-green" />
                Data Retention Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {retentionRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border border-border rounded-none bg-muted/30">
                    <div>
                      <p className="font-mono text-sm font-medium">{rule.table_name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {rule.retention_days} days • {rule.deletion_strategy}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={rule.is_active ? 'default' : 'outline'} className="font-mono text-xs">
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        {rule.records_deleted} deleted
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Third Party Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-logo-green" />
                Third-Party Data Processors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 border border-border rounded-none bg-muted/30">
                    <div>
                      <p className="font-mono text-sm font-medium">{integration.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {integration.provider} • {integration.integration_type}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {integration.data_shared?.map((data) => (
                          <Badge key={data} variant="outline" className="font-mono text-[10px]">
                            {data}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={integration.dpa_signed ? 'default' : 'destructive'} 
                        className="font-mono text-xs"
                      >
                        {integration.dpa_signed ? (
                          <><FileText className="w-3 h-3 mr-1" /> DPA Signed</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 mr-1" /> No DPA</>
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default PrivacyAgentAdmin;
