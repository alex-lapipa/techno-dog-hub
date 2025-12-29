import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  Clock, 
  FileText, 
  AlertTriangle,
  Eye,
  Send,
  Newspaper
} from 'lucide-react';
import { useAgentRunner } from '@/hooks/useAgentRunner';

interface AgentRun {
  id: string;
  run_date: string;
  status: string;
  sources_checked: any[];
  candidates: any[];
  rejected: any[];
  chosen_story: any;
  final_article_id: string | null;
  error_log: string | null;
  created_at: string;
}

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  body_markdown: string;
  author_pseudonym: string;
  city_tags: string[];
  genre_tags: string[];
  entity_tags: string[];
  source_urls: string[];
  confidence_score: number;
  status: string;
  published_at: string | null;
  created_at: string;
}

const NewsAgentAdmin = () => {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [drafts, setDrafts] = useState<NewsArticle[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  // Use shared agent runner hook
  const { isRunning, runAgent } = useAgentRunner({
    functionName: 'news-agent',
    onSuccess: (data) => {
      toast.success('Agent run completed!', {
        description: data?.title ? `Created draft: ${data.title}` : 'Check the runs tab for details'
      });
      fetchData();
    },
    onError: (error) => {
      toast.error('Agent run failed', {
        description: error.message
      });
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch runs - using type assertion for new tables
      const { data: runsData } = await supabase
        .from('td_news_agent_runs' as any)
        .select('*')
        .order('run_date', { ascending: false })
        .limit(20);

      // Fetch drafts
      const { data: draftsData } = await supabase
        .from('td_news_articles' as any)
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      setRuns((runsData as unknown as AgentRun[]) || []);
      setDrafts((draftsData as unknown as NewsArticle[]) || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  const publishDraft = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('td_news_articles' as any)
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', articleId);

      if (error) throw error;

      toast.success('Article published!');
      fetchData();
      setSelectedDraft(null);
    } catch (err) {
      console.error('Publish error:', err);
      toast.error('Failed to publish article');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      success: { variant: 'default', icon: Check },
      running: { variant: 'secondary', icon: Clock },
      pending: { variant: 'outline', icon: Clock },
      partial: { variant: 'secondary', icon: AlertTriangle },
      failed: { variant: 'destructive', icon: X }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <AdminPageLayout
      title="News"
      description="Article generation and drafts"
      icon={Newspaper}
      iconColor="text-amber-500"
      onRefresh={fetchData}
      onRunAgent={() => runAgent()}
      isLoading={loading}
      isRunning={isRunning}
      runButtonText="Generate"
    >
      <Tabs defaultValue="drafts" className="space-y-6">
        <TabsList className="font-mono">
          <TabsTrigger value="drafts" className="gap-2">
            <FileText className="w-4 h-4" />
            Drafts ({drafts.length})
          </TabsTrigger>
          <TabsTrigger value="runs" className="gap-2">
            <Clock className="w-4 h-4" />
            Run History
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <X className="w-4 h-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-4">
          {drafts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground font-mono">
                No draft articles. Run the agent to generate content.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {drafts.map(draft => (
                <Card key={draft.id} className="hover:bg-card/80 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="font-mono text-lg uppercase">
                          {draft.title}
                        </CardTitle>
                        {draft.subtitle && (
                          <CardDescription className="mt-1">
                            {draft.subtitle}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDraft(draft)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => publishDraft(draft.id)}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Publish
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      <Badge variant="outline">By {draft.author_pseudonym}</Badge>
                      <Badge variant="secondary">
                        Score: {(draft.confidence_score * 100).toFixed(0)}%
                      </Badge>
                      {draft.city_tags?.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                      {draft.genre_tags?.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground font-mono">
                      Created: {new Date(draft.created_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Draft Preview Modal */}
          {selectedDraft && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="font-mono text-xl uppercase">
                      {selectedDraft.title}
                    </CardTitle>
                    {selectedDraft.subtitle && (
                      <CardDescription className="mt-1 text-base">
                        {selectedDraft.subtitle}
                      </CardDescription>
                    )}
                    <div className="mt-2 text-sm text-muted-foreground font-mono">
                      By {selectedDraft.author_pseudonym}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDraft(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedDraft.body_markdown}
                  </div>
                  
                  {selectedDraft.source_urls && selectedDraft.source_urls.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Sources
                      </div>
                      <ul className="list-disc list-inside text-sm">
                        {selectedDraft.source_urls.map((url, i) => (
                          <li key={i}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 flex gap-2">
                    <Button onClick={() => publishDraft(selectedDraft.id)}>
                      <Send className="w-4 h-4 mr-2" />
                      Publish Article
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedDraft(null)}>
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Runs Tab */}
        <TabsContent value="runs" className="space-y-4">
          {runs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground font-mono">
                No agent runs yet. Click "Run Now" to start.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {runs.map(run => (
                <Card key={run.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(run.status)}
                        <span className="font-mono text-sm">
                          {new Date(run.run_date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm font-mono">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-muted-foreground text-xs">Sources Checked</div>
                        <div className="text-lg">{run.sources_checked?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Candidates</div>
                        <div className="text-lg">{run.candidates?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Rejected</div>
                        <div className="text-lg">{run.rejected?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Article Created</div>
                        <div className="text-lg">{run.final_article_id ? '✓' : '—'}</div>
                      </div>
                    </div>
                    
                    {run.chosen_story && (
                      <div className="pt-2 border-t border-border">
                        <div className="text-muted-foreground text-xs mb-1">Chosen Story</div>
                        <div>{run.chosen_story.title}</div>
                      </div>
                    )}
                    
                    {run.error_log && (
                      <div className="pt-2 border-t border-border text-destructive">
                        <div className="text-xs mb-1">Error</div>
                        <div>{run.error_log}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-4">
          {runs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground font-mono">
                No rejection data available yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {runs.flatMap(run => 
                (run.rejected || []).map((item: any, i: number) => (
                  <Card key={`${run.id}-${i}`} className="bg-destructive/5">
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 font-mono text-sm">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.reason}
                          </div>
                        </div>
                        <Badge variant="destructive" className="shrink-0">
                          Rejected
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default NewsAgentAdmin;
