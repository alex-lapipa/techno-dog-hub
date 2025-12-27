import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Send } from 'lucide-react';
import { toast } from 'sonner';

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

const NewsDrafts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDrafts();
  }, [user, navigate]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('td_news_articles' as any)
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      setDrafts((data as unknown as NewsArticle[]) || []);
    } catch (err) {
      console.error('Error fetching drafts:', err);
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
      fetchDrafts();
    } catch (err) {
      console.error('Publish error:', err);
      toast.error('Failed to publish article');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/news" 
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">
              // Admin Only
            </div>
            <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-tight">
              Draft Articles
            </h1>
          </div>

          {/* Drafts List */}
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground font-mono">
                Loading...
              </CardContent>
            </Card>
          ) : drafts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground font-mono">
                No draft articles.
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
                          asChild
                        >
                          <Link to={`/news/preview/${draft.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Link>
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
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground font-mono">
                      Created: {new Date(draft.created_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Link to agent admin */}
          <div className="mt-8">
            <Link 
              to="/admin/news-agent"
              className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              → Go to News Agent Admin
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDrafts;
