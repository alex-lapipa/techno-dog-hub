import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageSEO from '@/components/PageSEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, Users, Target, Send, FileText, Settings, Search, 
  RefreshCw, Plus, Eye, Copy, CheckCircle, AlertCircle, 
  Clock, Loader2, Download, MailOpen, MousePointer, Reply,
  Ban, Inbox, Calendar, Zap
} from 'lucide-react';

const STAKEHOLDER_TYPES = [
  { value: 'journalist', label: 'Journalist / Press' },
  { value: 'manager', label: 'Artist Manager / Agent' },
  { value: 'label', label: 'Label' },
  { value: 'collective', label: 'Collective / Sound System' },
  { value: 'manufacturer', label: 'Gear Manufacturer' },
  { value: 'open_source_leader', label: 'Open Source Leader' },
  { value: 'other', label: 'Other' }
];

const SOURCE_DBS = [
  { value: 'artist_managers', label: 'Artist Managers', type: 'manager' },
  { value: 'label_contacts', label: 'Label Contacts', type: 'label' },
  { value: 'collective_key_people', label: 'Collective Key People', type: 'collective' },
  { value: 'brand_contacts', label: 'Brand Contacts', type: 'manufacturer' }
];

const OBJECTIVES = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'database_enrichment', label: 'Database Enrichment' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'partnership', label: 'Partnership' }
];

const TONES = [
  { value: 'formal', label: 'Formal' },
  { value: 'scene_native', label: 'Scene Native' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'partnership', label: 'Partnership' }
];

const OutreachEngineAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contacts, setContacts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [suppressions, setSuppressions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Campaign Builder
  const [campaignObjective, setCampaignObjective] = useState('');
  const [campaignStakeholder, setCampaignStakeholder] = useState('');
  const [campaignTheme, setCampaignTheme] = useState('');
  const [campaignTone, setCampaignTone] = useState('scene_native');
  
  // Email Composer
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [qaResult, setQaResult] = useState<any>(null);
  const [freshnessSignals, setFreshnessSignals] = useState<any>(null);
  
  // Import
  const [importSource, setImportSource] = useState('');
  
  // Dialog
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalContacts: 0,
    active: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    bounced: 0
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
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
      const [contactsRes, campaignsRes, messagesRes, templatesRes, suppressionsRes] = await Promise.all([
        supabase.from('crm_contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('outreach_messages').select('*, crm_contacts(full_name, email)').order('created_at', { ascending: false }).limit(100),
        supabase.from('templates_library').select('*').order('template_name'),
        supabase.from('suppression_list').select('*').order('added_at', { ascending: false })
      ]);

      setContacts(contactsRes.data || []);
      setCampaigns(campaignsRes.data || []);
      setMessages(messagesRes.data || []);
      setTemplates(templatesRes.data || []);
      setSuppressions(suppressionsRes.data || []);

      // Calculate stats
      const contactsData = contactsRes.data || [];
      const messagesData = messagesRes.data || [];
      setStats({
        totalContacts: contactsData.length,
        active: contactsData.filter(c => c.suppression_status === 'active').length,
        sent: messagesData.filter(m => m.status === 'sent' || m.status === 'delivered').length,
        opened: messagesData.filter(m => m.status === 'opened' || m.opened_at).length,
        clicked: messagesData.filter(m => m.status === 'clicked' || m.clicked_at).length,
        replied: messagesData.filter(m => m.reply_detected).length,
        bounced: messagesData.filter(m => m.status === 'bounced').length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const callAgent = async (action: string, params: any = {}) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('outreach-engine', {
        body: { action, ...params }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Agent error:', error);
      toast.error('Operation failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const importContacts = async () => {
    if (!importSource) {
      toast.error('Select a source database');
      return;
    }
    const source = SOURCE_DBS.find(s => s.value === importSource);
    const result = await callAgent('import_contacts', { 
      sourceDb: importSource, 
      stakeholderType: source?.type || 'other' 
    });
    if (result?.result?.imported) {
      toast.success(`Imported ${result.result.imported} contacts`);
      fetchData();
    }
  };

  const generateCampaign = async () => {
    if (!campaignObjective || !campaignStakeholder) {
      toast.error('Select objective and stakeholder type');
      return;
    }
    const result = await callAgent('generate_campaign', {
      objective: campaignObjective,
      stakeholderType: campaignStakeholder,
      theme: campaignTheme,
      tone: campaignTone
    });
    if (result?.result?.campaignId) {
      toast.success('Campaign created');
      fetchData();
    }
  };

  const composeEmail = async () => {
    if (!selectedContact) {
      toast.error('Select a contact');
      return;
    }
    const result = await callAgent('compose_email', {
      contactId: selectedContact.id,
      campaignId: selectedCampaign || null
    });
    if (result?.result) {
      setEmailSubject(result.result.subject || '');
      setEmailBody(result.result.bodyHtml || result.result.bodyText || '');
      setFreshnessSignals(result.result.freshnessSignals);
      toast.success('Email composed');
    }
  };

  const runQaCheck = async () => {
    if (!emailSubject || !emailBody) {
      toast.error('Subject and body required');
      return;
    }
    const result = await callAgent('qa_check', { subject: emailSubject, body: emailBody });
    if (result?.result) {
      setQaResult(result.result);
      if (result.result.passed) {
        toast.success(`QA passed (score: ${result.result.score})`);
      } else {
        toast.warning(`QA issues found (score: ${result.result.score})`);
      }
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Enter test email address');
      return;
    }
    const result = await callAgent('send_test', {
      subject: emailSubject,
      body: emailBody,
      testEmail
    });
    if (result?.result?.sent) {
      toast.success('Test email sent');
    }
  };

  const sendEmail = async () => {
    if (!selectedContact || !emailSubject || !emailBody) {
      toast.error('Contact, subject, and body required');
      return;
    }
    const result = await callAgent('send_email', {
      contactId: selectedContact.id,
      subject: emailSubject,
      body: emailBody,
      campaignId: selectedCampaign || null
    });
    if (result?.result?.sent) {
      toast.success('Email sent successfully');
      setShowSendDialog(false);
      fetchData();
    } else if (result?.result?.error) {
      toast.error(result.result.error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      sent: 'bg-blue-500/20 text-blue-400',
      delivered: 'bg-green-500/20 text-green-400',
      opened: 'bg-purple-500/20 text-purple-400',
      clicked: 'bg-yellow-500/20 text-yellow-400',
      replied: 'bg-green-500/20 text-green-400',
      bounced: 'bg-red-500/20 text-red-400',
      draft: 'bg-gray-500/20 text-gray-400',
      scheduled: 'bg-orange-500/20 text-orange-400'
    };
    return <Badge className={styles[status] || 'bg-gray-500/20 text-gray-400'}>{status}</Badge>;
  };

  const getRelationshipBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-gray-500/20 text-gray-400',
      warm: 'bg-yellow-500/20 text-yellow-400',
      engaged: 'bg-green-500/20 text-green-400',
      partner: 'bg-purple-500/20 text-purple-400',
      avoid: 'bg-red-500/20 text-red-400'
    };
    return <Badge className={styles[status] || 'bg-gray-500/20 text-gray-400'}>{status}</Badge>;
  };

  const filteredContacts = contacts.filter(c => 
    !searchQuery || 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.organization_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <PageSEO 
        title="Outreach Engine | Admin"
        description="PR + CRM Agent for Techno.doc community outreach"
        path="/admin/outreach-engine"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              Outreach Engine
            </h1>
            <p className="text-muted-foreground mt-2">
              PR + CRM Agent for respectful, high-quality community outreach
            </p>
          </div>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-8 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="outbox">Outbox</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="suppressions">Suppressions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalContacts}</div>
                  <p className="text-xs text-muted-foreground">{stats.active} active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Send className="h-4 w-4" /> Sent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.sent}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MailOpen className="h-4 w-4" /> Opened
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.opened}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0}% rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MousePointer className="h-4 w-4" /> Clicked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.clicked}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Reply className="h-4 w-4" /> Replied
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.replied}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Ban className="h-4 w-4" /> Bounced
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{stats.bounced}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" /> Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaigns.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Import Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Import Contacts</CardTitle>
                <CardDescription>Sync contacts from existing databases</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Select value={importSource} onValueChange={setImportSource}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select source database..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_DBS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={importContacts} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Import
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Outreach</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.slice(0, 10).map(msg => (
                      <TableRow key={msg.id}>
                        <TableCell className="font-medium">
                          {msg.crm_contacts?.full_name || msg.crm_contacts?.email || 'Unknown'}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">{msg.subject}</TableCell>
                        <TableCell>{getStatusBadge(msg.status)}</TableCell>
                        <TableCell>{msg.sent_at ? new Date(msg.sent_at).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map(contact => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.full_name}</TableCell>
                        <TableCell>{contact.organization_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contact.stakeholder_type}</Badge>
                        </TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>
                          {getRelationshipBadge(contact.relationship_status)}
                          {contact.suppression_status !== 'active' && (
                            <Badge className="ml-1 bg-red-500/20 text-red-400">{contact.suppression_status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.last_contacted_at 
                            ? new Date(contact.last_contacted_at).toLocaleDateString() 
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedContact(contact);
                              setActiveTab('compose');
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create Campaign</CardTitle>
                <CardDescription>Generate a strategic outreach campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Objective</label>
                    <Select value={campaignObjective} onValueChange={setCampaignObjective}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select objective..." />
                      </SelectTrigger>
                      <SelectContent>
                        {OBJECTIVES.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target Stakeholder</label>
                    <Select value={campaignStakeholder} onValueChange={setCampaignStakeholder}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STAKEHOLDER_TYPES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Theme</label>
                    <Input 
                      placeholder="e.g., archive mission, gear culture..."
                      value={campaignTheme}
                      onChange={(e) => setCampaignTheme(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tone</label>
                    <Select value={campaignTone} onValueChange={setCampaignTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={generateCampaign} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                  Generate Campaign
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Objective</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.campaign_name}</TableCell>
                        <TableCell><Badge variant="outline">{c.objective}</Badge></TableCell>
                        <TableCell>{getStatusBadge(c.status)}</TableCell>
                        <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compose Tab */}
          <TabsContent value="compose">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Compose Email</CardTitle>
                  <CardDescription>
                    {selectedContact 
                      ? `To: ${selectedContact.full_name} (${selectedContact.email})`
                      : 'Select a contact to compose'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Select 
                      value={selectedContact?.id || ''} 
                      onValueChange={(id) => setSelectedContact(contacts.find(c => c.id === id))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select contact..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.filter(c => c.suppression_status === 'active').map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.full_name} ({c.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Campaign (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No campaign</SelectItem>
                        {campaigns.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.campaign_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={composeEmail} disabled={loading || !selectedContact}>
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                      Generate
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Body</label>
                    <Textarea 
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Email body..."
                      rows={12}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={runQaCheck} disabled={loading}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      QA Check
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Send Test
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Test Email</DialogTitle>
                          <DialogDescription>Send a test version to yourself</DialogDescription>
                        </DialogHeader>
                        <Input 
                          placeholder="Test email address..."
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                        />
                        <DialogFooter>
                          <Button onClick={sendTestEmail} disabled={loading}>
                            Send Test
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                      <DialogTrigger asChild>
                        <Button disabled={!selectedContact || !emailSubject || !emailBody}>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Send</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to send this email to {selectedContact?.email}?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm"><strong>Subject:</strong> {emailSubject}</p>
                          <p className="text-sm mt-2"><strong>To:</strong> {selectedContact?.full_name}</p>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={sendEmail} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                            Confirm Send
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {qaResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {qaResult.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        QA Result
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-2">{qaResult.score}/100</p>
                      {qaResult.issues?.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-red-400">Issues:</p>
                          <ul className="text-sm text-muted-foreground">
                            {qaResult.issues.map((i: string, idx: number) => (
                              <li key={idx}>• {i}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {qaResult.suggestions?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-400">Suggestions:</p>
                          <ul className="text-sm text-muted-foreground">
                            {qaResult.suggestions.map((s: string, idx: number) => (
                              <li key={idx}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {freshnessSignals && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Freshness Signals</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      {freshnessSignals.whyNowAngle && (
                        <div>
                          <p className="font-medium text-green-400">Why Now:</p>
                          <p className="text-muted-foreground">{freshnessSignals.whyNowAngle}</p>
                        </div>
                      )}
                      {freshnessSignals.suggestedHooks?.length > 0 && (
                        <div>
                          <p className="font-medium text-blue-400">Hooks:</p>
                          <ul className="text-muted-foreground">
                            {freshnessSignals.suggestedHooks.map((h: string, i: number) => (
                              <li key={i}>• {h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedContact && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Info</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Name:</strong> {selectedContact.full_name}</p>
                      <p><strong>Org:</strong> {selectedContact.organization_name || '-'}</p>
                      <p><strong>Role:</strong> {selectedContact.role_title || '-'}</p>
                      <p><strong>Type:</strong> {selectedContact.stakeholder_type}</p>
                      <p><strong>Location:</strong> {selectedContact.city}, {selectedContact.country}</p>
                      {selectedContact.personalization_notes && (
                        <p><strong>Notes:</strong> {selectedContact.personalization_notes}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Outbox Tab */}
          <TabsContent value="outbox">
            <Card>
              <CardHeader>
                <CardTitle>Outbox & History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Opened</TableHead>
                      <TableHead>Replied</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map(msg => (
                      <TableRow key={msg.id}>
                        <TableCell className="font-medium">
                          {msg.crm_contacts?.full_name || 'Unknown'}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">{msg.subject}</TableCell>
                        <TableCell>{getStatusBadge(msg.status)}</TableCell>
                        <TableCell>
                          {msg.sent_at ? new Date(msg.sent_at).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          {msg.opened_at ? new Date(msg.opened_at).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          {msg.reply_detected ? <CheckCircle className="h-4 w-4 text-green-500" /> : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Reusable templates for different outreach purposes</CardDescription>
              </CardHeader>
              <CardContent>
                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(t => (
                      <Card key={t.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{t.template_name}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="outline">{t.purpose}</Badge>
                            <Badge variant="outline">{t.tone}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Subject:</strong> {t.subject_template}
                          </p>
                          <ScrollArea className="h-[100px]">
                            <pre className="text-xs whitespace-pre-wrap">{t.body_template_markdown}</pre>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No templates yet. Templates will be created as you generate campaigns.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppressions Tab */}
          <TabsContent value="suppressions">
            <Card>
              <CardHeader>
                <CardTitle>Suppression List</CardTitle>
                <CardDescription>Emails that should never be contacted</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppressions.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{s.email}</TableCell>
                        <TableCell><Badge variant="outline">{s.reason}</Badge></TableCell>
                        <TableCell>{new Date(s.added_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {suppressions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No suppressions yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resend Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>RESEND_API_KEY configured</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Emails are sent via Resend. Make sure your domain is verified at resend.com/domains
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sending Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Max emails per day</label>
                    <Input type="number" defaultValue="50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Delay between emails (seconds)</label>
                    <Input type="number" defaultValue="30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• All emails include opt-out footer</p>
                    <p>• Bounced emails are automatically suppressed</p>
                    <p>• Opt-out requests are processed immediately</p>
                    <p>• No mass sends without explicit confirmation</p>
                    <p>• QA checks run before every send</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default OutreachEngineAdmin;
