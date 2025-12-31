import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, Database, Brain, CheckCircle, XCircle, SkipForward, Play } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
}

interface ExtractionResult {
  bookId: string;
  title: string;
  status: 'success' | 'skipped' | 'error';
  reason?: string;
  chunksCreated?: number;
  embeddingsGenerated?: number;
  existingChunks?: number;
}

interface ExtractionSummary {
  totalBooks: number;
  successful: number;
  skipped: number;
  errors: number;
  results: ExtractionResult[];
}

const AdminBookKnowledge = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [extractingBookId, setExtractingBookId] = useState<string | null>(null);
  const [results, setResults] = useState<ExtractionResult[]>([]);
  const [stats, setStats] = useState({ totalDocs: 0, withEmbeddings: 0, bookDocs: 0 });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch books
      const { data: booksData } = await supabase
        .from("books")
        .select("id, title, author, description")
        .eq("status", "published")
        .order("title");
      
      setBooks(booksData || []);

      // Fetch document stats
      const { count: totalDocs } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true });

      const { count: withEmbeddings } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .not("embedding", "is", null);

      const { count: bookDocs } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .like("source", "book:%");

      setStats({
        totalDocs: totalDocs || 0,
        withEmbeddings: withEmbeddings || 0,
        bookDocs: bookDocs || 0
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const extractSingleBook = async (bookId: string) => {
    setExtractingBookId(bookId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-book-knowledge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ bookId }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      const result = data.results?.[0];
      if (result) {
        setResults(prev => [...prev.filter(r => r.bookId !== bookId), result]);
        if (result.status === 'success') {
          toast.success(`Extracted ${result.chunksCreated} chunks from "${result.title}"`);
        } else if (result.status === 'skipped') {
          toast.info(`"${result.title}" already processed`);
        } else {
          toast.error(`Failed: ${result.reason}`);
        }
      }
      
      fetchData(); // Refresh stats
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setExtractingBookId(null);
    }
  };

  const extractAllBooks = async () => {
    setExtracting(true);
    setResults([]);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      toast.info("Starting extraction of all books... This may take several minutes.");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-book-knowledge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ processAll: true }),
        }
      );

      const data: ExtractionSummary = await response.json();
      
      if (!response.ok) {
        throw new Error((data as any).error || "Extraction failed");
      }

      setResults(data.results);
      toast.success(`Completed: ${data.successful} extracted, ${data.skipped} skipped, ${data.errors} errors`);
      fetchData();
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  const getResultForBook = (bookId: string) => results.find(r => r.bookId === bookId);

  const getStatusIcon = (result: ExtractionResult | undefined) => {
    if (!result) return null;
    switch (result.status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'skipped':
        return <SkipForward className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-crimson" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Book Knowledge Extraction | Admin</title>
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-crimson" />
              <h1 className="text-2xl font-mono uppercase tracking-wider">
                Book Knowledge Extraction
              </h1>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              Use Anthropic Claude to extract deep knowledge from books for RAG-powered expert chat.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Total Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-mono text-foreground">{stats.totalDocs}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  With Embeddings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-mono text-logo-green">{stats.withEmbeddings}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Book Chunks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-mono text-crimson">{stats.bookDocs}</p>
              </CardContent>
            </Card>
          </div>

          {/* Extract All Button */}
          <Card className="mb-8 bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-lg">Batch Extraction</CardTitle>
              <CardDescription className="font-mono text-xs">
                Extract knowledge from all {books.length} published books. Already-processed books will be skipped.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={extractAllBooks}
                disabled={extracting}
                className="bg-crimson hover:bg-crimson/90 text-white font-mono"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Extract All Books
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Books List */}
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-lg">Books ({books.length})</CardTitle>
              <CardDescription className="font-mono text-xs">
                Click on a book to extract its knowledge individually.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {books.map((book) => {
                    const result = getResultForBook(book.id);
                    const isExtracting = extractingBookId === book.id;
                    
                    return (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-3 border border-border hover:border-logo-green/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result)}
                            <p className="font-mono text-sm text-foreground truncate">
                              {book.title}
                            </p>
                          </div>
                          <p className="font-mono text-xs text-muted-foreground truncate">
                            {book.author}
                          </p>
                          {result && (
                            <p className="font-mono text-[10px] text-muted-foreground mt-1">
                              {result.status === 'success' && `${result.chunksCreated} chunks, ${result.embeddingsGenerated} embeddings`}
                              {result.status === 'skipped' && `Already processed (${result.existingChunks} chunks)`}
                              {result.status === 'error' && result.reason}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => extractSingleBook(book.id)}
                          disabled={isExtracting || extracting}
                          className="font-mono text-xs"
                        >
                          {isExtracting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Extract"
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminBookKnowledge;
