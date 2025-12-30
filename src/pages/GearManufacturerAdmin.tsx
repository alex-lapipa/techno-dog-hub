import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageLayout } from '@/components/admin';
import { 
  Cpu, Building2, Users, Mail, Settings, Search, RefreshCw, 
  Download, Trash2, ExternalLink, CheckCircle, AlertCircle,
  BarChart3, Zap, Package, Send, Database
} from 'lucide-react';

export default function GearManufacturerAdmin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [outreachHistory, setOutreachHistory] = useState<any[]>([]);
  
  const [outreachForm, setOutreachForm] = useState({
    brandId: '',
    contactId: '',
    projectContext: 'techno.dog - Underground electronic music knowledge archive, artist gear documentation, and techno culture preservation project.',
    collaborationType: 'content_collab',
    tone: 'scene_native' as 'formal' | 'scene_native' | 'journalist' | 'partnership'
  });
  const [generatedOutreach, setGeneratedOutreach] = useState<any>(null);
  
  const [brandFilter, setBrandFilter] = useState({ status: 'all', search: '' });

  const callAgent = useCallback(async (action: string, params: any = {}) => {
    const { data, error } = await supabase.functions.invoke('gear-manufacturer-agent', {
      body: { action, ...params }
    });
    if (error) throw error;
    return data;
  }, []);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await callAgent('dashboard');
      setStats(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch dashboard', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [callAgent, toast]);

  const fetchBrands = useCallback(async () => {
    try {
      const data = await callAgent('get_brands');
      setBrands(data.brands || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  }, [callAgent]);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await callAgent('get_contacts');
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  }, [callAgent]);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await callAgent('get_products');
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, [callAgent]);

  const fetchPrograms = useCallback(async () => {
    try {
      const data = await callAgent('get_programs');
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  }, [callAgent]);

  const fetchOutreachHistory = useCallback(async () => {
    try {
      const data = await callAgent('get_outreach_history');
      setOutreachHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch outreach history:', error);
    }
  }, [callAgent]);

  useEffect(() => {
    fetchDashboard();
    fetchBrands();
    fetchContacts();
    fetchProducts();
    fetchPrograms();
    fetchOutreachHistory();
  }, [fetchDashboard, fetchBrands, fetchContacts, fetchProducts, fetchPrograms, fetchOutreachHistory]);

  const runIngest = async () => {
    setIsLoading(true);
    try {
      const result = await callAgent('ingest');
      toast({ title: 'Ingest Complete', description: `Created ${result.brandsCreated} brands` });
      fetchDashboard();
      fetchBrands();
    } catch (error) {
      toast({ title: 'Ingest Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const runVerification = async (brandIds?: string[]) => {
    setIsLoading(true);
    try {
      const result = await callAgent('verify', { brandIds });
      toast({ title: 'Verification Complete', description: `Verified ${result.verified} brands (${result.active} active, ${result.inactive} inactive)` });
      fetchBrands();
      fetchDashboard();
    } catch (error) {
      toast({ title: 'Verification Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const runFindOwnership = async (brandIds?: string[]) => {
    setIsLoading(true);
    try {
      const result = await callAgent('find_ownership', { brandIds });
      toast({ title: 'Analysis Complete', description: `Enriched ${result.enriched} brands` });
      fetchBrands();
    } catch (error) {
      toast({ title: 'Analysis Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const runFindContacts = async (brandIds?: string[]) => {
    setIsLoading(true);
    try {
      const result = await callAgent('find_contacts', { brandIds });
      toast({ title: 'Contact Search Complete', description: `Found ${result.contactsFound} contacts` });
      fetchContacts();
      fetchDashboard();
    } catch (error) {
      toast({ title: 'Contact Search Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateOutreach = async () => {
    if (!outreachForm.brandId) {
      toast({ title: 'Select a brand', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await callAgent('generate_outreach', outreachForm);
      setGeneratedOutreach(result);
      toast({ title: 'Outreach Generated' });
    } catch (error) {
      toast({ title: 'Generation Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async (type: 'brands' | 'contacts') => {
    try {
      const result = await callAgent('export', { type });
      const csv = convertToCSV(result.data);
      downloadCSV(csv, `gear_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      toast({ title: 'Export Complete' });
    } catch (error) {
      toast({ title: 'Export Failed', variant: 'destructive' });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredBrands = brands.filter(b => {
    if (brandFilter.status !== 'all' && b.status !== brandFilter.status) return false;
    if (brandFilter.search && !b.brand_name.toLowerCase().includes(brandFilter.search.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminPageLayout
      title="Gear Manufacturer Intelligence Agent"
      description="Multi-model orchestration: OpenAI + Anthropic + Grok for manufacturer contacts"
      icon={Cpu}
      onRefresh={fetchDashboard}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>For professional outreach only. Uses publicly available information. GDPR compliant.</span>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
            <TabsTrigger value="ingest"><Database className="h-4 w-4 mr-1" /> Ingest</TabsTrigger>
            <TabsTrigger value="brands"><Building2 className="h-4 w-4 mr-1" /> Brands</TabsTrigger>
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-1" /> Products</TabsTrigger>
            <TabsTrigger value="contacts"><Users className="h-4 w-4 mr-1" /> Contacts</TabsTrigger>
            <TabsTrigger value="outreach"><Mail className="h-4 w-4 mr-1" /> Outreach</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" /> Settings</TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-5 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-2xl">{stats?.totalBrands || 0}</CardTitle><CardDescription>Total Brands</CardDescription></CardHeader></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-2xl text-logo-green">{stats?.activeBrands || 0}</CardTitle><CardDescription>Active Brands</CardDescription></CardHeader></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-2xl">{stats?.totalProducts || 0}</CardTitle><CardDescription>Products</CardDescription></CardHeader></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-2xl">{stats?.totalContacts || 0}</CardTitle><CardDescription>Contacts Found</CardDescription></CardHeader></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-2xl">{stats?.avgCollabFriendliness || 0}%</CardTitle><CardDescription>Avg Collab Score</CardDescription></CardHeader></Card>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Brands by Status</CardTitle></CardHeader>
                <CardContent>
                  {Object.entries(stats?.brandsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between py-1">
                      <span className="capitalize">{status}</span>
                      <Badge variant={status === 'active' ? 'default' : 'secondary'}>{count as number}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Contacts by Type</CardTitle></CardHeader>
                <CardContent>
                  {Object.entries(stats?.contactsByType || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between py-1">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* INGEST */}
          <TabsContent value="ingest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-logo-green" /> Ingest from Existing Gear Database</CardTitle>
                <CardDescription>Read-only import of brands and products from our gear knowledge base</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">This will extract all unique manufacturers from our existing gear data and create brand records for enrichment.</p>
                <div className="flex gap-4">
                  <Button onClick={runIngest} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                    Run Ingest
                  </Button>
                  <Button variant="outline" onClick={() => runVerification()} disabled={isLoading}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Verify All Brands
                  </Button>
                  <Button variant="outline" onClick={() => runFindOwnership()} disabled={isLoading}>
                    <Search className="h-4 w-4 mr-2" /> Find Ownership & Policies
                  </Button>
                  <Button variant="outline" onClick={() => runFindContacts()} disabled={isLoading}>
                    <Users className="h-4 w-4 mr-2" /> Find Key Contacts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BRANDS */}
          <TabsContent value="brands" className="space-y-4">
            <div className="flex items-center gap-4">
              <Input placeholder="Search brands..." value={brandFilter.search} onChange={(e) => setBrandFilter(prev => ({ ...prev, search: e.target.value }))} className="max-w-xs" />
              <Select value={brandFilter.status} onValueChange={(v) => setBrandFilter(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => exportData('brands')}><Download className="h-4 w-4 mr-2" /> Export</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Collab Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBrands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell className="font-medium">{brand.brand_name}</TableCell>
                          <TableCell><Badge variant={brand.status === 'active' ? 'default' : 'secondary'}>{brand.status}</Badge></TableCell>
                          <TableCell>{brand.headquarters_country || '-'}</TableCell>
                          <TableCell>{brand.parent_company_name || '-'}</TableCell>
                          <TableCell>
                            {brand.brand_website_url && <a href={brand.brand_website_url} target="_blank" rel="noopener noreferrer" className="text-logo-green hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />Link</a>}
                          </TableCell>
                          <TableCell>{brand.verification_confidence || 0}%</TableCell>
                          <TableCell>{brand.collaboration_friendliness_score || 0}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTS */}
          <TabsContent value="products">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Year</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.product_name}</TableCell>
                          <TableCell>{product.gear_brands?.brand_name || '-'}</TableCell>
                          <TableCell><Badge variant="outline">{product.product_type?.replace('_', ' ')}</Badge></TableCell>
                          <TableCell><Badge variant={product.product_status === 'currently_manufactured' ? 'default' : 'secondary'}>{product.product_status?.replace('_', ' ')}</Badge></TableCell>
                          <TableCell>{product.year_introduced || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTACTS */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1" />
              <Button variant="outline" onClick={() => exportData('contacts')}><Download className="h-4 w-4 mr-2" /> Export</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>{contact.gear_brands?.brand_name || '-'}</TableCell>
                          <TableCell><Badge variant="outline">{contact.contact_type?.replace('_', ' ')}</Badge></TableCell>
                          <TableCell>{contact.contact_person_name || '-'}</TableCell>
                          <TableCell>{contact.role_title || '-'}</TableCell>
                          <TableCell>{contact.email || contact.contact_form_url ? 'Available' : '-'}</TableCell>
                          <TableCell className="capitalize">{contact.region_coverage?.replace('_', ' ')}</TableCell>
                          <TableCell>{contact.enrichment_confidence}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OUTREACH */}
          <TabsContent value="outreach" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Generate Outreach</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Brand</Label>
                    <Select value={outreachForm.brandId} onValueChange={(v) => setOutreachForm(prev => ({ ...prev, brandId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Choose a brand..." /></SelectTrigger>
                      <SelectContent>
                        {brands.filter(b => b.status === 'active').map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.brand_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Project Context</Label>
                    <Textarea value={outreachForm.projectContext} onChange={(e) => setOutreachForm(prev => ({ ...prev, projectContext: e.target.value }))} rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Collaboration Type</Label>
                      <Select value={outreachForm.collaborationType} onValueChange={(v) => setOutreachForm(prev => ({ ...prev, collaborationType: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content_collab">Content Collaboration</SelectItem>
                          <SelectItem value="artist_feature">Artist Feature</SelectItem>
                          <SelectItem value="press_review">Press Review</SelectItem>
                          <SelectItem value="sponsorship">Sponsorship</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tone</Label>
                      <Select value={outreachForm.tone} onValueChange={(v: any) => setOutreachForm(prev => ({ ...prev, tone: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scene_native">Scene Native</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="journalist">Journalist</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={generateOutreach} disabled={isLoading} className="w-full">
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                    Generate with Anthropic
                  </Button>
                </CardContent>
              </Card>

              {generatedOutreach && (
                <Card>
                  <CardHeader><CardTitle>Generated Outreach</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label className="text-muted-foreground">Subject</Label><p className="font-medium">{generatedOutreach.email_subject}</p></div>
                    <div><Label className="text-muted-foreground">Email</Label><ScrollArea className="h-32 border rounded p-2"><p className="text-sm whitespace-pre-wrap">{generatedOutreach.email_body}</p></ScrollArea></div>
                    <div><Label className="text-muted-foreground">Best Approach</Label><p className="text-sm">{generatedOutreach.best_approach_notes}</p></div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings">
            <Card>
              <CardHeader><CardTitle>Agent Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Configuration options for the Gear Manufacturer Intelligence Agent.</p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => runVerification()}>Run Weekly Refresh</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
