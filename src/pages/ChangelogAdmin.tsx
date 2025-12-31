import { useState, useMemo } from 'react';
import { FileText, Plus, Search, Filter, GitBranch, Calendar, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  useChangelogEntries, 
  useChangelogByVersion, 
  useCreateChangelog,
  CHANGELOG_SCOPES,
  CATEGORY_META,
  ChangelogCategory,
  ChangelogEntry 
} from '@/hooks/useChangelog';
import { format } from 'date-fns';

/**
 * Changelog Admin Page
 * 
 * Following Keep a Changelog standard:
 * - Grouped by version
 * - Categories: Added, Changed, Deprecated, Removed, Fixed, Security
 * - Full-text search
 * - Mermaid diagram support
 */
const ChangelogAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ChangelogCategory | 'all'>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state for new entry
  const [newEntry, setNewEntry] = useState({
    version: '0.1.0',
    category: 'added' as ChangelogCategory,
    scope: 'doggies',
    title: '',
    description: '',
    diagram_code: '',
    files_changed: '',
    is_breaking_change: false,
  });
  
  const { data: entries, isLoading, refetch } = useChangelogEntries({
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    scope: scopeFilter === 'all' ? undefined : scopeFilter,
    search: searchQuery || undefined,
  });
  
  const { data: groupedEntries } = useChangelogByVersion();
  const createChangelog = useCreateChangelog();
  
  // Group entries by date for timeline view
  const entriesByDate = useMemo(() => {
    if (!entries) return {};
    return entries.reduce((acc, entry) => {
      const date = format(new Date(entry.created_at), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, ChangelogEntry[]>);
  }, [entries]);
  
  // Stats
  const stats = useMemo(() => {
    if (!entries) return { total: 0, added: 0, changed: 0, fixed: 0, breaking: 0 };
    return {
      total: entries.length,
      added: entries.filter(e => e.category === 'added').length,
      changed: entries.filter(e => e.category === 'changed').length,
      fixed: entries.filter(e => e.category === 'fixed').length,
      breaking: entries.filter(e => e.is_breaking_change).length,
    };
  }, [entries]);
  
  const handleCreateEntry = async () => {
    await createChangelog.mutateAsync({
      ...newEntry,
      files_changed: newEntry.files_changed.split(',').map(f => f.trim()).filter(Boolean),
    });
    setShowAddDialog(false);
    setNewEntry({
      version: '0.1.0',
      category: 'added',
      scope: 'doggies',
      title: '',
      description: '',
      diagram_code: '',
      files_changed: '',
      is_breaking_change: false,
    });
  };
  
  const renderEntry = (entry: ChangelogEntry) => {
    const meta = CATEGORY_META[entry.category];
    
    return (
      <div 
        key={entry.id} 
        className="p-4 border border-border/50 rounded-lg bg-background/50 hover:border-border transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className={meta.color}>
                {meta.icon} {meta.label}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                {entry.scope}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                v{entry.version}
              </Badge>
              {entry.is_breaking_change && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Breaking
                </Badge>
              )}
            </div>
            
            <h4 className="font-medium text-foreground mb-1">{entry.title}</h4>
            
            {entry.description && (
              <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
            )}
            
            {entry.files_changed.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.files_changed.slice(0, 5).map((file, i) => (
                  <code key={i} className="text-xs px-1.5 py-0.5 bg-muted rounded font-mono">
                    {file}
                  </code>
                ))}
                {entry.files_changed.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{entry.files_changed.length - 5} more
                  </span>
                )}
              </div>
            )}
            
            {entry.diagram_code && (
              <details className="mt-3">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  View Architecture Diagram
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto font-mono">
                  {entry.diagram_code}
                </pre>
              </details>
            )}
          </div>
          
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground font-mono">
              {format(new Date(entry.created_at), 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {entry.author}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <AdminPageLayout
      title="Changelog"
      description="Project change history following Keep a Changelog standard"
      icon={FileText}
      iconColor="text-logo-green"
      onRefresh={refetch}
      isLoading={isLoading}
      actions={
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="brutalist" className="font-mono text-xs uppercase">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase">Add Changelog Entry</DialogTitle>
              <DialogDescription>
                Document a change following the Keep a Changelog standard
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={newEntry.version}
                    onChange={(e) => setNewEntry(p => ({ ...p, version: e.target.value }))}
                    placeholder="0.1.0"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newEntry.category}
                    onValueChange={(v) => setNewEntry(p => ({ ...p, category: v as ChangelogCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_META).map(([key, meta]) => (
                        <SelectItem key={key} value={key}>
                          {meta.icon} {meta.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Select
                    value={newEntry.scope}
                    onValueChange={(v) => setNewEntry(p => ({ ...p, scope: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANGELOG_SCOPES.map((scope) => (
                        <SelectItem key={scope} value={scope}>
                          {scope}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(p => ({ ...p, title: e.target.value }))}
                  placeholder="Brief description of the change"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry(p => ({ ...p, description: e.target.value }))}
                  placeholder="Detailed explanation of the change..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="files">Files Changed (comma-separated)</Label>
                <Input
                  id="files"
                  value={newEntry.files_changed}
                  onChange={(e) => setNewEntry(p => ({ ...p, files_changed: e.target.value }))}
                  placeholder="src/hooks/useExample.ts, src/pages/Example.tsx"
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diagram">Mermaid Diagram (optional)</Label>
                <Textarea
                  id="diagram"
                  value={newEntry.diagram_code}
                  onChange={(e) => setNewEntry(p => ({ ...p, diagram_code: e.target.value }))}
                  placeholder="graph TD&#10;    A[Start] --> B[End]"
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="breaking"
                  checked={newEntry.is_breaking_change}
                  onCheckedChange={(v) => setNewEntry(p => ({ ...p, is_breaking_change: v }))}
                />
                <Label htmlFor="breaking" className="cursor-pointer">
                  Breaking Change
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateEntry}
                disabled={!newEntry.title || createChangelog.isPending}
              >
                Add Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-logo-green/10">
                <CheckCircle2 className="w-4 h-4 text-logo-green" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-logo-green">{stats.added}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Added</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <GitBranch className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-amber-500">{stats.changed}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Changed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Tag className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-blue-500">{stats.fixed}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Fixed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-destructive">{stats.breaking}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Breaking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search changelog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    {meta.icon} {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-[140px]">
                <Tag className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                {CHANGELOG_SCOPES.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {scope}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Changelog Entries */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="font-mono">
          <TabsTrigger value="timeline">
            <Calendar className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="version">
            <GitBranch className="w-4 h-4 mr-2" />
            By Version
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wide">
                Recent Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    Loading changelog...
                  </div>
                ) : entries?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <FileText className="w-8 h-8 mb-2 opacity-50" />
                    <p>No changelog entries yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(entriesByDate).map(([date, dayEntries]) => (
                      <div key={date}>
                        <div className="sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                          <h3 className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                            <Badge variant="secondary" className="ml-2">
                              {dayEntries.length} {dayEntries.length === 1 ? 'change' : 'changes'}
                            </Badge>
                          </h3>
                        </div>
                        <div className="space-y-3 mt-3">
                          {dayEntries.map(renderEntry)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="version">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wide">
                Changes by Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {groupedEntries && Object.keys(groupedEntries).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedEntries)
                      .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
                      .map(([version, versionEntries]) => (
                        <div key={version}>
                          <div className="sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                            <h3 className="text-lg font-mono font-bold flex items-center gap-2">
                              <GitBranch className="w-5 h-5 text-logo-green" />
                              v{version}
                              <Badge variant="secondary" className="ml-2">
                                {versionEntries.length} {versionEntries.length === 1 ? 'change' : 'changes'}
                              </Badge>
                            </h3>
                          </div>
                          <div className="space-y-3 mt-3">
                            {versionEntries.map(renderEntry)}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <GitBranch className="w-8 h-8 mb-2 opacity-50" />
                    <p>No versions documented yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default ChangelogAdmin;
