import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  BookOpen, Search, Plus, Trash2, Edit, Eye, EyeOff, 
  BarChart3, Clock, CheckCircle, XCircle, RefreshCw,
  Sparkles, TrendingUp, Library, FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface Book {
  id: string;
  title: string;
  author: string;
  category_id: string | null;
  cover_url: string | null;
  description: string | null;
  why_read: string | null;
  purchase_url: string | null;
  year_published: number | null;
  status: string;
  is_featured: boolean;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

interface BookCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  icon: string | null;
}

interface AgentRun {
  id: string;
  run_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  stats: Record<string, unknown>;
  error_message: string | null;
  books_processed: number;
  books_discovered: number;
  books_updated: number;
}

interface DiscoveryItem {
  id: string;
  title: string;
  author: string | null;
  suggested_category: string | null;
  discovery_source: string | null;
  discovery_reason: string | null;
  confidence_score: number | null;
  status: string;
  created_at: string;
}

const LibrarianAgentAdmin = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddingBook, setIsAddingBook] = useState(false);

  // Fetch books
  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ["admin-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Book[];
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["book-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as BookCategory[];
    },
  });

  // Fetch agent runs
  const { data: agentRuns = [] } = useQuery({
    queryKey: ["librarian-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("librarian_agent_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as AgentRun[];
    },
  });

  // Fetch discovery queue
  const { data: discoveryQueue = [] } = useQuery({
    queryKey: ["book-discovery-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_discovery_queue")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DiscoveryItem[];
    },
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: async (book: Partial<Book> & { id: string }) => {
      const { error } = await supabase
        .from("books")
        .update(book)
        .eq("id", book.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      toast.success("Book updated");
      setEditingBook(null);
    },
    onError: (error) => {
      toast.error("Failed to update book: " + error.message);
    },
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      toast.success("Book deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete book: " + error.message);
    },
  });

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (book: Omit<Book, "id" | "created_at" | "updated_at" | "view_count" | "click_count">) => {
      const { error } = await supabase.from("books").insert(book);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      toast.success("Book added");
      setIsAddingBook(false);
    },
    onError: (error) => {
      toast.error("Failed to add book: " + error.message);
    },
  });

  // Filter books
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalBooks = books.length;
  const publishedBooks = books.filter((b) => b.status === "published").length;
  const draftBooks = books.filter((b) => b.status === "draft").length;
  const totalViews = books.reduce((acc, b) => acc + (b.view_count || 0), 0);
  const totalClicks = books.reduce((acc, b) => acc + (b.click_count || 0), 0);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-amber-500" />
          <Library className="w-8 h-8 text-amber-500" />
          <h1 className="text-2xl font-mono uppercase tracking-wider">
            Librarian Agent
          </h1>
        </div>
        <p className="text-sm text-muted-foreground font-mono">
          Book curation, discovery, and analytics management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Total</span>
            </div>
            <div className="text-2xl font-mono text-foreground">{totalBooks}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Published</span>
            </div>
            <div className="text-2xl font-mono text-logo-green">{publishedBooks}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Drafts</span>
            </div>
            <div className="text-2xl font-mono text-amber-500">{draftBooks}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Views</span>
            </div>
            <div className="text-2xl font-mono text-foreground">{totalViews}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Clicks</span>
            </div>
            <div className="text-2xl font-mono text-foreground">{totalClicks}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="books" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="books" className="font-mono text-xs uppercase">
            <BookOpen className="w-3 h-3 mr-1.5" />
            Books ({totalBooks})
          </TabsTrigger>
          <TabsTrigger value="discovery" className="font-mono text-xs uppercase">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Discovery ({discoveryQueue.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="font-mono text-xs uppercase">
            <Library className="w-3 h-3 mr-1.5" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="runs" className="font-mono text-xs uppercase">
            <Clock className="w-3 h-3 mr-1.5" />
            Agent Runs
          </TabsTrigger>
        </TabsList>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono text-sm bg-card border-border"
              />
            </div>
            <Dialog open={isAddingBook} onOpenChange={setIsAddingBook}>
              <DialogTrigger asChild>
                <Button className="font-mono text-xs uppercase bg-logo-green text-background hover:bg-logo-green/80">
                  <Plus className="w-3 h-3 mr-1.5" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-mono uppercase">Add New Book</DialogTitle>
                </DialogHeader>
                <BookForm
                  categories={categories}
                  onSubmit={(data) => addBookMutation.mutate(data)}
                  isLoading={addBookMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {loadingBooks ? (
            <div className="text-center py-8 text-muted-foreground font-mono">Loading...</div>
          ) : (
            <div className="border border-border bg-card/30">
              <table className="w-full">
                <thead className="border-b border-border bg-card/50">
                  <tr>
                    <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Book</th>
                    <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Category</th>
                    <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Stats</th>
                    <th className="text-right p-3 font-mono text-xs uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="border-b border-border/50 hover:bg-card/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {book.cover_url && (
                            <img
                              src={book.cover_url}
                              alt={book.title}
                              className="w-10 h-14 object-cover border border-border"
                            />
                          )}
                          <div>
                            <div className="font-mono text-sm text-foreground">{book.title}</div>
                            <div className="text-xs text-muted-foreground">{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-mono text-muted-foreground">
                          {getCategoryName(book.category_id)}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={book.status === "published" ? "default" : "secondary"}
                          className={book.status === "published" ? "bg-logo-green/20 text-logo-green" : ""}
                        >
                          {book.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-xs font-mono text-muted-foreground">
                          <span>{book.view_count || 0} views</span>
                          <span className="mx-1">·</span>
                          <span>{book.click_count || 0} clicks</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateBookMutation.mutate({
                                id: book.id,
                                status: book.status === "published" ? "draft" : "published",
                              })
                            }
                          >
                            {book.status === "published" ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingBook(book)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="font-mono uppercase">Edit Book</DialogTitle>
                              </DialogHeader>
                              <BookForm
                                categories={categories}
                                initialData={book}
                                onSubmit={(data) => updateBookMutation.mutate({ ...data, id: book.id })}
                                isLoading={updateBookMutation.isPending}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-crimson hover:text-crimson"
                            onClick={() => {
                              if (confirm("Delete this book?")) {
                                deleteBookMutation.mutate(book.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Discovery Tab */}
        <TabsContent value="discovery" className="space-y-4">
          <Card className="border-border bg-card/30">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Pending Discoveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {discoveryQueue.length === 0 ? (
                <p className="text-muted-foreground text-sm font-mono">No pending discoveries</p>
              ) : (
                <div className="space-y-3">
                  {discoveryQueue.map((item) => (
                    <div key={item.id} className="p-3 border border-border bg-background/50 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.author} · {item.suggested_category}
                        </div>
                        {item.discovery_reason && (
                          <div className="text-xs text-amber-500 mt-1">{item.discovery_reason}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-logo-green">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-crimson">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const bookCount = books.filter((b) => b.category_id === category.id).length;
              return (
                <Card key={category.id} className="border-border bg-card/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{category.icon}</span>
                      <h3 className="font-mono text-sm uppercase">{category.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
                    <Badge variant="secondary">{bookCount} books</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Agent Runs Tab */}
        <TabsContent value="runs" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm uppercase text-muted-foreground">Recent Agent Runs</h3>
            <Button variant="outline" size="sm" className="font-mono text-xs">
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Trigger Discovery
            </Button>
          </div>
          
          {agentRuns.length === 0 ? (
            <Card className="border-border bg-card/30">
              <CardContent className="p-8 text-center">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground font-mono text-sm">No agent runs yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {agentRuns.map((run) => (
                <Card key={run.id} className="border-border bg-card/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs uppercase">
                          {run.run_type}
                        </Badge>
                        <Badge
                          variant={run.status === "completed" ? "default" : run.status === "failed" ? "destructive" : "secondary"}
                        >
                          {run.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {format(new Date(run.started_at), "MMM d, yyyy HH:mm")}
                        {run.finished_at && ` · ${Math.round((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s`}
                      </div>
                    </div>
                    <div className="text-right text-xs font-mono text-muted-foreground">
                      <div>{run.books_processed} processed</div>
                      <div>{run.books_discovered} discovered</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Book Form Component
interface BookFormProps {
  categories: BookCategory[];
  initialData?: Partial<Book>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const BookForm = ({ categories, initialData, onSubmit, isLoading }: BookFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    author: initialData?.author || "",
    category_id: initialData?.category_id || "",
    cover_url: initialData?.cover_url || "",
    description: initialData?.description || "",
    why_read: initialData?.why_read || "",
    purchase_url: initialData?.purchase_url || "",
    year_published: initialData?.year_published?.toString() || "",
    status: initialData?.status || "draft",
    is_featured: initialData?.is_featured || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      year_published: formData.year_published ? parseInt(formData.year_published) : null,
      category_id: formData.category_id || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Author *</label>
          <Input
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Category</label>
          <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
            <SelectTrigger className="font-mono">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Year Published</label>
          <Input
            type="number"
            value={formData.year_published}
            onChange={(e) => setFormData({ ...formData, year_published: e.target.value })}
            className="font-mono"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Cover Image URL</label>
        <Input
          value={formData.cover_url}
          onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
          className="font-mono"
        />
      </div>

      <div>
        <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Purchase URL</label>
        <Input
          value={formData.purchase_url}
          onChange={(e) => setFormData({ ...formData, purchase_url: e.target.value })}
          className="font-mono"
        />
      </div>

      <div>
        <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="font-mono"
        />
      </div>

      <div>
        <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Why Read</label>
        <Textarea
          value={formData.why_read}
          onChange={(e) => setFormData({ ...formData, why_read: e.target.value })}
          rows={2}
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Status</label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full font-mono uppercase">
        {isLoading ? "Saving..." : initialData ? "Update Book" : "Add Book"}
      </Button>
    </form>
  );
};

export default LibrarianAgentAdmin;
