import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, Trash2, TestTube, Loader2, Check, X, MessageSquare, Webhook, Mail } from "lucide-react";
import { toast } from "sonner";

interface NotificationChannel {
  id: string;
  name: string;
  channel_type: 'discord' | 'slack' | 'email' | 'webhook';
  webhook_url: string | null;
  is_active: boolean;
  notify_on_severity: string[];
  notify_categories: string[];
  cooldown_minutes: number;
  last_notified_at: string | null;
  created_at: string;
}

const SEVERITY_OPTIONS = ['critical', 'error', 'warning', 'info'];
const CATEGORY_OPTIONS = ['operations', 'security', 'content', 'data'];

export default function NotificationChannels() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [newChannel, setNewChannel] = useState<{
    name: string;
    channel_type: 'discord' | 'slack' | 'email' | 'webhook';
    webhook_url: string;
    notify_on_severity: string[];
    notify_categories: string[];
    cooldown_minutes: number;
  }>({
    name: '',
    channel_type: 'discord',
    webhook_url: '',
    notify_on_severity: ['critical', 'error'],
    notify_categories: ['operations', 'security'],
    cooldown_minutes: 15,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchChannels();
    }
  }, [isAdmin]);

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from('notification_channels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load channels');
    } else {
      setChannels((data || []) as NotificationChannel[]);
    }
    setLoading(false);
  };

  const createChannel = async () => {
    if (!newChannel.name || !newChannel.webhook_url) {
      toast.error('Name and webhook URL are required');
      return;
    }

    const { error } = await supabase
      .from('notification_channels')
      .insert({
        name: newChannel.name,
        channel_type: newChannel.channel_type,
        webhook_url: newChannel.webhook_url,
        notify_on_severity: newChannel.notify_on_severity,
        notify_categories: newChannel.notify_categories,
        cooldown_minutes: newChannel.cooldown_minutes,
      });

    if (error) {
      toast.error('Failed to create channel');
    } else {
      toast.success('Channel created');
      setDialogOpen(false);
      setNewChannel({
        name: '',
        channel_type: 'discord',
        webhook_url: '',
        notify_on_severity: ['critical', 'error'],
        notify_categories: ['operations', 'security'],
        cooldown_minutes: 15,
      });
      fetchChannels();
    }
  };

  const toggleChannel = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('notification_channels')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update channel');
    } else {
      setChannels(channels.map(c => c.id === id ? { ...c, is_active: isActive } : c));
    }
  };

  const deleteChannel = async (id: string) => {
    const { error } = await supabase
      .from('notification_channels')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete channel');
    } else {
      toast.success('Channel deleted');
      setChannels(channels.filter(c => c.id !== id));
    }
  };

  const testChannel = async (id: string) => {
    setTesting(id);
    try {
      const { data, error } = await supabase.functions.invoke('alert-dispatcher', {
        body: { action: 'test-channel', channelId: id },
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success('Test notification sent!');
      } else {
        toast.error(`Test failed: ${data.error}`);
      }
    } catch (error) {
      toast.error('Failed to send test');
    } finally {
      setTesting(null);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'discord':
        return <MessageSquare className="h-4 w-4" />;
      case 'slack':
        return <MessageSquare className="h-4 w-4" />;
      case 'webhook':
        return <Webhook className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
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
      <main className="container py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-mono font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notification Channels
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configure Discord, Slack, or webhook alerts for critical system events
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Notification Channel</DialogTitle>
                <DialogDescription>
                  Configure a new channel to receive system alerts
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Channel Name</Label>
                  <Input 
                    placeholder="e.g., Operations Discord"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Channel Type</Label>
                  <Select 
                    value={newChannel.channel_type}
                    onValueChange={(v: string) => setNewChannel({ ...newChannel, channel_type: v as 'discord' | 'slack' | 'email' | 'webhook' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="webhook">Generic Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input 
                    placeholder="https://discord.com/api/webhooks/..."
                    value={newChannel.webhook_url}
                    onChange={(e) => setNewChannel({ ...newChannel, webhook_url: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Notify on Severity</Label>
                  <div className="flex flex-wrap gap-2">
                    {SEVERITY_OPTIONS.map(severity => (
                      <Badge
                        key={severity}
                        variant={newChannel.notify_on_severity.includes(severity) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const updated = newChannel.notify_on_severity.includes(severity)
                            ? newChannel.notify_on_severity.filter(s => s !== severity)
                            : [...newChannel.notify_on_severity, severity];
                          setNewChannel({ ...newChannel, notify_on_severity: updated });
                        }}
                      >
                        {severity}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Notify on Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map(category => (
                      <Badge
                        key={category}
                        variant={newChannel.notify_categories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const updated = newChannel.notify_categories.includes(category)
                            ? newChannel.notify_categories.filter(c => c !== category)
                            : [...newChannel.notify_categories, category];
                          setNewChannel({ ...newChannel, notify_categories: updated });
                        }}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Cooldown (minutes)</Label>
                  <Input 
                    type="number"
                    min={1}
                    max={1440}
                    value={newChannel.cooldown_minutes}
                    onChange={(e) => setNewChannel({ ...newChannel, cooldown_minutes: parseInt(e.target.value) || 15 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum time between notifications to this channel
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={createChannel}>Create Channel</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {channels.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No notification channels configured</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Add a Discord or Slack webhook to receive alerts
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {channels.map(channel => (
              <Card key={channel.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded">
                        {getChannelIcon(channel.channel_type)}
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {channel.name}
                          <Badge variant="outline" className="text-xs font-normal">
                            {channel.channel_type}
                          </Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">
                          {channel.webhook_url?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {channel.notify_on_severity.map(s => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={channel.is_active}
                          onCheckedChange={(checked) => toggleChannel(channel.id, checked)}
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => testChannel(channel.id)}
                          disabled={testing === channel.id}
                        >
                          {testing === channel.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteChannel(channel.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {channel.last_notified_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last notification: {new Date(channel.last_notified_at).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
