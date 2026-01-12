import { useState } from 'react';
import { Palette, Type, Zap, Layout, Mail, MessageSquare, Copy, Check } from 'lucide-react';
import { AdminPageLayout } from '@/components/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import DogSilhouette from '@/components/DogSilhouette';

// Brand Book Configuration
const BRAND_CONFIG = {
  name: 'techno.dog',
  tagline: 'Global Techno Knowledge Hub',
  mission: 'The definitive, open-source archive and living encyclopedia of underground techno culture.',
};

// Color Palette
const COLOR_PALETTE = {
  core: [
    { name: 'Background', variable: '--background', value: '0 0% 4%', hex: '#0a0a0a', usage: 'Main background' },
    { name: 'Foreground', variable: '--foreground', value: '0 0% 100%', hex: '#ffffff', usage: 'Primary text' },
    { name: 'Card', variable: '--card', value: '0 0% 5%', hex: '#0d0d0d', usage: 'Card backgrounds' },
    { name: 'Muted', variable: '--muted', value: '0 0% 10%', hex: '#1a1a1a', usage: 'Secondary backgrounds' },
    { name: 'Border', variable: '--border', value: '0 0% 20%', hex: '#333333', usage: 'Borders & dividers' },
  ],
  accent: [
    { name: 'Logo Green', variable: '--logo-green', value: '100 100% 60%', hex: '#66ff66', usage: 'Primary brand color, CTAs' },
    { name: 'Crimson', variable: '--crimson', value: '348 75% 52%', hex: '#d93251', usage: 'Highlights, VHS aesthetic' },
    { name: 'Glitch Cyan', variable: '--glitch-1', value: '180 100% 50%', hex: '#00ffff', usage: 'Glitch effect color 1' },
    { name: 'Glitch Magenta', variable: '--glitch-2', value: '320 100% 60%', hex: '#ff33cc', usage: 'Glitch effect color 2' },
  ],
  semantic: [
    { name: 'Destructive', variable: '--destructive', value: '0 70% 50%', hex: '#d93636', usage: 'Errors, destructive actions' },
    { name: 'Primary', variable: '--primary', value: '0 0% 100%', hex: '#ffffff', usage: 'Primary interactive elements' },
    { name: 'Secondary', variable: '--secondary', value: '0 0% 15%', hex: '#262626', usage: 'Secondary elements' },
  ],
};

// Typography
const TYPOGRAPHY = {
  families: [
    { name: 'IBM Plex Mono', usage: 'Primary font for all text', weight: '300-700' },
    { name: 'Space Mono', usage: 'Fallback monospace', weight: '400, 700' },
  ],
  styles: [
    { name: 'H1', class: 'text-4xl md:text-6xl font-bold uppercase tracking-[0.15em]', sample: 'TECHNO.DOG' },
    { name: 'H2', class: 'text-2xl md:text-4xl font-bold uppercase tracking-[0.15em]', sample: 'SECTION HEADER' },
    { name: 'H3', class: 'text-xl md:text-2xl font-semibold uppercase tracking-[0.1em]', sample: 'SUBSECTION' },
    { name: 'Body', class: 'text-sm font-normal tracking-[0.05em]', sample: 'Standard body text for paragraphs and descriptions.' },
    { name: 'Code', class: 'text-xs font-mono uppercase tracking-[0.1em]', sample: 'CODE_TEXT_STYLE' },
    { name: 'Label', class: 'text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground', sample: 'FORM LABEL' },
  ],
};

// Effects & Animations
const EFFECTS = [
  { name: 'Glitch Hover', class: 'animate-glitch-hover', description: 'Chromatic aberration on hover' },
  { name: 'Flicker', class: 'animate-flicker', description: 'Subtle opacity flicker' },
  { name: 'Float', class: 'animate-float-slow', description: 'Gentle floating motion' },
  { name: 'Border Flicker', class: 'animate-border-flicker border-2 border-logo-green', description: 'Green border pulse' },
  { name: 'Neon Pulse', class: 'animate-neon-pulse', description: 'Glowing pulse effect' },
  { name: 'Fade In', class: 'animate-fade-in', description: 'Smooth entry animation' },
];

// Card Templates
const CARD_TEMPLATES = [
  { name: 'Standard', variant: 'default' },
  { name: 'Featured', variant: 'featured' },
  { name: 'VHS', variant: 'vhs' },
  { name: 'Brutalist', variant: 'brutalist' },
];

// Copy to clipboard helper
const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};

// Color Swatch Component
const ColorSwatch = ({ name, variable, value, hex, usage }: typeof COLOR_PALETTE.core[0]) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    copyToClipboard(`hsl(var(${variable}))`, name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  return (
    <div 
      className="group border border-border p-4 hover:border-foreground transition-colors cursor-pointer"
      onClick={handleCopy}
    >
      <div 
        className="w-full h-16 mb-3 border border-border"
        style={{ backgroundColor: hex }}
      />
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">{name}</span>
          {copied ? <Check className="w-3 h-3 text-logo-green" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
        <p className="text-xs text-muted-foreground font-mono">{variable}</p>
        <p className="text-xs text-muted-foreground">{hex}</p>
        <p className="text-xs text-muted-foreground/60">{usage}</p>
      </div>
    </div>
  );
};

// Typography Sample
const TypeSample = ({ name, className, sample }: { name: string; className: string; sample: string }) => (
  <div className="border border-border p-4 space-y-2">
    <div className="flex items-center justify-between">
      <Badge variant="outline" className="text-xs">{name}</Badge>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => copyToClipboard(className, name)}
        className="h-6 px-2"
      >
        <Copy className="w-3 h-3" />
      </Button>
    </div>
    <p className={className}>{sample}</p>
    <code className="text-xs text-muted-foreground block bg-muted p-2 mt-2 break-all">{className}</code>
  </div>
);

// Effect Demo
const EffectDemo = ({ name, class: effectClass, description }: typeof EFFECTS[0]) => (
  <div className="border border-border p-4 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wider">{name}</span>
      <Button
        variant="ghost" 
        size="sm" 
        onClick={() => copyToClipboard(effectClass, name)}
        className="h-6 px-2"
      >
        <Copy className="w-3 h-3" />
      </Button>
    </div>
    <div className={`h-12 flex items-center justify-center border border-muted ${effectClass}`}>
      <span className="text-sm">DEMO</span>
    </div>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

// Card Template Preview
const CardTemplatePreview = ({ variant }: { variant: string }) => {
  const getCardStyles = () => {
    switch (variant) {
      case 'featured':
        return 'border-crimson bg-card hover:border-logo-green';
      case 'vhs':
        return 'border-crimson/30 bg-card vhs-overlay film-border';
      case 'brutalist':
        return 'border-foreground bg-transparent hover:bg-foreground hover:text-background';
      default:
        return 'border-border bg-card hover:border-foreground';
    }
  };

  return (
    <Card className={`transition-all duration-300 ${getCardStyles()}`}>
      <CardHeader className="p-4">
        <CardTitle className="text-sm">{variant.toUpperCase()}</CardTitle>
        <CardDescription className="text-xs">Card template variant</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">Sample content for the {variant} card style.</p>
      </CardContent>
    </Card>
  );
};

// Email Template
const EmailTemplate = () => (
  <div className="border border-border p-6 bg-background max-w-md">
    <div className="border-b border-border pb-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <DogSilhouette className="w-6 h-6" />
        <span className="text-sm font-bold uppercase tracking-wider">techno.dog</span>
      </div>
      <p className="text-xs text-muted-foreground">Global Techno Knowledge Hub</p>
    </div>
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">EMAIL SUBJECT</h2>
      <p className="text-sm text-muted-foreground">
        Body text goes here. Keep it concise and on-brand with the underground techno aesthetic.
      </p>
      <Button variant="outline" size="sm" className="w-full">
        CALL TO ACTION
      </Button>
    </div>
    <div className="border-t border-border mt-6 pt-4">
      <p className="text-xs text-muted-foreground text-center">
        techno.dog — Built by the scene, for the scene
      </p>
    </div>
  </div>
);

// WhatsApp Template
const WhatsAppTemplate = () => (
  <div className="border border-border p-4 bg-background max-w-sm">
    <div className="bg-muted rounded p-3 mb-2">
      <p className="text-sm">
        <span className="font-bold text-logo-green">techno.dog</span> update:
      </p>
      <p className="text-sm mt-1">New artist added to the archive. Check it out.</p>
      <p className="text-xs text-muted-foreground mt-2">techno.dog/artists/name</p>
    </div>
    <p className="text-xs text-muted-foreground">Keep messages brief. No emojis. Link only.</p>
  </div>
);

// Button Variants Display
const ButtonVariantsDisplay = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="space-y-2">
      <Button variant="default" className="w-full">DEFAULT</Button>
      <code className="text-xs text-muted-foreground block">variant="default"</code>
    </div>
    <div className="space-y-2">
      <Button variant="outline" className="w-full">OUTLINE</Button>
      <code className="text-xs text-muted-foreground block">variant="outline"</code>
    </div>
    <div className="space-y-2">
      <Button variant="brutalist" className="w-full">BRUTALIST</Button>
      <code className="text-xs text-muted-foreground block">variant="brutalist"</code>
    </div>
    <div className="space-y-2">
      <Button variant="terminal" className="w-full">TERMINAL</Button>
      <code className="text-xs text-muted-foreground block">variant="terminal"</code>
    </div>
    <div className="space-y-2">
      <Button variant="destructive" className="w-full">DESTRUCTIVE</Button>
      <code className="text-xs text-muted-foreground block">variant="destructive"</code>
    </div>
    <div className="space-y-2">
      <Button variant="secondary" className="w-full">SECONDARY</Button>
      <code className="text-xs text-muted-foreground block">variant="secondary"</code>
    </div>
    <div className="space-y-2">
      <Button variant="ghost" className="w-full">GHOST</Button>
      <code className="text-xs text-muted-foreground block">variant="ghost"</code>
    </div>
    <div className="space-y-2">
      <Button variant="link" className="w-full">LINK</Button>
      <code className="text-xs text-muted-foreground block">variant="link"</code>
    </div>
  </div>
);

// Logo Usage Guidelines
const LogoUsage = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="border border-border p-6 space-y-4">
      <div className="flex items-center justify-center h-24 bg-background border border-muted">
        <DogSilhouette className="w-16 h-16" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-center">DARK BACKGROUND</p>
      <p className="text-xs text-muted-foreground text-center">Primary usage — Logo green on dark</p>
    </div>
    <div className="border border-border p-6 space-y-4">
      <div className="flex items-center justify-center h-24 bg-foreground border border-muted">
        <DogSilhouette className="w-16 h-16 [&_g]:stroke-background [&_ellipse]:fill-background" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-center">LIGHT BACKGROUND</p>
      <p className="text-xs text-muted-foreground text-center">Inverted — Black on light</p>
    </div>
    <div className="border border-border p-6 space-y-4">
      <div className="flex items-center justify-center h-24 bg-crimson border border-muted">
        <DogSilhouette className="w-16 h-16 [&_g]:stroke-foreground [&_ellipse]:fill-foreground" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-center">ACCENT BACKGROUND</p>
      <p className="text-xs text-muted-foreground text-center">White logo on crimson</p>
    </div>
  </div>
);

// Icon Guidelines
const IconGuidelines = () => (
  <div className="space-y-6">
    <div className="border border-logo-green/30 bg-logo-green/5 p-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-logo-green mb-2">APPROVED</h4>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li>• DogSilhouette — The ONLY dog icon allowed</li>
        <li>• Custom SVG variants from DogPack.tsx</li>
        <li>• Lucide icons (non-AI, non-dog): ArrowLeft, RefreshCw, CheckCircle, etc.</li>
        <li>• Black heart symbol: 🖤 (sparingly)</li>
      </ul>
    </div>
    <div className="border border-destructive/30 bg-destructive/5 p-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-destructive mb-2">PROHIBITED</h4>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li>• ALL standard Unicode emojis</li>
        <li>• Generic dog icons from lucide-react</li>
        <li>• AI-related icons: Bot, Brain, Sparkles, Wand</li>
        <li>• External icon libraries not approved</li>
      </ul>
    </div>
  </div>
);

const BrandBookAdmin = () => {
  return (
    <AdminPageLayout
      title="BRAND BOOK"
      description="Complete design system and brand guidelines"
      icon={Palette}
      iconColor="text-logo-green"
      showSidebar={true}
    >
      {/* Brand Identity Header */}
      <Card className="border-logo-green/30 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <DogSilhouette className="w-16 h-16" />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider">{BRAND_CONFIG.name}</h1>
              <p className="text-sm text-logo-green uppercase tracking-wider">{BRAND_CONFIG.tagline}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">{BRAND_CONFIG.mission}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-1 h-auto p-1 bg-muted">
          <TabsTrigger value="colors" className="text-xs py-2">
            <Palette className="w-3 h-3 mr-1" /> Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="text-xs py-2">
            <Type className="w-3 h-3 mr-1" /> Type
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-xs py-2">
            <Zap className="w-3 h-3 mr-1" /> Effects
          </TabsTrigger>
          <TabsTrigger value="components" className="text-xs py-2">
            <Layout className="w-3 h-3 mr-1" /> Components
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs py-2">
            <Mail className="w-3 h-3 mr-1" /> Templates
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="text-xs py-2">
            <MessageSquare className="w-3 h-3 mr-1" /> Guidelines
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">CORE PALETTE</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {COLOR_PALETTE.core.map((color) => (
                <ColorSwatch key={color.variable} {...color} />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">ACCENT COLORS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COLOR_PALETTE.accent.map((color) => (
                <ColorSwatch key={color.variable} {...color} />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">SEMANTIC COLORS</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {COLOR_PALETTE.semantic.map((color) => (
                <ColorSwatch key={color.variable} {...color} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">FONT FAMILIES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TYPOGRAPHY.families.map((font) => (
                <div key={font.name} className="border border-border p-4">
                  <p className="text-lg font-bold" style={{ fontFamily: font.name }}>{font.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{font.usage}</p>
                  <p className="text-xs text-muted-foreground">Weights: {font.weight}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">TYPE SCALE</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TYPOGRAPHY.styles.map((style) => (
                <TypeSample key={style.name} name={style.name} className={style.class} sample={style.sample} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">ANIMATIONS & EFFECTS</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {EFFECTS.map((effect) => (
                <EffectDemo key={effect.name} {...effect} />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">UTILITY CLASSES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase mb-2">SCANLINES</h4>
                <div className="h-20 bg-muted relative scanlines" />
                <code className="text-xs text-muted-foreground block mt-2">className="scanlines"</code>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase mb-2">VHS OVERLAY</h4>
                <div className="h-20 bg-muted relative vhs-overlay" />
                <code className="text-xs text-muted-foreground block mt-2">className="vhs-overlay"</code>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase mb-2">NOISE TEXTURE</h4>
                <div className="h-20 bg-muted relative noise" />
                <code className="text-xs text-muted-foreground block mt-2">className="noise"</code>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase mb-2">FILM BORDER</h4>
                <div className="h-20 bg-muted border-2 film-border" />
                <code className="text-xs text-muted-foreground block mt-2">className="film-border"</code>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">BUTTON VARIANTS</h3>
            <ButtonVariantsDisplay />
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">CARD TEMPLATES</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CARD_TEMPLATES.map((card) => (
                <CardTemplatePreview key={card.variant} variant={card.variant} />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">BADGE VARIANTS</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">DEFAULT</Badge>
              <Badge variant="secondary">SECONDARY</Badge>
              <Badge variant="destructive">DESTRUCTIVE</Badge>
              <Badge variant="outline">OUTLINE</Badge>
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">EMAIL TEMPLATE</h3>
            <div className="flex justify-center">
              <EmailTemplate />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">WHATSAPP MESSAGE</h3>
            <div className="flex justify-center">
              <WhatsAppTemplate />
            </div>
          </div>
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">LOGO USAGE</h3>
            <LogoUsage />
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">ICON POLICY</h3>
            <IconGuidelines />
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">VOICE & TONE</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-logo-green mb-2">DO</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Be direct and authoritative</li>
                  <li>• Use underground techno terminology naturally</li>
                  <li>• Speak with passion about the culture</li>
                  <li>• Keep messaging concise</li>
                  <li>• Use UPPERCASE for emphasis</li>
                </ul>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-destructive mb-2">DON'T</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use corporate or overly formal language</li>
                  <li>• Add emojis to communications</li>
                  <li>• Be condescending to newcomers</li>
                  <li>• Promote commercial/mainstream content</li>
                  <li>• Fabricate information</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">DESIGN PRINCIPLES</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">BRUTALIST</h4>
                <p className="text-xs text-muted-foreground">Raw, honest, no unnecessary decoration. Function over form.</p>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">VHS / FILM</h4>
                <p className="text-xs text-muted-foreground">Nostalgic, textured, with scanlines and grain. The underground aesthetic.</p>
              </div>
              <div className="border border-border p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">TERMINAL</h4>
                <p className="text-xs text-muted-foreground">Monospace type, green accents, data-driven displays.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default BrandBookAdmin;
