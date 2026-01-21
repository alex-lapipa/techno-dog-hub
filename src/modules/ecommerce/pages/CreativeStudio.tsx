/**
 * techno.dog E-commerce Module - Creative Studio
 * 
 * Design tools with READ-ONLY access to brand books.
 * Brand books are only modifiable by Alex Lawton.
 */

import { useState, useEffect } from 'react';
import { Palette, Lock, Eye, BookOpen, Dog, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';

// Import design system configs (READ-ONLY)
import technoDogDesign from '@/config/design-system-techno-dog.json';
import doggiesDesign from '@/config/design-system-doggies.json';

interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'font' | 'effect';
}

export function CreativeStudio() {
  const [activeTab, setActiveTab] = useState('overview');
  const [technoDogTokens, setTechnoDogTokens] = useState<DesignToken[]>([]);
  const [doggiesTokens, setDoggiesTokens] = useState<DesignToken[]>([]);

  useEffect(() => {
    // Extract color tokens from techno.dog design system (READ-ONLY)
    if (technoDogDesign?.colors?.core) {
      const tokens: DesignToken[] = Object.entries(technoDogDesign.colors.core).map(([name, data]: [string, any]) => ({
        name,
        value: data?.hex || data?.hsl || String(data),
        type: 'color' as const,
      }));
      setTechnoDogTokens(tokens);
    }

    // Extract mascot data from doggies design system (READ-ONLY)
    if (doggiesDesign?.mascots?.coreVariants) {
      const tokens: DesignToken[] = doggiesDesign.mascots.coreVariants.map((variant: any) => ({
        name: variant.displayName || variant.id,
        value: variant.personality || 'Techno mascot',
        type: 'effect' as const,
      }));
      setDoggiesTokens(tokens);
    }
  }, []);

  return (
    <AdminPageLayout
      title="Creative Studio"
      description="Design tools with read-only access to brand books"
      icon={Palette}
      iconColor="text-crimson"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-destructive/10 text-destructive font-mono text-[10px] uppercase">
            <Lock className="w-3 h-3 mr-1" />
            Brand Books Protected
          </Badge>
          {MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
            <ReadOnlyBadge />
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Security Notice */}
        <Card className="p-4 bg-destructive/5 border-destructive/20">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wide text-destructive font-medium">
                Brand Book Protection
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Brand books are <strong>read-only</strong> and serve as inspiration sources only. 
                Only <strong>Alex Lawton</strong> can modify brand guidelines.
              </p>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview" className="font-mono text-xs uppercase">Overview</TabsTrigger>
            <TabsTrigger value="techno-dog" className="font-mono text-xs uppercase">techno.dog</TabsTrigger>
            <TabsTrigger value="doggies" className="font-mono text-xs uppercase">Techno Doggies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* techno.dog Brand Book Reference */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-crimson/10 rounded">
                      <BookOpen className="w-5 h-5 text-crimson" />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                        techno.dog
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">Main design system</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    <Eye className="w-3 h-3 mr-1" />
                    View Only
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  VHS/Brutalist aesthetic with industrial influences. 
                  {technoDogTokens.length > 0 && ` ${technoDogTokens.length} design tokens loaded.`}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/admin/brand-book">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View Brand Book
                  </Link>
                </Button>
              </Card>

              {/* Techno Doggies Brand Book Reference */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-logo-green/10 rounded">
                      <Dog className="w-5 h-5 text-logo-green" />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                        Techno Doggies
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">Mascot design system</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    <Eye className="w-3 h-3 mr-1" />
                    View Only
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  94-variant Techno Talkies pack with stroke-only graphics.
                  {doggiesTokens.length > 0 && ` ${doggiesTokens.length} mascot variants loaded.`}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/admin/doggies-brand-book">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View Brand Book
                  </Link>
                </Button>
              </Card>
            </div>

            {/* Module Ready Card */}
            <Card className="p-8 bg-card border-border border-dashed mt-6">
              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Palette className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                  Creative Studio
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This module is prepared for design and content creation features.
                  Use the brand books above as read-only inspiration sources.
                </p>
                <span className="mt-4 inline-flex items-center px-3 py-1 text-[10px] font-mono uppercase tracking-wider bg-logo-green/10 text-logo-green rounded">
                  Ready for Development
                </span>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="techno-dog" className="mt-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-sm uppercase tracking-wide text-foreground">
                  techno.dog Design Tokens
                </h3>
                <Badge variant="outline" className="font-mono text-[10px]">
                  <Lock className="w-3 h-3 mr-1" />
                  Read-Only
                </Badge>
              </div>
              {technoDogTokens.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {technoDogTokens.slice(0, 8).map((token) => (
                    <div key={token.name} className="p-3 bg-muted/30 rounded border border-border/50">
                      <div 
                        className="w-full h-8 rounded mb-2 border border-border/30"
                        style={{ backgroundColor: token.value }}
                      />
                      <p className="font-mono text-[10px] text-foreground truncate">{token.name}</p>
                      <p className="font-mono text-[9px] text-muted-foreground truncate">{token.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading design tokens...</p>
              )}
              <Button asChild variant="ghost" size="sm" className="mt-4">
                <Link to="/admin/brand-book">
                  View Full Brand Book
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Link>
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="doggies" className="mt-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-sm uppercase tracking-wide text-foreground">
                  Techno Doggies Mascots
                </h3>
                <Badge variant="outline" className="font-mono text-[10px]">
                  <Lock className="w-3 h-3 mr-1" />
                  Read-Only
                </Badge>
              </div>
              {doggiesTokens.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {doggiesTokens.map((token) => (
                    <div key={token.name} className="p-3 bg-muted/30 rounded border border-border/50">
                      <div className="w-8 h-8 rounded-full bg-logo-green/10 flex items-center justify-center mb-2">
                        <Dog className="w-4 h-4 text-logo-green" />
                      </div>
                      <p className="font-mono text-[10px] text-foreground truncate">{token.name}</p>
                      <p className="font-mono text-[9px] text-muted-foreground truncate">{token.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading mascot data...</p>
              )}
              <Button asChild variant="ghost" size="sm" className="mt-4">
                <Link to="/admin/doggies-brand-book">
                  View Full Brand Book
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Link>
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}

export default CreativeStudio;
