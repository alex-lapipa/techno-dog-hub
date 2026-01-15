import { useState } from 'react';
import { Palette, Mail, Shirt, Smartphone, Globe, Share2, Download } from 'lucide-react';
import { AdminPageLayout } from '@/components/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DogSilhouette from '@/components/DogSilhouette';
import { DJDog, NinjaDog, SpaceDog, GrumpyDog, HappyDog, TechnoDog, DancingDog, AcidDog } from '@/components/DogPack';

// Download JSON helper
const downloadDesignSystem = async () => {
  try {
    const jsonData = (await import('@/config/design-system-doggies.json')).default;
    
    // Add export timestamp
    const exportData = { ...jsonData, meta: { ...jsonData.meta, exportedAt: new Date().toISOString() } };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-system-mascots-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Mascot design system exported successfully');
  } catch (error) {
    toast.error('Failed to export design system');
  }
};

const DoggiesBrandBook = () => {
  return (
    <AdminPageLayout
      title="TECHNO DOGGIES"
      description="Official mascot design system"
      icon={Palette}
      iconColor="text-logo-green"
      showSidebar={true}
    >
      {/* Hero Section */}
      <Card className="border-logo-green/50 bg-gradient-to-br from-logo-green/5 to-background mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-2">
              <DJDog className="w-12 h-12" />
              <NinjaDog className="w-12 h-12" />
              <SpaceDog className="w-12 h-12" />
              <GrumpyDog className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-logo-green">TECHNO DOGGIES</h2>
              <p className="text-sm text-muted-foreground">Official mascot design system</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mb-4">
            The Techno Doggies are bespoke SVG mascots representing the spirit of underground techno culture. 
            Each doggy has a unique personality and can be used across digital and physical applications.
            All doggies use the brand's Logo Green (#66ff66) and maintain transparent backgrounds.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadDesignSystem()}
            className="border-logo-green text-logo-green hover:bg-logo-green hover:text-background"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Mascot Design System
          </Button>
        </CardContent>
      </Card>

      {/* Nested Tabs for Doggies Sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="overview" className="flex-1 min-w-[100px] text-xs uppercase tracking-wider">Overview</TabsTrigger>
          <TabsTrigger value="digital" className="flex-1 min-w-[100px] text-xs uppercase tracking-wider">Digital</TabsTrigger>
          <TabsTrigger value="social" className="flex-1 min-w-[100px] text-xs uppercase tracking-wider">Social</TabsTrigger>
          <TabsTrigger value="apparel" className="flex-1 min-w-[100px] text-xs uppercase tracking-wider">Apparel</TabsTrigger>
          <TabsTrigger value="language" className="flex-1 min-w-[100px] text-xs uppercase tracking-wider">Language</TabsTrigger>
          <TabsTrigger value="guidelines" className="flex-1 min-w-[100px] text-xs uppercase tracking-wider">Guidelines</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 mt-6">
          {/* Core Variants */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">CORE VARIANTS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'DJ Dog', Component: DJDog, personality: 'The selector, dropping beats' },
                { name: 'Ninja Dog', Component: NinjaDog, personality: 'Silent warrior of the night' },
                { name: 'Space Dog', Component: SpaceDog, personality: 'Cosmic explorer of sound' },
                { name: 'Grumpy Dog', Component: GrumpyDog, personality: 'The cynical veteran' },
                { name: 'Happy Dog', Component: HappyDog, personality: 'Pure rave energy' },
                { name: 'Techno Dog', Component: TechnoDog, personality: 'Glitched out & digital' },
                { name: 'Dancing Dog', Component: DancingDog, personality: 'Always moving' },
                { name: 'Acid Dog', Component: AcidDog, personality: '303 vibes only' },
              ].map((dog) => (
                <div key={dog.name} className="border border-border p-4 hover:border-logo-green/50 transition-colors">
                  <div className="flex items-center justify-center h-20 mb-3">
                    <dog.Component className="w-16 h-16" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-center">{dog.name}</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">{dog.personality}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">TECHNICAL SPECIFICATIONS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">FORMAT</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• SVG (vector, scalable)</li>
                  <li>• Viewbox: 64x64</li>
                  <li>• Transparent background</li>
                  <li>• Stroke-based design</li>
                </ul>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">STYLING</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Stroke: hsl(var(--logo-green))</li>
                  <li>• Stroke width: 2-2.5px</li>
                  <li>• Line cap: round</li>
                  <li>• Line join: round</li>
                </ul>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">SIZING</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Minimum: 24x24px</li>
                  <li>• Recommended: 64x64px</li>
                  <li>• Maximum: Unlimited (vector)</li>
                  <li>• Safe area: 10% padding</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Digital Tab */}
        <TabsContent value="digital" className="space-y-8 mt-6">
          {/* Web Usage */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> WEB USAGE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3">DARK BACKGROUNDS</h4>
                <div className="flex items-center justify-center h-24 bg-background border border-muted rounded mb-3">
                  <DJDog className="w-16 h-16" />
                </div>
                <p className="text-xs text-muted-foreground">Primary usage. Logo green on dark.</p>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3">CARDS & CONTAINERS</h4>
                <div className="flex items-center justify-center h-24 bg-card border border-logo-green/20 rounded mb-3">
                  <SpaceDog className="w-16 h-16" />
                </div>
                <p className="text-xs text-muted-foreground">Subtle container with green border hint.</p>
              </div>
            </div>
          </div>

          {/* Mobile Usage */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> MOBILE USAGE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3">APP ICON</h4>
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-background border-2 border-logo-green rounded-xl flex items-center justify-center">
                    <DogSilhouette className="w-10 h-10" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">Centered, 60% of container</p>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3">NOTIFICATION</h4>
                <div className="flex items-center gap-3 bg-muted p-3 rounded">
                  <HappyDog className="w-8 h-8 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">New artist added</p>
                    <p className="text-muted-foreground">Check the archive</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">32x32px in notifications</p>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3">LOADING STATE</h4>
                <div className="flex items-center justify-center h-16">
                  <DancingDog className="w-12 h-12" animated />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">Animated variant for loaders</p>
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" /> EMAIL TEMPLATES
            </h3>
            <div className="flex justify-center">
              <div className="border border-border p-6 bg-background max-w-md w-full">
                <div className="border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <DogSilhouette className="w-10 h-10" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider">techno.dog</p>
                      <p className="text-xs text-muted-foreground">The Pack Updates</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <AcidDog className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold uppercase">NEW DOGGY ALERT</h3>
                      <p className="text-xs text-muted-foreground mt-1">The Acid Dog has joined the pack. 303 vibes incoming.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full border-logo-green text-logo-green">
                    MEET THE PACK
                  </Button>
                </div>
                <div className="border-t border-border mt-6 pt-4 text-center">
                  <p className="text-xs text-muted-foreground">techno.dog — The Pack</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-8 mt-6">
          {/* WhatsApp & Social */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4" /> WHATSAPP & SOCIAL
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3">STICKER FORMAT</h4>
                <div className="flex items-center justify-center h-32 bg-[#075e54] rounded mb-3">
                  <div className="bg-transparent p-2">
                    <NinjaDog className="w-20 h-20" />
                  </div>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• 512x512px PNG with transparency</li>
                  <li>• Max file size: 100KB</li>
                  <li>• No background color</li>
                </ul>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3">MESSAGE TEMPLATE</h4>
                <div className="bg-[#dcf8c6] text-black p-3 rounded-lg text-xs mb-3">
                  <p className="font-bold">I'm the Ninja Dog</p>
                  <p className="mt-1">Silent warrior of the underground. Moving through the shadows of the dancefloor.</p>
                  <p className="mt-2 text-[#075e54]">techno.dog/doggies #ninjadoggy</p>
                </div>
                <p className="text-xs text-muted-foreground">Always include hashtag + link</p>
              </div>
            </div>
          </div>

          {/* Hashtag & Share Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border p-4">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-3">HASHTAG FORMAT</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-logo-green font-mono">#technodoggy</span>
                  <span className="text-muted-foreground">— main pack tag</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-logo-green font-mono">#djdoggy</span>
                  <span className="text-muted-foreground">— individual variant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-logo-green font-mono">#ninjadoggy</span>
                  <span className="text-muted-foreground">— always lowercase</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
                Format: <code className="bg-muted px-1 rounded">#[name]doggy</code> — no spaces, all lowercase
              </p>
            </div>
            <div className="border border-border p-4">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-3">SHARE TEMPLATES</h4>
              <div className="space-y-3 text-xs">
                <div className="bg-muted/30 p-2 rounded">
                  <p className="font-bold">Short (SMS/Link):</p>
                  <p className="text-muted-foreground mt-1">"I'm the DJ Dog — Reading the floor is reading souls. #djdoggy"</p>
                </div>
                <div className="bg-muted/30 p-2 rounded">
                  <p className="font-bold">Full (WhatsApp):</p>
                  <p className="text-muted-foreground mt-1">"I'm the Ninja Dog — silent warrior of the underground. 'In at 2AM, out at 2PM. No photos. No evidence.' Join the pack: techno.dog/doggies #ninjadoggy"</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Apparel Tab */}
        <TabsContent value="apparel" className="space-y-8 mt-6">
          {/* Zero Tolerance Banner */}
          <div className="border-2 border-destructive bg-destructive/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              Zero Tolerance Policy
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-destructive mb-3">
              STRICT MERCHANDISE COMPLIANCE
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              ALL merchandise must strictly follow these guidelines. Non-compliant designs are <strong className="text-destructive">PROHIBITED</strong> and will not be approved for the Shopify store.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-destructive mb-2">MANDATORY RULES</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">×</span>
                    <span>ONLY use the 8 core Techno Doggy variants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">×</span>
                    <span>ONLY use Logo Green (#66ff66) or White for strokes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">×</span>
                    <span>ALWAYS use black fabric (dark backgrounds)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">×</span>
                    <span>ALWAYS use official SVG exports from DogPack.tsx</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-destructive mb-2">PROHIBITED</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>AI-generated or modified mascot versions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Custom colors, backgrounds, or effects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Distorted or restyled mascots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Non-core doggy variants for merchandise</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Approved Collection Lines */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">APPROVED COLLECTION LINES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-logo-green bg-logo-green/5 p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-logo-green mb-2">GREEN LINE</h4>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-black border border-border flex items-center justify-center">
                    <DJDog className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Black fabric + Logo Green mascot</p>
                    <p className="text-xs text-muted-foreground">Primary collection</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Example: "Green Line Hoodie – DJ Dog"
                </p>
              </div>
              <div className="border-2 border-foreground/50 bg-foreground/5 p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">WHITE LINE</h4>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-black border border-border flex items-center justify-center">
                    <svg viewBox="0 0 64 64" className="w-8 h-8" fill="none">
                      <g stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="32" cy="36" rx="16" ry="14" />
                        <circle cx="26" cy="32" r="2.5" />
                        <circle cx="38" cy="32" r="2.5" />
                      </g>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold">Black fabric + White mascot</p>
                    <p className="text-xs text-muted-foreground">Secondary collection</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Example: "White Line Tee – Space Dog"
                </p>
              </div>
            </div>
          </div>

          {/* Core 8 Variants for Apparel */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">APPROVED MASCOTS FOR MERCHANDISE</h3>
            <p className="text-xs text-muted-foreground mb-4">Only these 8 core variants may appear on official merchandise:</p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {[
                { name: 'DJ Dog', Component: DJDog },
                { name: 'Ninja Dog', Component: NinjaDog },
                { name: 'Space Dog', Component: SpaceDog },
                { name: 'Grumpy Dog', Component: GrumpyDog },
                { name: 'Happy Dog', Component: HappyDog },
                { name: 'Techno Dog', Component: TechnoDog },
                { name: 'Dancing Dog', Component: DancingDog },
                { name: 'Acid Dog', Component: AcidDog },
              ].map((dog) => (
                <div key={dog.name} className="border border-logo-green/30 bg-logo-green/5 p-2 text-center">
                  <dog.Component className="w-10 h-10 mx-auto mb-1" />
                  <p className="text-[9px] uppercase tracking-wider">{dog.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product Type Placements */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shirt className="w-4 h-4" /> PRODUCT PLACEMENTS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Cap */}
              <div className="border border-border p-4">
                <div className="relative h-24 bg-black rounded flex items-center justify-center mb-3">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-10 bg-[#1a1a1a] rounded-t-full border-2 border-border relative">
                      <div className="absolute top-1 left-1/2 -translate-x-1/2">
                        <DJDog className="w-6 h-6" />
                      </div>
                      <div className="absolute -bottom-1 left-0 right-0 h-2 bg-border rounded-b" />
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-center">CAP</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Front center, 40mm</p>
              </div>
              
              {/* Hoodie */}
              <div className="border border-border p-4">
                <div className="relative h-24 bg-black rounded flex items-center justify-center mb-3">
                  <div className="w-16 h-20 bg-[#1a1a1a] border-2 border-border rounded-sm relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-2 border-2 border-border rounded-full" />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2">
                      <NinjaDog className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-center">HOODIE</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Chest center, 120mm</p>
              </div>
              
              {/* T-Shirt */}
              <div className="border border-border p-4">
                <div className="relative h-24 bg-black rounded flex items-center justify-center mb-3">
                  <div className="w-14 h-16 bg-[#1a1a1a] border-2 border-border relative">
                    <div className="absolute -left-2 top-0 w-3 h-6 bg-[#1a1a1a] border-2 border-border" />
                    <div className="absolute -right-2 top-0 w-3 h-6 bg-[#1a1a1a] border-2 border-border" />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <SpaceDog className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-center">T-SHIRT</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Chest center, 100mm</p>
              </div>
              
              {/* Bandana */}
              <div className="border border-border p-4">
                <div className="relative h-24 bg-black rounded flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-[#1a1a1a] border-2 border-border rotate-45 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45">
                      <GrumpyDog className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-center">BANDANA</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Center tile, 80mm</p>
              </div>
              
              {/* Tote Bag */}
              <div className="border border-border p-4">
                <div className="relative h-24 bg-black rounded flex items-center justify-center mb-3">
                  <div className="relative">
                    <div className="absolute -top-2 left-1 w-1 h-4 bg-border rounded" />
                    <div className="absolute -top-2 right-1 w-1 h-4 bg-border rounded" />
                    <div className="w-14 h-16 bg-[#1a1a1a] border-2 border-border">
                      <div className="flex items-center justify-center h-full">
                        <TechnoDog className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-center">TOTE BAG</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Front center, 150mm</p>
              </div>
            </div>
          </div>
          
          {/* Print Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-logo-green/30 bg-logo-green/5 p-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-logo-green mb-2">PRINT REQUIREMENTS</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Export as PNG at 300 DPI minimum</li>
                <li>• Use CMYK color mode for print</li>
                <li>• Logo Green = C:60 M:0 Y:60 K:0</li>
                <li>• Maintain transparent background</li>
                <li>• Minimum clear space: 10% of logo size</li>
              </ul>
            </div>
            <div className="border border-border p-4">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-2">APPROVED FABRIC COLORS</h4>
              <div className="flex gap-2 mt-2">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-black border-2 border-logo-green" title="Black (Primary)" />
                  <span className="text-[9px] mt-1 text-logo-green">PRIMARY</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-[#1a1a1a] border border-border" title="Charcoal" />
                  <span className="text-[9px] mt-1 text-muted-foreground">CHARCOAL</span>
                </div>
              </div>
              <p className="text-xs text-destructive mt-3 font-bold">⚠ Black fabric ONLY — No light fabrics</p>
            </div>
          </div>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="space-y-8 mt-6">
          {/* Voice & Tone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border p-4">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-3">VOICE PRINCIPLES</h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li><span className="text-logo-green font-bold">Irreverent & Witty</span> — Self-aware humor, never takes itself too seriously</li>
                <li><span className="text-logo-green font-bold">Authentic & Underground</span> — Real rave culture, no mainstream clichés</li>
                <li><span className="text-logo-green font-bold">Gen Z Energy</span> — Casual slang ("no cap", "it's giving", "lowkey")</li>
                <li><span className="text-logo-green font-bold">Knowledgeable & Nerdy</span> — Deep gear refs, artist history, scene insider</li>
                <li><span className="text-logo-green font-bold">Inclusive & Warm</span> — Welcoming newcomers while respecting OGs</li>
              </ul>
            </div>
            <div className="border border-border p-4">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-3">TONE GUIDELINES</h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li><span className="text-destructive font-bold">AVOID:</span> Corporate speak, generic enthusiasm, AI-sounding phrases</li>
                <li><span className="text-destructive font-bold">AVOID:</span> "Amazing!", "Awesome!", overused emojis</li>
                <li><span className="text-logo-green font-bold">USE:</span> Specific gear references (303, 909, Minimoog)</li>
                <li><span className="text-logo-green font-bold">USE:</span> Scene terminology (selector, crate digging, the floor)</li>
                <li><span className="text-logo-green font-bold">USE:</span> Time/place anchors (4AM, warehouse, dark room)</li>
              </ul>
            </div>
          </div>

          {/* Slang Dictionary */}
          <div className="border border-border p-4">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3">APPROVED SLANG</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-muted/30 p-2 rounded">
                <span className="font-bold text-logo-green">no cap</span>
                <p className="text-muted-foreground mt-1">for real, honestly</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <span className="font-bold text-logo-green">lowkey</span>
                <p className="text-muted-foreground mt-1">subtly, quietly</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <span className="font-bold text-logo-green">it's giving</span>
                <p className="text-muted-foreground mt-1">it has the vibe of</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <span className="font-bold text-logo-green">ngl</span>
                <p className="text-muted-foreground mt-1">not gonna lie</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <span className="font-bold text-logo-green">fr fr</span>
                <p className="text-muted-foreground mt-1">for real for real</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <span className="font-bold text-logo-green">bussin</span>
                <p className="text-muted-foreground mt-1">extremely good</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <span className="font-bold text-logo-green">unhinged</span>
                <p className="text-muted-foreground mt-1">wild, chaotic energy</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <span className="font-bold text-logo-green">understood the assignment</span>
                <p className="text-muted-foreground mt-1">nailed it perfectly</p>
              </div>
            </div>
          </div>

          {/* Quote Examples by Personality */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3">DOGGY QUOTES — BY PERSONALITY</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Techno Dog */}
              <div className="border border-logo-green/30 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TechnoDog className="w-8 h-8" />
                  <span className="text-sm font-bold uppercase">Techno Dog</span>
                </div>
                <blockquote className="text-xs italic text-muted-foreground border-l-2 border-logo-green pl-3">
                  "Four to the floor. Eight hours straight. Zero small talk. This is the way."
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">Personality: Pure, uncompromising, minimal words</p>
              </div>

              {/* DJ Dog */}
              <div className="border border-logo-green/30 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DJDog className="w-8 h-8" />
                  <span className="text-sm font-bold uppercase">DJ Dog</span>
                </div>
                <blockquote className="text-xs italic text-muted-foreground border-l-2 border-logo-green pl-3">
                  "Reading the floor is reading souls. Also, no I won't play Sandstorm."
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">Personality: Confident, slightly dismissive, insider knowledge</p>
              </div>

              {/* Grumpy Dog */}
              <div className="border border-logo-green/30 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <GrumpyDog className="w-8 h-8" />
                  <span className="text-sm font-bold uppercase">Grumpy Dog</span>
                </div>
                <blockquote className="text-xs italic text-muted-foreground border-l-2 border-logo-green pl-3">
                  "Oh wow, another DJ playing that track. How original. *aggressively still dancing*"
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">Personality: Sarcastic but secretly loves it all</p>
              </div>

              {/* Ninja Dog */}
              <div className="border border-logo-green/30 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <NinjaDog className="w-8 h-8" />
                  <span className="text-sm font-bold uppercase">Ninja Dog</span>
                </div>
                <blockquote className="text-xs italic text-muted-foreground border-l-2 border-logo-green pl-3">
                  "In at 2AM, out at 2PM. No photos. No evidence. Only vibes."
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">Personality: Mysterious, stealthy, low-key legend</p>
              </div>

              {/* Space Dog */}
              <div className="border border-logo-green/30 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <SpaceDog className="w-8 h-8" />
                  <span className="text-sm font-bold uppercase">Space Dog</span>
                </div>
                <blockquote className="text-xs italic text-muted-foreground border-l-2 border-logo-green pl-3">
                  "Ground control to major woof: I've found intelligent life. They all have good taste in synths."
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">Personality: Cosmic, dreamy, transcendent</p>
              </div>

              {/* Acid Dog */}
              <div className="border border-logo-green/30 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AcidDog className="w-8 h-8" />
                  <span className="text-sm font-bold uppercase">Acid Dog</span>
                </div>
                <blockquote className="text-xs italic text-muted-foreground border-l-2 border-logo-green pl-3">
                  "One pattern. Eight hours. Infinite depth. You think it's repetitive until you're hypnotized."
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">Personality: Trippy, deep, 303-obsessed</p>
              </div>
            </div>
          </div>

          {/* Ambient Message Examples */}
          <div className="border border-border p-4">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3">FLOATING DOG AMBIENT MESSAGES</h4>
            <p className="text-xs text-muted-foreground mb-3">Short, punchy Gen Z style messages for the floating dog button:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-background/80 border border-logo-green/30 rounded-lg px-3 py-2 text-xs font-mono">
                "no cap surgeon understood the assignment"
              </div>
              <div className="bg-background/80 border border-logo-green/30 rounded-lg px-3 py-2 text-xs font-mono">
                "the 303 is mother and that's on period"
              </div>
              <div className="bg-background/80 border border-logo-green/30 rounded-lg px-3 py-2 text-xs font-mono">
                "it's giving warehouse at 4am realness"
              </div>
              <div className="bg-background/80 border border-logo-green/30 rounded-lg px-3 py-2 text-xs font-mono">
                "lowkey obsessed with detroit techno rn"
              </div>
              <div className="bg-background/80 border border-logo-green/30 rounded-lg px-3 py-2 text-xs font-mono">
                "this vinyl is bussin fr fr"
              </div>
              <div className="bg-background/80 border border-logo-green/30 rounded-lg px-3 py-2 text-xs font-mono">
                "the kick drum said slay and left"
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-8 mt-6">
          {/* Do's and Don'ts */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">USAGE GUIDELINES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-logo-green/30 bg-logo-green/5 p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-logo-green mb-2">DO</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use official SVG components only</li>
                  <li>• Maintain transparent backgrounds</li>
                  <li>• Scale proportionally</li>
                  <li>• Use on dark backgrounds for best visibility</li>
                  <li>• Include hashtag when sharing (#[name]doggy)</li>
                  <li>• Credit techno.dog on external uses</li>
                </ul>
              </div>
              <div className="border border-destructive/30 bg-destructive/5 p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-destructive mb-2">DON'T</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Change the logo green color</li>
                  <li>• Add backgrounds or effects</li>
                  <li>• Distort or stretch the doggies</li>
                  <li>• Use on busy or colorful backgrounds</li>
                  <li>• Combine with generic dog emojis</li>
                  <li>• Use for commercial purposes without permission</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="border border-border p-4">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3">QUICK REFERENCE</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="font-bold text-logo-green mb-1">Web Sizes</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Icon: 24-32px</li>
                  <li>• Card: 48-64px</li>
                  <li>• Hero: 128-256px</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-logo-green mb-1">Print Sizes</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Cap: 40mm</li>
                  <li>• T-Shirt: 100mm</li>
                  <li>• Hoodie: 120mm</li>
                  <li>• Tote: 150mm</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-logo-green mb-1">Color Codes</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• HEX: #66ff66</li>
                  <li>• RGB: 102, 255, 102</li>
                  <li>• CMYK: 60, 0, 60, 0</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default DoggiesBrandBook;
