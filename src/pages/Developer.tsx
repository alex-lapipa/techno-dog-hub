import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Copy, Key, Plus, Trash2, Eye, EyeOff, AlertTriangle, Activity, Zap, Search, FileText, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  total_requests: number;
}

const BASE_URL = 'https://bshyeweljerupobpmmes.supabase.co/functions/v1';

export default function Developer() {
  const { user, loading: authLoading } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('Default API Key');
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const fetchKeys = async () => {
    if (!user) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await supabase.functions.invoke('api-keys', {
        method: 'GET',
      });

      if (response.error) throw response.error;
      setKeys(response.data.keys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchKeys();
    }
  }, [user]);

  const createKey = async () => {
    setCreating(true);
    try {
      const response = await supabase.functions.invoke('api-keys', {
        method: 'POST',
        body: { name: newKeyName },
      });

      if (response.error) throw response.error;

      setNewApiKey(response.data.apiKey);
      setShowNewKeyDialog(true);
      setNewKeyName('Default API Key');
      await fetchKeys();
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    try {
      const { error } = await supabase.functions.invoke(`api-keys?id=${keyId}`, {
        method: 'DELETE',
      });

      if (error) throw error;

      await fetchKeys();
      toast.success('API key revoked');
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Developer Access
            </CardTitle>
            <CardDescription>
              Sign in to manage your API keys and access the techno.dog API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeKey = keys.find(k => k.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">TECHNO.DOG Developer API</h1>
          <p className="text-muted-foreground mt-2">
            AI-ready knowledge access. No ads. No scraping. No bullshit.
          </p>
        </div>

        <Tabs defaultValue="keys" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-8">
            {/* Rate Limits Overview */}
            {activeKey && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Zap className="h-4 w-4" />
                      Rate Limit
                    </div>
                    <div className="text-2xl font-bold">{activeKey.rate_limit_per_minute}/min</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Activity className="h-4 w-4" />
                      Daily Limit
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(activeKey.rate_limit_per_day)}/day</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Key className="h-4 w-4" />
                      Total Requests
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(activeKey.total_requests)}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Create New Key */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create API Key</CardTitle>
                <CardDescription>
                  Generate a new API key. Only one active key per user.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="My API Key"
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={createKey} disabled={creating}>
                    <Plus className="h-4 w-4 mr-2" />
                    {creating ? 'Creating...' : 'Create Key'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Keys List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : keys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No API keys yet. Create one to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {keys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{key.name}</span>
                            <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                              {key.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">{key.prefix}...</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Created: {formatDate(key.created_at)}
                            {key.last_used_at && ` • Last used: ${formatDate(key.last_used_at)}`}
                          </div>
                        </div>
                        {key.status === 'active' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will immediately revoke the key. Applications using this key will stop working.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => revokeKey(key.id)}>Revoke</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-8">
            {/* Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  All API requests require an API key in the Authorization header.
                </p>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  🔐 Keys are shown once at creation time. Store them securely.
                </p>
              </CardContent>
            </Card>

            {/* Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Core Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ping */}
                <div className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/api-v1-ping</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Test your API key connection.</p>
                </div>

                {/* Search */}
                <div className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/api-v1-search</code>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Search across the knowledge base.</p>
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Query Parameters:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li><code>q</code> — Search query (required)</li>
                      <li><code>limit</code> — Max results (default: 10, max: 50)</li>
                      <li><code>tags</code> — Comma-separated tag filters</li>
                      <li><code>types</code> — Document types (article, gear, artist, release)</li>
                      <li><code>cursor</code> — Pagination cursor</li>
                      <li><code>updated_after</code> — ISO datetime filter</li>
                    </ul>
                  </div>
                </div>

                {/* Docs */}
                <div className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/api-v1-docs?docId=&#123;docId&#125;</code>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Retrieve canonical document content.</p>
                  <div className="bg-muted/50 p-3 rounded text-xs">
                    <p className="font-medium mb-1">AI / RAG Notes:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Use <code>content.text</code> for embeddings</li>
                      <li>IDs are stable across updates</li>
                    </ul>
                  </div>
                </div>

                {/* Chunks */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/api-v1-chunks?docId=&#123;docId&#125;</code>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Returns document content split into chunks for RAG ingestion.</p>
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Query Parameters:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li><code>docId</code> — Document ID (required)</li>
                      <li><code>chunkSize</code> — Target chunk size (default: 500, max: 2000)</li>
                      <li><code>cursor</code> — Pagination cursor</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Handling */}
            <Card>
              <CardHeader>
                <CardTitle>Error Handling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">All errors return structured JSON:</p>
                <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`{
  "error": {
    "code": "unauthorized",
    "message": "Missing or invalid API key.",
    "requestId": "req_01J8F..."
  }
}`}</pre>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><Badge variant="outline">401</Badge> Unauthorized</div>
                  <div><Badge variant="outline">404</Badge> Not found</div>
                  <div><Badge variant="outline">429</Badge> Rate limited</div>
                  <div><Badge variant="outline">400</Badge> Bad request</div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Per Minute</p>
                    <p className="text-muted-foreground">60 requests</p>
                  </div>
                  <div>
                    <p className="font-medium">Per Day</p>
                    <p className="text-muted-foreground">10,000 requests</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate limit headers included in all responses: <code className="bg-muted px-1 rounded">X-RateLimit-Limit</code>, <code className="bg-muted px-1 rounded">X-RateLimit-Remaining</code>, <code className="bg-muted px-1 rounded">X-RateLimit-Reset</code>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-8">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Test your key with a simple ping</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`curl ${BASE_URL}/api-v1-ping \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                </div>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => copyToClipboard(`curl ${BASE_URL}/api-v1-ping -H "Authorization: Bearer YOUR_API_KEY"`)}>
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </CardContent>
            </Card>

            {/* Search Example */}
            <Card>
              <CardHeader>
                <CardTitle>Search Knowledge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`curl "${BASE_URL}/api-v1-search?q=roland+acid&limit=5" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                </div>
                <p className="text-sm font-medium">Response:</p>
                <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`{
  "query": "roland acid",
  "results": [
    {
      "docId": "gear_tb303",
      "title": "Roland TB-303",
      "snippet": "The TB-303 defined acid techno...",
      "type": "gear",
      "tags": ["acid", "roland", "synth"],
      "score": 0.92,
      "updatedAt": "2024-12-01T10:12:00Z",
      "url": "https://techno.dog/gear/tb-303"
    }
  ],
  "nextCursor": null
}`}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Document Example */}
            <Card>
              <CardHeader>
                <CardTitle>Retrieve Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`curl "${BASE_URL}/api-v1-docs?docId=gear_tb303" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                </div>
                <p className="text-sm font-medium">Response:</p>
                <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`{
  "doc": {
    "docId": "gear_tb303",
    "type": "gear",
    "title": "Roland TB-303",
    "tags": ["acid", "synth"],
    "updatedAt": "2024-12-01T10:12:00Z",
    "content": {
      "text": "The Roland TB-303 is a monophonic bass synthesizer..."
    },
    "metadata": {
      "source_url": "https://techno.dog/gear/tb-303",
      "license": "TECHNO.DOG Knowledge License"
    }
  }
}`}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Chunks Example */}
            <Card>
              <CardHeader>
                <CardTitle>RAG-Optimized Chunks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`curl "${BASE_URL}/api-v1-chunks?docId=gear_tb303" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                </div>
                <p className="text-sm font-medium">Response:</p>
                <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`{
  "docId": "gear_tb303",
  "chunks": [
    {
      "chunkId": "gear_tb303_001",
      "index": 0,
      "text": "The TB-303 was released in 1982..."
    }
  ],
  "nextCursor": null
}`}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Usage Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  <li>Cache results when possible</li>
                  <li>Do not scrape HTML pages — use the API</li>
                  <li>Respect rate limits</li>
                  <li>Do not redistribute raw content without permission</li>
                  <li>Use stable IDs for deduplication</li>
                </ul>
              </CardContent>
            </Card>

            {/* Designed for AI */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Designed for AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">This API is intentionally built for:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• RAG pipelines</div>
                  <div>• AI copilots</div>
                  <div>• Research agents</div>
                  <div>• Knowledge graph builders</div>
                </div>
                <p className="text-sm mt-4 font-medium">Clean text. Stable IDs. No markup chaos.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Key Dialog */}
        <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Your New API Key
              </DialogTitle>
              <DialogDescription>
                Copy this key now. It will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="relative">
                <Input
                  value={newApiKey || ''}
                  readOnly
                  type={showKey ? 'text' : 'password'}
                  className="font-mono pr-20"
                />
                <div className="absolute right-1 top-1 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newApiKey || '')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
                Store this key securely. You won't be able to see it again.
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => {
                setShowNewKeyDialog(false);
                setNewApiKey(null);
                setShowKey(false);
              }}>
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
