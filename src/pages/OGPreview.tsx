import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, ExternalLink, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { OG_ROUTE_CONFIG, getOGConfigForRoute, OG_CACHE_VERSION } from '@/config/og-config';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const BASE_URL = 'https://techno.dog';

interface RoutePreview {
  route: string;
  title: string;
  tagline: string;
  doggy: string;
  skin: string;
  icon: string;
  ogImageUrl: string;
  issues: string[];
}

export default function OGPreview() {
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'whatsapp' | 'slack' | 'twitter' | 'linkedin'>('whatsapp');

  // Generate previews for all configured routes
  const routePreviews = useMemo<RoutePreview[]>(() => {
    return OG_ROUTE_CONFIG.map(config => {
      const issues: string[] = [];
      
      // Validation checks
      if (!config.defaultHeadline || config.defaultHeadline.length > 60) {
        issues.push('Title too long or missing (max 60 chars)');
      }
      if (!config.tagline || config.tagline.length > 100) {
        issues.push('Tagline too long or missing (max 100 chars)');
      }
      
      const ogImageUrl = `${BASE_URL}/api/og?route=${encodeURIComponent(config.route)}&v=${OG_CACHE_VERSION}`;
      
      return {
        route: config.route,
        title: config.defaultHeadline,
        tagline: config.tagline,
        doggy: config.doggy,
        skin: config.skin,
        icon: config.icon,
        ogImageUrl,
        issues,
      };
    });
  }, []);

  // Filter routes
  const filteredPreviews = useMemo(() => {
    if (!filterText) return routePreviews;
    const lower = filterText.toLowerCase();
    return routePreviews.filter(p => 
      p.route.toLowerCase().includes(lower) || 
      p.title.toLowerCase().includes(lower) ||
      p.doggy.toLowerCase().includes(lower)
    );
  }, [routePreviews, filterText]);

  const copyWhatsAppTestLink = async (route: string) => {
    const testUrl = `${BASE_URL}${route}`;
    const message = `Testing OG preview for: ${testUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    try {
      await navigator.clipboard.writeText(whatsappUrl);
      setCopiedUrl(route);
      toast.success('WhatsApp test link copied');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const refreshOGImage = (route: string) => {
    setRefreshKey(prev => prev + 1);
    toast.success('Refreshing OG image...');
  };

  // Platform-specific preview dimensions
  const platformDimensions = {
    whatsapp: { width: 400, height: 209, label: 'WhatsApp' },
    slack: { width: 360, height: 188, label: 'Slack' },
    twitter: { width: 500, height: 262, label: 'Twitter/X' },
    linkedin: { width: 520, height: 272, label: 'LinkedIn' },
  };

  const currentDim = platformDimensions[selectedPlatform];

  // Count issues
  const totalIssues = routePreviews.reduce((acc, p) => acc + p.issues.length, 0);

  if (adminLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <AdminPageLayout
      title="OG Preview Dashboard"
      description="Test and preview Open Graph images for WhatsApp, Slack, Twitter, and LinkedIn sharing"
    >
      <Helmet>
        <title>OG Preview | Admin | techno.dog</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Status bar */}
      <div className="flex items-center gap-4 mb-6">
        <Badge variant={totalIssues === 0 ? 'default' : 'destructive'} className="gap-1">
          {totalIssues === 0 ? (
            <><CheckCircle className="h-3 w-3" /> All routes valid</>
          ) : (
            <><AlertTriangle className="h-3 w-3" /> {totalIssues} issues found</>
          )}
        </Badge>
        <Badge variant="outline">{routePreviews.length} routes configured</Badge>
        <Badge variant="outline">Cache v{OG_CACHE_VERSION}</Badge>
      </div>

      {/* Platform selector */}
      <div className="mb-6">
        <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as typeof selectedPlatform)}>
          <TabsList>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="slack">Slack</TabsTrigger>
            <TabsTrigger value="twitter">Twitter/X</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Input
          placeholder="Filter by route, title, or doggy..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Route previews grid */}
      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPreviews.map((preview) => (
            <Card key={preview.route} className={preview.issues.length > 0 ? 'border-destructive/50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-mono">{preview.route}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{preview.skin}</Badge>
                    <Badge variant="secondary">{preview.doggy}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{preview.title}</p>
              </CardHeader>
              <CardContent>
                {/* OG Image Preview */}
                <div 
                  className="relative bg-muted rounded-lg overflow-hidden mb-4 border border-border/50"
                  style={{ 
                    width: '100%', 
                    maxWidth: currentDim.width,
                    aspectRatio: '1.91/1'
                  }}
                >
                  <img
                    key={`${preview.route}-${refreshKey}`}
                    src={`${preview.ogImageUrl}&_r=${refreshKey}`}
                    alt={`OG preview for ${preview.route}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/og-image.png';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {currentDim.label}
                    </Badge>
                  </div>
                </div>

                {/* OG Tags */}
                <div className="text-xs font-mono bg-muted/50 p-3 rounded-lg mb-4 space-y-1 overflow-x-auto">
                  <div><span className="text-muted-foreground">og:title:</span> {preview.title}</div>
                  <div><span className="text-muted-foreground">og:description:</span> {preview.tagline}</div>
                  <div><span className="text-muted-foreground">og:image:</span> <span className="text-logo-green">{preview.ogImageUrl}</span></div>
                  <div><span className="text-muted-foreground">og:url:</span> {BASE_URL}{preview.route}</div>
                </div>

                {/* Issues */}
                {preview.issues.length > 0 && (
                  <div className="mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                    {preview.issues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {issue}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => copyWhatsAppTestLink(preview.route)}
                  >
                    {copiedUrl === preview.route ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    WhatsApp Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshOGImage(preview.route)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={`${BASE_URL}${preview.route}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Documentation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <h4>Adding a new page</h4>
          <ol className="text-sm text-muted-foreground">
            <li>Add route config to <code>src/config/og-config.ts</code></li>
            <li>Set doggy variant, icon, skin, and tagline</li>
            <li>Use <code>PageSEO</code> component with custom image URL</li>
          </ol>
          
          <h4>Testing WhatsApp previews</h4>
          <ol className="text-sm text-muted-foreground">
            <li>Click "WhatsApp Test" to copy the share link</li>
            <li>Paste in a WhatsApp chat to yourself</li>
            <li>WhatsApp caches aggressively - bump <code>OG_CACHE_VERSION</code> to refresh</li>
          </ol>
          
          <h4>Cache busting</h4>
          <p className="text-sm text-muted-foreground">
            Change <code>OG_CACHE_VERSION</code> in <code>og-config.ts</code> to force WhatsApp to re-fetch images.
          </p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
