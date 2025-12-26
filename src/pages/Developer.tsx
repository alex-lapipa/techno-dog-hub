import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContentSyncPanel } from '@/components/ContentSyncPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Copy, Key, Plus, Trash2, Eye, EyeOff, AlertTriangle, Activity, Zap, Search, FileText, Layers, Webhook, RefreshCw, CheckCircle, XCircle, Pause, Play, BarChart3, Globe, Code, Database, Palette, Shield, Bot, Rocket, ChevronLeft } from 'lucide-react';
import ApiUsageAnalytics from '@/components/ApiUsageAnalytics';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  failure_count: number;
  last_triggered_at: string | null;
  last_success_at: string | null;
  created_at: string;
}

const BASE_URL = 'https://bshyeweljerupobpmmes.supabase.co/functions/v1';
const AVAILABLE_EVENTS = [
  { id: 'content.updated', label: 'Content Updated', description: 'When existing content is modified' },
  { id: 'content.created', label: 'Content Created', description: 'When new content is added' },
  { id: 'content.deleted', label: 'Content Deleted', description: 'When content is removed' },
];

export default function Developer() {
  const { user, loading: authLoading } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [webhooksLoading, setWebhooksLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [newKeyName, setNewKeyName] = useState('Default API Key');
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  
  // Webhook form state
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['content.updated']);
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);
  const [showWebhookSecretDialog, setShowWebhookSecretDialog] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

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

  const fetchWebhooks = async () => {
    if (!user) return;
    
    try {
      const response = await supabase.functions.invoke('api-webhooks', {
        method: 'GET',
      });

      if (response.error) throw response.error;
      setWebhooks(response.data.webhooks || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setWebhooksLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchKeys();
      fetchWebhooks();
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

  const createWebhook = async () => {
    if (!webhookUrl) {
      toast.error('URL is required');
      return;
    }

    setCreatingWebhook(true);
    try {
      const response = await supabase.functions.invoke('api-webhooks', {
        method: 'POST',
        body: { 
          name: webhookName || 'My Webhook',
          url: webhookUrl,
          events: webhookEvents
        },
      });

      if (response.error) throw response.error;

      setNewWebhookSecret(response.data.secret);
      setShowWebhookDialog(false);
      setShowWebhookSecretDialog(true);
      setWebhookName('');
      setWebhookUrl('');
      setWebhookEvents(['content.updated']);
      await fetchWebhooks();
      toast.success('Webhook created successfully');
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error('Failed to create webhook');
    } finally {
      setCreatingWebhook(false);
    }
  };

  const toggleWebhookStatus = async (webhook: WebhookData) => {
    try {
      const newStatus = webhook.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase.functions.invoke(`api-webhooks?id=${webhook.id}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });

      if (error) throw error;

      await fetchWebhooks();
      toast.success(`Webhook ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast.error('Failed to update webhook');
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase.functions.invoke(`api-webhooks?id=${webhookId}`, {
        method: 'DELETE',
      });

      if (error) throw error;

      await fetchWebhooks();
      toast.success('Webhook deleted');
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Failed to delete webhook');
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

  const toggleEvent = (eventId: string) => {
    setWebhookEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Platform documentation content (shown to all users)
  const PlatformDocs = () => (
    <div className="space-y-6">
      {/* Download link */}
      <div className="p-4 border border-border bg-card rounded-lg">
        <a 
          href="/project-documentation.txt" 
          download 
          className="inline-flex items-center gap-2 font-mono text-sm text-primary hover:underline"
        >
          <FileText className="w-4 h-4" />
          Download full documentation as TXT file
        </a>
      </div>

      {/* Content Sync Panel - Admin only */}
      <ContentSyncPanel />

      <Accordion type="multiple" className="space-y-4">
        {/* Project Overview */}
        <AccordionItem value="overview" className="border border-border rounded-lg px-6 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-mono text-lg">Project Overview</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
            <p>
              The <strong className="text-foreground">Global Techno Encyclopedia</strong> is a comprehensive digital archive 
              dedicated to underground techno culture worldwide.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">Target Audience</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Techno enthusiasts and collectors</li>
                  <li>DJs and producers</li>
                  <li>Music journalists and researchers</li>
                  <li>Festival-goers and event organizers</li>
                </ul>
              </div>
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">Core Philosophy</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Accept only real techno: driving, hypnotic, raw</li>
                  <li>No EDM, hardstyle, or commercial schlag</li>
                  <li>From Detroit to Tbilisi, Tokyo to Bogotá</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Technology Stack */}
        <AccordionItem value="tech-stack" className="border border-border rounded-lg px-6 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-primary" />
              <span className="font-mono text-lg">Technology Stack</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">Frontend</h4>
                <ul className="space-y-1">
                  <li>• React 18.3.1 + TypeScript</li>
                  <li>• Vite (build tool)</li>
                  <li>• React Router DOM v6</li>
                  <li>• TanStack React Query</li>
                </ul>
              </div>
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">Styling</h4>
                <ul className="space-y-1">
                  <li>• Tailwind CSS</li>
                  <li>• shadcn/ui components</li>
                  <li>• Lucide React icons</li>
                </ul>
              </div>
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">Backend</h4>
                <ul className="space-y-1">
                  <li>• Lovable Cloud</li>
                  <li>• PostgreSQL + pgvector</li>
                  <li>• Edge Functions (Deno)</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Data Architecture */}
        <AccordionItem value="data" className="border border-border rounded-lg px-6 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-primary" />
              <span className="font-mono text-lg">Data Architecture</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
            <p>
              All content data is stored as TypeScript modules in <code className="text-foreground bg-muted px-1 rounded">/src/data/</code>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">artists.ts</h4>
                <p className="text-xs">Artist profiles with origin, genres, labels, bio</p>
              </div>
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">labels.ts</h4>
                <p className="text-xs">Record labels with founding year, city, genres</p>
              </div>
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">venues.ts</h4>
                <p className="text-xs">Clubs and spaces with capacity, residents</p>
              </div>
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">festivals.ts</h4>
                <p className="text-xs">Festivals with stages, capacity, lineups</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* AI Chat Integration */}
        <AccordionItem value="ai" className="border border-border rounded-lg px-6 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-mono text-lg">AI Chat Integration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
            <p>
              The <strong className="text-foreground">TechnoChat</strong> component provides AI-powered 
              responses using Retrieval-Augmented Generation (RAG).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">Features</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Floating chat button</li>
                  <li>Message history</li>
                  <li>Streaming responses</li>
                </ul>
              </div>
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">Knowledge Base</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Festival information</li>
                  <li>Artist bios</li>
                  <li>Venue histories</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 md:px-8 py-12 max-w-5xl">
          {/* Breadcrumb */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2 font-mono">
              // Developers
            </div>
            <h1 className="text-3xl font-bold tracking-tight font-mono uppercase">TECHNO.DOG DEVELOPERS</h1>
            <p className="text-muted-foreground mt-2 font-mono text-sm">
              Platform documentation and API access for the Global Techno Knowledge Hub.
            </p>
          </div>

          <Tabs defaultValue="platform" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
              <TabsTrigger value="platform">Platform</TabsTrigger>
              <TabsTrigger value="api">API Access</TabsTrigger>
            </TabsList>

            <TabsContent value="platform" className="space-y-8">
              <PlatformDocs />
            </TabsContent>

            <TabsContent value="api" className="space-y-8">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Developer API Access
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
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    );
  }

  const activeKey = keys.find(k => k.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2 font-mono">
            // Developers
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-mono uppercase">TECHNO.DOG DEVELOPERS</h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">
            Platform documentation and API access. AI-ready data on artists, venues, festivals, labels, and more.
          </p>
        </div>

        <Tabs defaultValue="platform" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 lg:w-[700px]">
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="docs">API Docs</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Platform Tab */}
          <TabsContent value="platform" className="space-y-8">
            <PlatformDocs />
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-8">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create API Key</CardTitle>
                <CardDescription>Only one active key per user.</CardDescription>
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
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : keys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No API keys yet.</div>
                ) : (
                  <div className="space-y-4">
                    {keys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{key.name}</span>
                            <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>{key.status}</Badge>
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
                                <Trash2 className="h-4 w-4 mr-1" />Revoke
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                                <AlertDialogDescription>Applications using this key will stop working.</AlertDialogDescription>
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <ApiUsageAnalytics />
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhooks
                </CardTitle>
                <CardDescription>
                  Receive real-time notifications when content is updated.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowWebhookDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                {webhooksLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : webhooks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No webhooks configured.</div>
                ) : (
                  <div className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{webhook.name}</span>
                              <Badge variant={
                                webhook.status === 'active' ? 'default' : 
                                webhook.status === 'failed' ? 'destructive' : 'secondary'
                              }>
                                {webhook.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {webhook.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                {webhook.status === 'paused' && <Pause className="h-3 w-3 mr-1" />}
                                {webhook.status}
                              </Badge>
                              {webhook.failure_count > 0 && webhook.status !== 'failed' && (
                                <Badge variant="outline" className="text-amber-600">
                                  {webhook.failure_count} failures
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono truncate max-w-md">
                              {webhook.url}
                            </div>
                            <div className="flex gap-2 mt-2">
                              {webhook.events.map(event => (
                                <Badge key={event} variant="outline" className="text-xs">
                                  {event}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Created: {formatDate(webhook.created_at)}
                              {webhook.last_success_at && ` • Last success: ${formatDate(webhook.last_success_at)}`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleWebhookStatus(webhook)}
                            >
                              {webhook.status === 'active' ? (
                                <><Pause className="h-4 w-4 mr-1" />Pause</>
                              ) : (
                                <><Play className="h-4 w-4 mr-1" />Activate</>
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteWebhook(webhook.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Webhook Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Webhook Payload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Each webhook delivery includes an HMAC-SHA256 signature for verification.
                </p>
                <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`Headers:
X-Webhook-Signature: t=1234567890,v1=abc123...
X-Webhook-ID: evt_01J8F...
Content-Type: application/json

Body:
{
  "id": "evt_01J8F...",
  "type": "content.updated",
  "created": "2025-01-01T12:00:00Z",
  "data": {
    "entity_type": "artist",
    "entity_id": "jeff-mills",
    "title": "Jeff Mills",
    "changes": ["bio", "photo"]
  }
}`}</pre>
                </div>
                <div className="text-sm space-y-2">
                  <p className="font-medium">Signature Verification:</p>
                  <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{`// Extract timestamp and signature
const [t, v1] = signature.split(',').map(p => p.split('=')[1]);

// Compute expected signature
const payload = t + '.' + JSON.stringify(body);
const expected = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

// Compare signatures
if (expected === v1) {
  // Valid signature
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">All API requests require an API key.</p>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Core Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/api-v1-ping</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Test your API key.</p>
                </div>

                <div className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/api-v1-search?q=...</code>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Search the knowledge base.</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li><code>q</code> — Search query (required)</li>
                    <li><code>limit</code> — Max results (default: 10, max: 50)</li>
                    <li><code>tags</code> — Comma-separated filters</li>
                    <li><code>types</code> — article, gear, artist, release</li>
                  </ul>
                </div>

                <div className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/api-v1-docs?docId=...</code>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Retrieve document content.</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/api-v1-chunks?docId=...</code>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">RAG-optimized chunks.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><Badge variant="outline">401</Badge> Unauthorized</div>
                  <div><Badge variant="outline">404</Badge> Not found</div>
                  <div><Badge variant="outline">429</Badge> Rate limited</div>
                  <div><Badge variant="outline">400</Badge> Bad request</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Search Example</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`curl "${BASE_URL}/api-v1-search?q=roland+acid&limit=5" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Designed for AI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• RAG pipelines</div>
                  <div>• AI copilots</div>
                  <div>• Research agents</div>
                  <div>• Knowledge graphs</div>
                </div>
                <p className="text-sm mt-4 font-medium">Clean text. Stable IDs. No markup chaos.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New API Key Dialog */}
        <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Your New API Key
              </DialogTitle>
              <DialogDescription>Copy this key now. It will not be shown again.</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="relative">
                <Input value={newApiKey || ''} readOnly type={showKey ? 'text' : 'password'} className="font-mono pr-20" />
                <div className="absolute right-1 top-1 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newApiKey || '')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">Store securely.</p>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => { setShowNewKeyDialog(false); setNewApiKey(null); setShowKey(false); }}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>Receive notifications when content changes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="webhookName">Name</Label>
                <Input
                  id="webhookName"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  placeholder="My Webhook"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="webhookUrl">Endpoint URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="mb-3 block">Events</Label>
                <div className="space-y-3">
                  {AVAILABLE_EVENTS.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <Checkbox
                        id={event.id}
                        checked={webhookEvents.includes(event.id)}
                        onCheckedChange={() => toggleEvent(event.id)}
                      />
                      <div className="grid gap-1 leading-none">
                        <label htmlFor={event.id} className="text-sm font-medium cursor-pointer">
                          {event.label}
                        </label>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button>
              <Button onClick={createWebhook} disabled={creatingWebhook || !webhookUrl}>
                {creatingWebhook ? 'Creating...' : 'Create Webhook'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Webhook Secret Dialog */}
        <Dialog open={showWebhookSecretDialog} onOpenChange={setShowWebhookSecretDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Webhook Signing Secret
              </DialogTitle>
              <DialogDescription>Save this secret to verify webhook signatures.</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="relative">
                <Input value={newWebhookSecret || ''} readOnly type={showSecret ? 'text' : 'password'} className="font-mono pr-20" />
                <div className="absolute right-1 top-1 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setShowSecret(!showSecret)}>
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newWebhookSecret || '')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
                This secret will not be shown again. Use it to verify webhook signatures.
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => { setShowWebhookSecretDialog(false); setNewWebhookSecret(null); setShowSecret(false); }}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
