import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Database, Loader2, Plus, Search, Sparkles, Upload, Check, FileText } from "lucide-react";
import { toast } from "sonner";

interface SuggestedTopic {
  query: string;
  type: string;
}

interface Stats {
  documents: number;
  entities: number;
  documentsWithEmbeddings: number;
}

export default function KnowledgeAdmin() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [customQuery, setCustomQuery] = useState("");

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await supabase.functions.invoke('knowledge-ingest', {
        body: { action: 'stats' },
      });
      if (statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }

      // Fetch suggested topics
      const topicsRes = await supabase.functions.invoke('knowledge-ingest', {
        body: { action: 'suggest-topics' },
      });
      if (topicsRes.data?.suggestedTopics) {
        setSuggestedTopics(topicsRes.data.suggestedTopics);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  };

  const toggleTopic = (query: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(query)) {
      newSelected.delete(query);
    } else {
      newSelected.add(query);
    }
    setSelectedTopics(newSelected);
  };

  const selectAll = () => {
    setSelectedTopics(new Set(suggestedTopics.map(t => t.query)));
  };

  const clearSelection = () => {
    setSelectedTopics(new Set());
  };

  const ingestSelected = async () => {
    if (selectedTopics.size === 0) {
      toast.error("Select at least one topic");
      return;
    }

    setIngesting(true);
    const sources = Array.from(selectedTopics).map(query => ({
      type: 'wikipedia',
      query,
    }));

    try {
      const { data, error } = await supabase.functions.invoke('knowledge-ingest', {
        body: { 
          action: 'ingest', 
          sources,
          extractEntities: true,
          generateEmbeddings: true,
        },
      });

      if (error) throw error;

      toast.success(
        `Ingested ${data.documentsCreated} documents, ${data.entitiesCreated} entities, ${data.embeddingsGenerated} embeddings`
      );

      // Refresh data
      fetchData();
      setSelectedTopics(new Set());
    } catch (error) {
      toast.error("Ingestion failed");
      console.error(error);
    }
    setIngesting(false);
  };

  const ingestCustom = async () => {
    if (!customQuery.trim()) {
      toast.error("Enter a Wikipedia search query");
      return;
    }

    setIngesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-ingest', {
        body: {
          action: 'ingest',
          sources: [{ type: 'wikipedia', query: customQuery.trim() }],
          extractEntities: true,
          generateEmbeddings: true,
        },
      });

      if (error) throw error;

      if (data.errors?.length) {
        toast.error(data.errors[0]);
      } else {
        toast.success(
          `Ingested ${data.documentsCreated} documents, ${data.entitiesCreated} entities`
        );
        setCustomQuery("");
        fetchData();
      }
    } catch (error) {
      toast.error("Ingestion failed");
    }
    setIngesting(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Access denied. Admin only.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-mono font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Knowledge Base
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Expand the RAG knowledge base with curated techno culture content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary/50" />
                <div>
                  <div className="text-2xl font-bold">{stats?.documents || 0}</div>
                  <div className="text-xs text-muted-foreground">Documents</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary/50" />
                <div>
                  <div className="text-2xl font-bold">{stats?.entities || 0}</div>
                  <div className="text-xs text-muted-foreground">Entities</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-primary/50" />
                <div>
                  <div className="text-2xl font-bold">{stats?.documentsWithEmbeddings || 0}</div>
                  <div className="text-xs text-muted-foreground">With Embeddings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="suggested">
          <TabsList className="mb-4">
            <TabsTrigger value="suggested">Suggested Topics</TabsTrigger>
            <TabsTrigger value="custom">Custom Ingest</TabsTrigger>
          </TabsList>

          <TabsContent value="suggested">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Curated Topics</CardTitle>
                    <CardDescription>
                      Select topics to ingest from Wikipedia
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={ingestSelected}
                      disabled={ingesting || selectedTopics.size === 0}
                    >
                      {ingesting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Ingest {selectedTopics.size > 0 && `(${selectedTopics.size})`}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {suggestedTopics.length === 0 ? (
                  <div className="py-8 text-center">
                    <Check className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">
                      All suggested topics have been ingested!
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedTopics.map(topic => (
                        <div
                          key={topic.query}
                          className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                            selectedTopics.has(topic.query)
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => toggleTopic(topic.query)}
                        >
                          <Checkbox checked={selectedTopics.has(topic.query)} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{topic.query}</div>
                            <div className="text-xs text-muted-foreground">
                              {topic.type}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Wikipedia Ingest</CardTitle>
                <CardDescription>
                  Search and ingest any Wikipedia article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g., Aphex Twin, Techno music, Kraftwerk..."
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      className="pl-9"
                      onKeyDown={(e) => e.key === 'Enter' && ingestCustom()}
                    />
                  </div>
                  <Button onClick={ingestCustom} disabled={ingesting}>
                    {ingesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This will search Wikipedia, extract entities, and generate embeddings for RAG
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
