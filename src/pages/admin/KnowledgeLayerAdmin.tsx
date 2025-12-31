/**
 * Knowledge Admin Dashboard
 * 
 * Admin interface for managing the knowledge layer:
 * - View cache entries
 * - Monitor enrichment jobs
 * - Browse entities and facts
 * - View change log
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useKnowledgeFlags } from '@/hooks/useKnowledgeFlags';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, 
  Layers, 
  FileText, 
  Clock, 
  RefreshCw, 
  Flag,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { clearExpiredCache, getCacheStats } from '@/lib/knowledgeCache';
import { toast } from 'sonner';

export default function KnowledgeAdmin() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { 
    flags, 
    updateFlag, 
    enableAdminMode, 
    disableAll,
    reset 
  } = useKnowledgeFlags();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not admin
  if (!authLoading && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Fetch stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['knowledge-admin-stats'],
    queryFn: async () => {
      const [sources, documents, entities, facts, jobs, cache] = await Promise.all([
        supabase.from('kl_sources').select('id', { count: 'exact', head: true }),
        supabase.from('kl_documents').select('id', { count: 'exact', head: true }),
        supabase.from('kl_entities').select('id', { count: 'exact', head: true }),
        supabase.from('kl_facts').select('id', { count: 'exact', head: true }),
        supabase.from('kl_enrichment_jobs').select('id', { count: 'exact', head: true }),
        supabase.from('kl_cached_search').select('id', { count: 'exact', head: true }),
      ]);

      return {
        sources: sources.count || 0,
        documents: documents.count || 0,
        entities: entities.count || 0,
        facts: facts.count || 0,
        jobs: jobs.count || 0,
        cache: cache.count || 0,
        cacheStats: getCacheStats(),
      };
    },
    enabled: isAdmin,
  });

  // Fetch recent entities
  const { data: recentEntities } = useQuery({
    queryKey: ['knowledge-admin-entities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('kl_entities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: isAdmin && activeTab === 'entities',
  });

  // Fetch recent facts
  const { data: recentFacts } = useQuery({
    queryKey: ['knowledge-admin-facts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('kl_facts')
        .select(`
          *,
          kl_entities!kl_facts_entity_id_fkey (canonical_name, entity_type)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: isAdmin && activeTab === 'facts',
  });

  // Fetch recent jobs
  const { data: recentJobs } = useQuery({
    queryKey: ['knowledge-admin-jobs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('kl_enrichment_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: isAdmin && activeTab === 'jobs',
  });

  // Fetch cache entries
  const { data: cacheEntries, refetch: refetchCache } = useQuery({
    queryKey: ['knowledge-admin-cache'],
    queryFn: async () => {
      const { data } = await supabase
        .from('kl_cached_search')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: isAdmin && activeTab === 'cache',
  });

  // Fetch change log
  const { data: changelog } = useQuery({
    queryKey: ['knowledge-admin-changelog'],
    queryFn: async () => {
      const { data } = await supabase
        .from('kl_change_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: isAdmin && activeTab === 'changelog',
  });

  const handleClearExpiredCache = async () => {
    const count = await clearExpiredCache();
    toast.success(`Cleared ${count} expired cache entries`);
    refetchCache();
    refetchStats();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Layer Admin</h1>
            <p className="text-muted-foreground">Manage cache, enrichment, and facts</p>
          </div>
          <Button onClick={() => refetchStats()} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh Stats
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flags">Feature Flags</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="facts">Facts</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="changelog">Change Log</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.sources || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.documents || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Entities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.entities || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Facts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.facts || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.jobs || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cache</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.cache || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Hits</p>
                    <p className="text-xl font-bold">{stats?.cacheStats?.hits || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Misses</p>
                    <p className="text-xl font-bold">{stats?.cacheStats?.misses || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hit Rate</p>
                    <p className="text-xl font-bold">
                      {((stats?.cacheStats?.hitRate || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="flags">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag size={20} />
                  Feature Flags
                </CardTitle>
                <CardDescription>
                  Control which knowledge layer features are enabled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(flags).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={key} className="font-medium">
                        {key.replace(/_/g, ' ')}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {getFlagDescription(key)}
                      </p>
                    </div>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        updateFlag(key as keyof typeof flags, checked)
                      }
                    />
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={enableAdminMode} size="sm">
                    Enable All (Admin Mode)
                  </Button>
                  <Button onClick={disableAll} variant="outline" size="sm">
                    Disable All
                  </Button>
                  <Button onClick={reset} variant="ghost" size="sm">
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cache Tab */}
          <TabsContent value="cache">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cache Entries</CardTitle>
                  <CardDescription>Cached search results</CardDescription>
                </div>
                <Button onClick={handleClearExpiredCache} variant="outline" size="sm">
                  <Trash2 size={16} className="mr-2" />
                  Clear Expired
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {cacheEntries?.map((entry: Record<string, unknown>) => (
                      <div key={entry.id as string} className="p-3 border rounded-lg text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{entry.query_text as string || entry.query_hash as string}</span>
                          <Badge variant={new Date(entry.expires_at as string) > new Date() ? 'default' : 'secondary'}>
                            {entry.cache_type as string}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Hits: {entry.hit_count as number} | Expires: {new Date(entry.expires_at as string).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {(!cacheEntries || cacheEntries.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">No cache entries</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers size={20} />
                  Recent Entities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {recentEntities?.map((entity: Record<string, unknown>) => (
                      <div key={entity.id as string} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{entity.canonical_name as string}</span>
                          <Badge>{entity.entity_type as string}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entity.normalized_name as string}
                        </p>
                      </div>
                    ))}
                    {(!recentEntities || recentEntities.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">No entities yet</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facts Tab */}
          <TabsContent value="facts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  Recent Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {recentFacts?.map((fact: Record<string, unknown>) => (
                      <div key={fact.id as string} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{(fact.predicate as string).replace(/_/g, ' ')}</span>
                          <Badge variant={fact.status === 'verified' ? 'default' : 'secondary'}>
                            {fact.status as string}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{fact.value_text as string || JSON.stringify(fact.value_json)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Entity: {(fact.kl_entities as Record<string, unknown>)?.canonical_name as string} | 
                          Confidence: {((fact.confidence as number) * 100).toFixed(0)}%
                        </p>
                      </div>
                    ))}
                    {(!recentFacts || recentFacts.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">No facts yet</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Enrichment Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {recentJobs?.map((job: Record<string, unknown>) => (
                      <div key={job.id as string} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{job.job_type as string}</span>
                          <JobStatusBadge status={job.status as string} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Attempts: {job.attempts as number}/{job.max_attempts as number} | 
                          Created: {new Date(job.created_at as string).toLocaleString()}
                        </p>
                        {job.error && (
                          <p className="text-xs text-destructive mt-1">{job.error as string}</p>
                        )}
                      </div>
                    ))}
                    {(!recentJobs || recentJobs.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">No jobs yet</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Change Log Tab */}
          <TabsContent value="changelog">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={20} />
                  Change Log
                </CardTitle>
                <CardDescription>Audit trail of all mutations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {changelog?.map((log: Record<string, unknown>) => (
                      <div key={log.id as string} className="p-3 border rounded-lg text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {log.action as string} on {log.table_name as string}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at as string).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Actor: {log.actor as string} | Record: {(log.record_id as string).slice(0, 8)}...
                        </p>
                        {log.reversed_at && (
                          <Badge variant="outline" className="mt-1">Reversed</Badge>
                        )}
                      </div>
                    ))}
                    {(!changelog || changelog.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">No changes logged yet</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <Badge className="bg-green-500"><CheckCircle size={12} className="mr-1" /> Success</Badge>;
    case 'failed':
      return <Badge variant="destructive"><XCircle size={12} className="mr-1" /> Failed</Badge>;
    case 'running':
      return <Badge><RefreshCw size={12} className="mr-1 animate-spin" /> Running</Badge>;
    case 'queued':
      return <Badge variant="secondary"><Clock size={12} className="mr-1" /> Queued</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getFlagDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    KNOWLEDGE_CACHE_ENABLED: 'Read from cached search results',
    KNOWLEDGE_ENRICHMENT_ENABLED: 'Run background enrichment jobs',
    KNOWLEDGE_EVIDENCE_UI_ENABLED: 'Show evidence UI on entity pages',
    KNOWLEDGE_ADMIN_DASHBOARD_ENABLED: 'Enable this admin dashboard',
    KNOWLEDGE_SHADOW_MODE: 'Log actions without affecting output',
    KNOWLEDGE_ZERO_HALLUCINATION_ENABLED: 'Enforce evidence requirements',
  };
  return descriptions[flag] || '';
}
