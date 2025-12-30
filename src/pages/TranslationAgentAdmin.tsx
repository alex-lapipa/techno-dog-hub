import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Languages, RefreshCw, Plus, Trash2, TestTube, CheckCircle, XCircle, Bot } from 'lucide-react';
import { AdminPageLayout } from '@/components/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GlossaryTerm {
  id: string;
  term: string;
  category: string;
  description: string | null;
  is_active: boolean;
}

interface AgentStats {
  totalProtectedTerms: number;
  categoryBreakdown: Record<string, number>;
  supportedLanguages: string[];
}

interface TestResult {
  original: string;
  translated: string;
  protectedTermsPreserved: string[];
  protectedTermsViolated: string[];
  targetLanguage: string;
}

const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'pt', label: 'Portuguese (Português)' },
  { value: 'it', label: 'Italian (Italiano)' },
  { value: 'ja', label: 'Japanese (日本語)' },
  { value: 'zh', label: 'Chinese (中文)' },
  { value: 'ko', label: 'Korean (한국어)' },
  { value: 'nl', label: 'Dutch (Nederlands)' },
  { value: 'pl', label: 'Polish (Polski)' },
];

const CATEGORY_OPTIONS = [
  { value: 'brand', label: 'Brand Identity' },
  { value: 'genre', label: 'Genres & Styles' },
  { value: 'gear', label: 'Gear & Equipment' },
  { value: 'technical', label: 'Technical Terms' },
  { value: 'city', label: 'Cities & Scenes' },
  { value: 'venue', label: 'Venues' },
  { value: 'festival', label: 'Festivals' },
  { value: 'label', label: 'Labels & Collectives' },
  { value: 'culture', label: 'Culture Terms' },
];

const TranslationAgentAdmin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New term form
  const [newTerm, setNewTerm] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Translation test
  const [testContent, setTestContent] = useState('');
  const [testLanguage, setTestLanguage] = useState('es');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  
  // Live translation
  const [translateContent, setTranslateContent] = useState('');
  const [translateLanguage, setTranslateLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translation-agent', {
        body: { action: 'status' }
      });
      
      if (error) throw error;
      if (data?.stats) setStats(data.stats);
      
      // Fetch glossary
      const glossaryResponse = await supabase.functions.invoke('translation-agent', {
        body: { action: 'glossary' }
      });
      
      if (glossaryResponse.data?.glossary) {
        setGlossary(glossaryResponse.data.glossary);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      toast.error('Failed to fetch agent status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAddTerm = async () => {
    if (!newTerm || !newCategory) {
      toast.error('Term and category are required');
      return;
    }
    
    setIsAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke('translation-agent', {
        body: { 
          action: 'add-term',
          term: newTerm,
          category: newCategory,
          description: newDescription || null
        }
      });
      
      if (error || !data?.success) throw new Error(data?.error || 'Failed to add term');
      
      toast.success(`Added "${newTerm}" to glossary`);
      setNewTerm('');
      setNewCategory('');
      setNewDescription('');
      fetchStatus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add term');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTerm = async (termId: string, termName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('translation-agent', {
        body: { action: 'remove-term', termId }
      });
      
      if (error || !data?.success) throw new Error(data?.error || 'Failed to remove term');
      
      toast.success(`Removed "${termName}" from glossary`);
      setGlossary(prev => prev.filter(t => t.id !== termId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove term');
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('translation-agent', {
        body: { 
          action: 'test',
          content: testContent || undefined,
          targetLanguage: testLanguage
        }
      });
      
      if (error) throw error;
      if (data?.test) setTestResult(data.test);
      
      if (data?.test?.protectedTermsViolated?.length > 0) {
        toast.warning(`${data.test.protectedTermsViolated.length} protected terms were translated!`);
      } else {
        toast.success('All protected terms preserved!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTranslate = async () => {
    if (!translateContent) {
      toast.error('Enter content to translate');
      return;
    }
    
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translation-agent', {
        body: { 
          action: 'translate',
          content: translateContent,
          targetLanguage: translateLanguage
        }
      });
      
      if (error) throw error;
      if (data?.translated) {
        setTranslatedContent(data.translated);
        toast.success('Translation complete');
      }
    } catch (error: any) {
      toast.error(error.message || 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredGlossary = glossary.filter(term => {
    const matchesCategory = filterCategory === 'all' || term.category === filterCategory;
    const matchesSearch = !searchTerm || 
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AdminPageLayout
      title="TRANSLATION AGENT"
      description="AI-powered multilingual translation with protected terminology"
      icon={Languages}
      iconColor="text-blue-400"
      onRefresh={fetchStatus}
      isLoading={isLoading}
      actions={
        <Button onClick={fetchStatus} variant="outline" size="sm" className="font-mono text-xs">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-mono text-logo-green">{stats?.totalProtectedTerms || 0}</div>
            <div className="text-xs text-muted-foreground">Protected Terms</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-mono text-blue-400">{stats?.supportedLanguages?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Languages</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-mono text-purple-400">{Object.keys(stats?.categoryBreakdown || {}).length}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-logo-green" />
              <span className="text-sm font-mono text-logo-green">Gemini 2.5</span>
            </div>
            <div className="text-xs text-muted-foreground">AI Model</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="glossary" className="space-y-4">
        <TabsList className="bg-card/50">
          <TabsTrigger value="glossary">Protected Glossary</TabsTrigger>
          <TabsTrigger value="test">Test Translation</TabsTrigger>
          <TabsTrigger value="translate">Live Translate</TabsTrigger>
        </TabsList>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="space-y-4">
          {/* Add New Term */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Protected Term
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  placeholder="Term (e.g., Berghain)"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="font-mono"
                />
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <Button onClick={handleAddTerm} disabled={isAdding || !newTerm || !newCategory}>
                  {isAdding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Term
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Glossary Table */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-sm font-mono">
                  Protected Terms ({filteredGlossary.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48 h-8 text-xs"
                  />
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono text-xs">Term</TableHead>
                      <TableHead className="font-mono text-xs">Category</TableHead>
                      <TableHead className="font-mono text-xs">Description</TableHead>
                      <TableHead className="font-mono text-xs w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGlossary.map((term) => (
                      <TableRow key={term.id}>
                        <TableCell className="font-mono font-medium">{term.term}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {term.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {term.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTerm(term.id, term.term)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Test Protected Term Preservation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-3">
                  <Textarea
                    placeholder="Enter test content (leave empty for default test)"
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Select value={testLanguage} onValueChange={setTestLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleTest} disabled={isTesting} className="w-full">
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <TestTube className="w-4 h-4 mr-2" />}
                    Run Test
                  </Button>
                </div>
              </div>

              {testResult && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-mono text-muted-foreground mb-2">ORIGINAL</div>
                      <div className="p-3 bg-background/50 rounded text-sm">{testResult.original}</div>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-muted-foreground mb-2">
                        TRANSLATED ({testResult.targetLanguage.toUpperCase()})
                      </div>
                      <div className="p-3 bg-background/50 rounded text-sm">{testResult.translated}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-logo-green mb-2">
                        <CheckCircle className="w-4 h-4" />
                        PRESERVED ({testResult.protectedTermsPreserved.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {testResult.protectedTermsPreserved.map((term, i) => (
                          <Badge key={i} variant="outline" className="text-logo-green border-logo-green/50">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-destructive mb-2">
                        <XCircle className="w-4 h-4" />
                        VIOLATED ({testResult.protectedTermsViolated.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {testResult.protectedTermsViolated.length > 0 ? (
                          testResult.protectedTermsViolated.map((term, i) => (
                            <Badge key={i} variant="destructive">{term}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">None - all terms protected!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Translate Tab */}
        <TabsContent value="translate" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Live Translation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-mono text-muted-foreground">SOURCE (English)</div>
                  <Textarea
                    placeholder="Enter content to translate..."
                    value={translateContent}
                    onChange={(e) => setTranslateContent(e.target.value)}
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-muted-foreground">TARGET</div>
                    <Select value={translateLanguage} onValueChange={setTranslateLanguage}>
                      <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    value={translatedContent}
                    readOnly
                    rows={6}
                    className="bg-background/50"
                    placeholder="Translation will appear here..."
                  />
                </div>
              </div>
              <Button onClick={handleTranslate} disabled={isTranslating || !translateContent}>
                {isTranslating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Languages className="w-4 h-4 mr-2" />}
                Translate
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default TranslationAgentAdmin;
