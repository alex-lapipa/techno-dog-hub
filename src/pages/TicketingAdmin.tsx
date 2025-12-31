import { useState } from 'react';
import { 
  Download, 
  Ticket, 
  Shield, 
  Mail, 
  Database, 
  Server, 
  FileText, 
  Package, 
  Folder, 
  Code, 
  Copy, 
  Check,
  Zap,
  Users,
  CreditCard,
  QrCode,
  Globe,
  Play,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTicketingData, TktOrganization, TktEvent, TktTicketType } from '@/hooks/useTicketingData';
import { format } from 'date-fns';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function TicketingAdmin() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [embedOrgSlug, setEmbedOrgSlug] = useState('');
  const [embedEventSlug, setEmbedEventSlug] = useState('');
  const [embedColor, setEmbedColor] = useState('#dc2626');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<TktOrganization | null>(null);
  const [editingEvent, setEditingEvent] = useState<TktEvent | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const {
    organizations,
    events,
    orders,
    stats,
    loading,
    refresh,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    createEvent,
    updateEvent,
    deleteEvent,
    createTicketType,
    deleteTicketType,
    updateOrderStatus
  } = useTicketingData();

  const copyToClipboard = (section: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(section);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCreateOrganization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await createOrganization({
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        description: formData.get('description') as string || undefined,
        contact_email: formData.get('contact_email') as string || undefined,
      });
      setShowOrgForm(false);
      form.reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await createEvent({
        organization_id: formData.get('organization_id') as string,
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        description: formData.get('description') as string || undefined,
        venue_name: formData.get('venue_name') as string || undefined,
        venue_address: formData.get('venue_address') as string || undefined,
        start_date: formData.get('start_date') as string,
        status: 'draft'
      });
      setShowEventForm(false);
      form.reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicketType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEventId) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await createTicketType({
        event_id: selectedEventId,
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        price_cents: Math.round(parseFloat(formData.get('price') as string) * 100),
        quantity_total: parseInt(formData.get('quantity') as string),
        max_per_order: parseInt(formData.get('max_per_order') as string) || 10,
      });
      setShowTicketForm(false);
      setSelectedEventId(null);
      form.reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishEvent = async (event: TktEvent) => {
    try {
      await updateEvent(event.id, { status: 'published' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnpublishEvent = async (event: TktEvent) => {
    try {
      await updateEvent(event.id, { status: 'draft' });
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (cents: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency
    }).format(cents / 100);
  };

  return (
    <AdminPageLayout
      title="Ticketing Module"
      description="Manage events, tickets, and orders"
      icon={Ticket}
      iconColor="text-crimson"
      onRefresh={refresh}
      isLoading={loading}
      actions={
        <Badge variant="outline" className="font-mono text-xs border-logo-green/50 text-logo-green">
          <Package className="w-3 h-3 mr-1" />
          SELF-CONTAINED
        </Badge>
      }
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Organizations</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalOrganizations || 0}</p>
                </div>
                <Building className="w-8 h-8 text-crimson/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Events</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalEvents || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-crimson/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Tickets Sold</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalTicketsSold || 0}</p>
                </div>
                <Ticket className="w-8 h-8 text-logo-green/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Revenue</p>
                  <p className="text-3xl font-bold text-logo-green">{formatCurrency(stats?.totalRevenue || 0)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-logo-green/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-zinc-800 border border-border">
            <TabsTrigger value="overview" className="font-mono text-xs">Overview</TabsTrigger>
            <TabsTrigger value="organizations" className="font-mono text-xs">Organizations</TabsTrigger>
            <TabsTrigger value="events" className="font-mono text-xs">Events</TabsTrigger>
            <TabsTrigger value="orders" className="font-mono text-xs">Orders</TabsTrigger>
            <TabsTrigger value="embed" className="font-mono text-xs">Embed Widget</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Events */}
              <Card className="bg-zinc-900/50 border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-logo-green" />
                    RECENT EVENTS
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('events')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No events yet</p>
                  ) : (
                    events.slice(0, 5).map(event => (
                      <div key={event.id} className="flex items-center justify-between py-2 px-3 bg-zinc-800/50 border border-border">
                        <div>
                          <p className="text-sm font-mono text-foreground">{event.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.start_date), 'PPP')}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-mono ${
                            event.status === 'published' ? 'border-logo-green/50 text-logo-green' : 
                            event.status === 'cancelled' ? 'border-crimson/50 text-crimson' :
                            'border-muted-foreground/50 text-muted-foreground'
                          }`}
                        >
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="bg-zinc-900/50 border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-crimson" />
                    RECENT ORDERS
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
                  ) : (
                    orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between py-2 px-3 bg-zinc-800/50 border border-border">
                        <div>
                          <p className="text-sm font-mono text-foreground">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-logo-green">{formatCurrency(order.total_cents)}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] font-mono ${
                              order.status === 'confirmed' ? 'border-logo-green/50 text-logo-green' : 
                              order.status === 'cancelled' || order.status === 'refunded' ? 'border-crimson/50 text-crimson' :
                              'border-muted-foreground/50 text-muted-foreground'
                            }`}
                          >
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-mono text-lg text-foreground">Organizations</h2>
              <Dialog open={showOrgForm} onOpenChange={setShowOrgForm}>
                <DialogTrigger asChild>
                  <Button className="bg-crimson hover:bg-crimson/80">
                    <Plus className="w-4 h-4 mr-2" />
                    New Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-border">
                  <DialogHeader>
                    <DialogTitle className="font-mono">Create Organization</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateOrganization} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-muted-foreground">Name *</label>
                      <Input name="name" required className="bg-zinc-800 border-border" placeholder="My Organization" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-muted-foreground">Slug * (lowercase, no spaces)</label>
                      <Input name="slug" required pattern="[a-z0-9-]+" className="bg-zinc-800 border-border" placeholder="my-organization" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-muted-foreground">Description</label>
                      <Input name="description" className="bg-zinc-800 border-border" placeholder="Optional description" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-muted-foreground">Contact Email</label>
                      <Input name="contact_email" type="email" className="bg-zinc-800 border-border" placeholder="contact@example.com" />
                    </div>
                    <Button type="submit" className="w-full bg-crimson hover:bg-crimson/80">Create</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {organizations.length === 0 ? (
                <Card className="bg-zinc-900/50 border-border">
                  <CardContent className="py-12 text-center">
                    <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No organizations yet. Create one to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                organizations.map(org => (
                  <Card key={org.id} className="bg-zinc-900/50 border-border hover:border-crimson/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-mono font-bold text-foreground">{org.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">/{org.slug}</p>
                          {org.description && <p className="text-sm text-muted-foreground mt-1">{org.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteOrganization(org.id)}
                            className="text-crimson hover:text-crimson/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-mono text-lg text-foreground">Events</h2>
              <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
                <DialogTrigger asChild>
                  <Button className="bg-crimson hover:bg-crimson/80" disabled={organizations.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-border max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-mono">Create Event</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-muted-foreground">Organization *</label>
                      <select name="organization_id" required className="w-full bg-zinc-800 border border-border rounded-md px-3 py-2 text-sm">
                        <option value="">Select organization</option>
                        {organizations.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-muted-foreground">Name *</label>
                        <Input name="name" required className="bg-zinc-800 border-border" placeholder="Summer Festival 2025" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-muted-foreground">Slug *</label>
                        <Input name="slug" required pattern="[a-z0-9-]+" className="bg-zinc-800 border-border" placeholder="summer-festival-2025" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-muted-foreground">Description</label>
                      <Input name="description" className="bg-zinc-800 border-border" placeholder="Event description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-muted-foreground">Venue Name</label>
                        <Input name="venue_name" className="bg-zinc-800 border-border" placeholder="Warehouse 23" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-muted-foreground">Start Date *</label>
                        <Input name="start_date" type="datetime-local" required className="bg-zinc-800 border-border" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-crimson hover:bg-crimson/80">Create Event</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {organizations.length === 0 && (
              <Card className="bg-zinc-900/50 border-border">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Create an organization first before adding events.</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {events.length === 0 && organizations.length > 0 ? (
                <Card className="bg-zinc-900/50 border-border">
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No events yet. Create one to start selling tickets.</p>
                  </CardContent>
                </Card>
              ) : (
                events.map(event => (
                  <Card key={event.id} className="bg-zinc-900/50 border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-mono font-bold text-foreground">{event.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] font-mono ${
                                event.status === 'published' ? 'border-logo-green/50 text-logo-green' : 
                                event.status === 'cancelled' ? 'border-crimson/50 text-crimson' :
                                'border-muted-foreground/50 text-muted-foreground'
                              }`}
                            >
                              {event.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {event.organization?.name} / {event.slug}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {format(new Date(event.start_date), 'PPP p')}
                            {event.venue_name && ` | ${event.venue_name}`}
                          </p>

                          {/* Ticket Types */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono text-muted-foreground">TICKET TYPES</span>
                              <Dialog open={showTicketForm && selectedEventId === event.id} onOpenChange={(open) => {
                                setShowTicketForm(open);
                                if (open) setSelectedEventId(event.id);
                                else setSelectedEventId(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                                    <Plus className="w-3 h-3 mr-1" /> Add Ticket
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-900 border-border">
                                  <DialogHeader>
                                    <DialogTitle className="font-mono">Add Ticket Type</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={handleCreateTicketType} className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-xs font-mono text-muted-foreground">Name *</label>
                                      <Input name="name" required className="bg-zinc-800 border-border" placeholder="Early Bird" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-xs font-mono text-muted-foreground">Description</label>
                                      <Input name="description" className="bg-zinc-800 border-border" placeholder="Limited availability" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-xs font-mono text-muted-foreground">Price (€) *</label>
                                        <Input name="price" type="number" step="0.01" min="0" required className="bg-zinc-800 border-border" placeholder="35.00" />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-mono text-muted-foreground">Quantity *</label>
                                        <Input name="quantity" type="number" min="1" required className="bg-zinc-800 border-border" placeholder="100" />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-mono text-muted-foreground">Max/Order</label>
                                        <Input name="max_per_order" type="number" min="1" defaultValue="10" className="bg-zinc-800 border-border" />
                                      </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-crimson hover:bg-crimson/80">Create Ticket Type</Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </div>
                            {(event.ticket_types || []).length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No ticket types yet</p>
                            ) : (
                              <div className="space-y-1">
                                {(event.ticket_types || []).map(tt => (
                                  <div key={tt.id} className="flex items-center justify-between py-1 px-2 bg-zinc-800/50 text-xs">
                                    <span className="font-mono">{tt.name}</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-logo-green font-bold">{formatCurrency(tt.price_cents)}</span>
                                      <span className="text-muted-foreground">{tt.quantity_sold}/{tt.quantity_total}</span>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-crimson hover:text-crimson/80"
                                        onClick={() => deleteTicketType(tt.id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {event.status === 'draft' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePublishEvent(event)}
                              className="border-logo-green/50 text-logo-green hover:bg-logo-green/10"
                            >
                              <Eye className="w-4 h-4 mr-1" /> Publish
                            </Button>
                          ) : event.status === 'published' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUnpublishEvent(event)}
                              className="border-muted-foreground/50"
                            >
                              <EyeOff className="w-4 h-4 mr-1" /> Unpublish
                            </Button>
                          ) : null}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteEvent(event.id)}
                            className="text-crimson hover:text-crimson/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4 space-y-4">
            <h2 className="font-mono text-lg text-foreground">Orders</h2>
            
            <Card className="bg-zinc-900/50 border-border">
              <CardContent className="pt-6">
                {orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders yet. Orders will appear here when customers purchase tickets.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map(order => (
                      <div key={order.id} className="flex items-center justify-between py-3 px-4 bg-zinc-800/50 border border-border hover:border-crimson/30 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-foreground">{order.order_number}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] font-mono ${
                                order.status === 'confirmed' ? 'border-logo-green/50 text-logo-green' : 
                                order.status === 'cancelled' || order.status === 'refunded' ? 'border-crimson/50 text-crimson' :
                                'border-muted-foreground/50 text-muted-foreground'
                              }`}
                            >
                              {order.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.customer_name} • {order.customer_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.created_at), 'PPP p')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-logo-green">{formatCurrency(order.total_cents)}</p>
                          {order.status === 'confirmed' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs text-crimson hover:text-crimson/80"
                              onClick={() => updateOrderStatus(order.id, 'refunded')}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Embed Widget Tab */}
          <TabsContent value="embed" className="mt-4 space-y-4">
            <Card className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 border-2 border-logo-green/50 shadow-lg shadow-logo-green/10">
              <CardHeader>
                <CardTitle className="font-mono text-lg flex items-center gap-3">
                  <div className="p-2 bg-logo-green/20 rounded-lg">
                    <Globe className="w-6 h-6 text-logo-green" />
                  </div>
                  <div>
                    <span className="text-logo-green">EMBEDDABLE WIDGET</span>
                    <p className="text-xs text-muted-foreground font-normal mt-1">
                      Copy & paste to deploy on any external website
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="configure" className="w-full">
                  <TabsList className="bg-zinc-800 border border-border">
                    <TabsTrigger value="configure" className="font-mono text-xs">Configure</TabsTrigger>
                    <TabsTrigger value="code" className="font-mono text-xs">Embed Code</TabsTrigger>
                    <TabsTrigger value="preview" className="font-mono text-xs">Preview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="configure" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-muted-foreground">Organization Slug</label>
                        <select 
                          value={embedOrgSlug}
                          onChange={(e) => setEmbedOrgSlug(e.target.value)}
                          className="w-full bg-zinc-800 border border-border rounded-md px-3 py-2 text-sm font-mono"
                        >
                          <option value="" disabled>Select organization...</option>
                          {organizations.map(org => (
                            <option key={org.id} value={org.slug}>{org.slug}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-muted-foreground">Event Slug</label>
                        <select 
                          value={embedEventSlug}
                          onChange={(e) => setEmbedEventSlug(e.target.value)}
                          className="w-full bg-zinc-800 border border-border rounded-md px-3 py-2 text-sm font-mono"
                        >
                          <option value="" disabled>Select event...</option>
                          {events
                            .filter(e => e.status === 'published')
                            .map(event => (
                              <option key={event.id} value={event.slug}>{event.slug}</option>
                            ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-muted-foreground">Primary Color</label>
                        <div className="flex gap-2">
                          <Input 
                            type="color"
                            value={embedColor}
                            onChange={(e) => setEmbedColor(e.target.value)}
                            className="w-12 h-10 p-1 bg-zinc-800 border-border"
                          />
                          <Input 
                            value={embedColor}
                            onChange={(e) => setEmbedColor(e.target.value)}
                            className="bg-zinc-800 border-border font-mono flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="code" className="mt-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">COMPLETE SNIPPET</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard('full', `<!-- Techno.Dog Ticketing Widget -->
<div id="techno-tickets" 
  data-techno-tickets 
  data-org-slug="${embedOrgSlug}" 
  data-event-slug="${embedEventSlug}" 
  data-primary-color="${embedColor}">
</div>
<script src="${SUPABASE_URL}/functions/v1/ticketing-widget?action=script" async></script>`)}
                          className="font-mono text-xs"
                        >
                          {copiedSection === 'full' ? <><Check className="w-3 h-3 mr-1" /> Copied</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                        </Button>
                      </div>
                      <div className="bg-zinc-950 border border-logo-green/30 p-4 font-mono text-xs overflow-x-auto">
                        <pre className="text-muted-foreground whitespace-pre-wrap">{`<!-- Techno.Dog Ticketing Widget -->
<div id="techno-tickets" 
  data-techno-tickets 
  data-org-slug="${embedOrgSlug}" 
  data-event-slug="${embedEventSlug}" 
  data-primary-color="${embedColor}">
</div>
<script src="${SUPABASE_URL}/functions/v1/ticketing-widget?action=script" async></script>`}</pre>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">Live widget preview</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                          className="font-mono text-xs border-logo-green/50 text-logo-green hover:bg-logo-green/10"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {showPreview ? 'Reload' : 'Load Preview'}
                        </Button>
                      </div>
                      
                      {showPreview && (
                        <div className="border border-border rounded-lg overflow-hidden bg-zinc-950 p-8">
                          <div 
                            style={{ 
                              fontFamily: 'system-ui, sans-serif', 
                              maxWidth: '480px', 
                              margin: '0 auto', 
                              background: '#0a0a0a', 
                              border: '1px solid #27272a', 
                              borderRadius: '8px', 
                              overflow: 'hidden', 
                              color: '#fafafa' 
                            }}
                          >
                            <div style={{ background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', padding: '20px', borderBottom: '1px solid #3f3f46' }}>
                              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700 }}>
                                {embedEventSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </h2>
                              <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>Saturday, February 15, 2025</p>
                            </div>
                            <div style={{ padding: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', marginBottom: '12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Early Bird</div>
                                  <div style={{ fontSize: '11px', color: '#71717a', marginTop: '4px' }}>33 remaining</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '18px' }}>€35.00</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', marginBottom: '16px', borderTop: '1px solid #27272a', fontSize: '18px' }}>
                                <span style={{ color: '#a1a1aa' }}>Total</span>
                                <span style={{ fontWeight: 700, color: '#22c55e' }}>€0.00</span>
                              </div>
                              <button style={{ width: '100%', padding: '16px', background: embedColor, color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.5 }}>
                                Proceed to Checkout
                              </button>
                            </div>
                            <div style={{ textAlign: 'center', padding: '12px', fontSize: '11px', color: '#52525b', background: '#0a0a0a', borderTop: '1px solid #27272a' }}>
                              Powered by <a href="https://techno.dog" style={{ color: embedColor, textDecoration: 'none' }}>Techno.Dog</a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <Badge variant="outline" className="font-mono text-[10px] border-logo-green/50 text-logo-green">
                    <Zap className="w-3 h-3 mr-1" />
                    AUTO-DEPLOY
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px] border-crimson/50 text-crimson">
                    <Shield className="w-3 h-3 mr-1" />
                    CORS ENABLED
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px] border-muted-foreground/50 text-muted-foreground">
                    <Server className="w-3 h-3 mr-1" />
                    EDGE FUNCTION
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Architecture Diagram */}
            <Card className="bg-zinc-900/50 border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-logo-green" />
                  ARCHITECTURE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="p-4 bg-zinc-800 border border-crimson/30">
                      <Users className="w-6 h-6 mx-auto text-crimson" />
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">Buyer</p>
                  </div>
                  <div className="space-y-2">
                    <div className="p-4 bg-zinc-800 border border-logo-green/30">
                      <Ticket className="w-6 h-6 mx-auto text-logo-green" />
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">Widget</p>
                  </div>
                  <div className="space-y-2">
                    <div className="p-4 bg-zinc-800 border border-crimson/30">
                      <CreditCard className="w-6 h-6 mx-auto text-crimson" />
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">Payment</p>
                  </div>
                  <div className="space-y-2">
                    <div className="p-4 bg-zinc-800 border border-logo-green/30">
                      <QrCode className="w-6 h-6 mx-auto text-logo-green" />
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">Ticket</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs font-mono text-muted-foreground">Edge Functions</span>
                  <div className="h-px bg-border flex-1" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
