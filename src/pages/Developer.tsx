import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Key, Plus, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
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
}

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
      const response = await supabase.functions.invoke('api-keys', {
        method: 'DELETE',
        body: {},
        headers: {},
      });

      // Use query params for delete
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Developer API</h1>
          <p className="text-muted-foreground mt-2">
            Manage your API keys to access techno.dog programmatically.
          </p>
        </div>

        {/* Create New Key */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Create API Key</CardTitle>
            <CardDescription>
              Generate a new API key. Only one active key is allowed per user.
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
            <CardDescription>
              View and manage your existing API keys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading keys...</div>
            ) : keys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No API keys yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{key.name}</span>
                        <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                          {key.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {key.prefix}...
                      </div>
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
                              This will immediately revoke the key. Any applications using this key will stop working.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => revokeKey(key.id)}>
                              Revoke Key
                            </AlertDialogAction>
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

        {/* API Usage Example */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">API Usage</CardTitle>
            <CardDescription>
              Test your API key with the ping endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`curl -X GET \\
  'https://bshyeweljerupobpmmes.supabase.co/functions/v1/api-v1-ping' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`}</pre>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Replace <code className="bg-muted px-1 rounded">YOUR_API_KEY</code> with your actual API key.
            </p>
          </CardContent>
        </Card>

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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(newApiKey || '')}
                  >
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
