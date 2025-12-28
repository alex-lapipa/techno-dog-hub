import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { XPMultiplierBanner } from "@/components/gamification";
import { 
  ArrowLeft, 
  Plus, 
  Zap, 
  Calendar,
  Clock,
  Trash2,
  Edit,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface XPEvent {
  id: string;
  name: string;
  description: string | null;
  multiplier: number;
  start_at: string;
  end_at: string;
  is_active: boolean;
  event_type: string;
  icon: string;
  created_at: string;
}

const EVENT_TYPES = [
  { value: "special", label: "Special Event", icon: "⚡" },
  { value: "weekend", label: "Weekend Bonus", icon: "🎉" },
  { value: "holiday", label: "Holiday", icon: "🎆" },
  { value: "milestone", label: "Milestone", icon: "🏆" },
];

const XPEventsAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<XPEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<XPEvent | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    multiplier: "2.0",
    start_at: "",
    end_at: "",
    event_type: "special",
    icon: "⚡",
    is_active: true,
  });

  useEffect(() => {
    if (isAdmin) loadEvents();
  }, [isAdmin]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("xp_multiplier_events")
      .select("*")
      .order("start_at", { ascending: false });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      multiplier: "2.0",
      start_at: "",
      end_at: "",
      event_type: "special",
      icon: "⚡",
      is_active: true,
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: XPEvent) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || "",
      multiplier: String(event.multiplier),
      start_at: event.start_at.slice(0, 16),
      end_at: event.end_at.slice(0, 16),
      event_type: event.event_type,
      icon: event.icon,
      is_active: event.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        multiplier: parseFloat(formData.multiplier),
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        event_type: formData.event_type,
        icon: formData.icon,
        is_active: formData.is_active,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("xp_multiplier_events")
          .update(payload)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast({ title: "Event updated" });
      } else {
        const { error } = await supabase
          .from("xp_multiplier_events")
          .insert(payload);

        if (error) throw error;
        toast({ title: "Event created" });
      }

      setDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (err) {
      console.error("Save error:", err);
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;

    const { error } = await supabase
      .from("xp_multiplier_events")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "Event deleted" });
      loadEvents();
    }
  };

  const toggleActive = async (event: XPEvent) => {
    const { error } = await supabase
      .from("xp_multiplier_events")
      .update({ is_active: !event.is_active })
      .eq("id", event.id);

    if (!error) {
      loadEvents();
    }
  };

  const getEventStatus = (event: XPEvent) => {
    const now = new Date();
    const start = new Date(event.start_at);
    const end = new Date(event.end_at);

    if (!event.is_active) return { label: "Disabled", color: "bg-muted text-muted-foreground" };
    if (now < start) return { label: "Upcoming", color: "bg-blue-500/20 text-blue-400" };
    if (now >= start && now < end) return { label: "Active", color: "bg-green-500/20 text-green-400" };
    return { label: "Ended", color: "bg-muted text-muted-foreground" };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 pt-24 text-center">
          <p className="text-muted-foreground">Access denied</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>XP Events | Admin</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-12 pt-24">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Zap className="h-8 w-8 text-amber-500" />
                XP Multiplier Events
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage bonus XP events and promotions
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? "Edit Event" : "Create XP Event"}</DialogTitle>
                  <DialogDescription>
                    Set up a bonus XP multiplier for a limited time
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                      <Label>Event Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Double XP Weekend"
                      />
                    </div>
                    <div>
                      <Label>Icon</Label>
                      <Input
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="text-center text-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Multiplier</Label>
                      <Select
                        value={formData.multiplier}
                        onValueChange={(v) => setFormData({ ...formData, multiplier: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="2.0">2x</SelectItem>
                          <SelectItem value="3.0">3x</SelectItem>
                          <SelectItem value="5.0">5x</SelectItem>
                          <SelectItem value="10.0">10x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Event Type</Label>
                      <Select
                        value={formData.event_type}
                        onValueChange={(v) => setFormData({ ...formData, event_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.icon} {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date/Time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.start_at}
                        onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>End Date/Time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.end_at}
                        onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving || !formData.name || !formData.start_at || !formData.end_at}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingEvent ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Current Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base">Current XP Status</CardTitle>
              <CardDescription>
                Active multipliers are automatically applied to all XP awards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <XPMultiplierBanner />
              <p className="text-xs text-muted-foreground mt-3">
                💡 Weekend bonus (1.5x) is automatically applied on Saturdays and Sundays when no special event is active.
              </p>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No XP events created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => {
                    const status = getEventStatus(event);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{event.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.name}</span>
                              <Badge variant="secondary" className="font-mono">
                                {event.multiplier}x
                              </Badge>
                              <Badge className={status.color}>{status.label}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(event.start_at), "MMM d, HH:mm")}
                              </span>
                              <span>→</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.end_at), "MMM d, HH:mm")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={event.is_active}
                            onCheckedChange={() => toggleActive(event)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default XPEventsAdmin;
