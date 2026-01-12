import { useState } from 'react';
import { Palette, Type, Zap, Layout, Mail, MessageSquare, Copy, Check, Shirt, Smartphone, Globe, Share2 } from 'lucide-react';
import { AdminPageLayout } from '@/components/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import DogSilhouette from '@/components/DogSilhouette';
import { DJDog, NinjaDog, SpaceDog, GrumpyDog, HappyDog, TechnoDog, DancingDog, AcidDog } from '@/components/DogPack';

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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <div className="border border-border p-6 space-y-4">
      <div className="flex items-center justify-center h-24 border border-muted" style={{ 
        backgroundImage: 'repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%)',
        backgroundSize: '16px 16px'
      }}>
        <DogSilhouette className="w-16 h-16" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-center">TRANSPARENT</p>
      <p className="text-xs text-muted-foreground text-center">PNG with alpha — for overlays</p>
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
        <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-1 h-auto p-1 bg-muted">
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
          <TabsTrigger value="doggies" className="text-xs py-2 text-logo-green">
            <DogSilhouette className="w-3 h-3 mr-1" /> Doggies
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

        {/* Techno Doggies Tab */}
        <TabsContent value="doggies" className="space-y-8">
          {/* Hero Section */}
          <Card className="border-logo-green/50 bg-gradient-to-br from-logo-green/5 to-background">
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
              <p className="text-xs text-muted-foreground max-w-2xl">
                The Techno Doggies are bespoke SVG mascots representing the spirit of underground techno culture. 
                Each doggy has a unique personality and can be used across digital and physical applications.
                All doggies use the brand's Logo Green (#66ff66) and maintain transparent backgrounds.
              </p>
            </CardContent>
          </Card>

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

          {/* Apparel & Merchandise */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shirt className="w-4 h-4" /> APPAREL & MERCHANDISE
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Cap */}
              <div className="border border-border p-4">
                <div className="relative h-24 bg-muted rounded flex items-center justify-center mb-3">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-10 bg-background rounded-t-full border-2 border-border relative">
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
                <div className="relative h-24 bg-muted rounded flex items-center justify-center mb-3">
                  <div className="w-16 h-20 bg-background border-2 border-border rounded-sm relative">
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
                <div className="relative h-24 bg-muted rounded flex items-center justify-center mb-3">
                  <div className="w-14 h-16 bg-background border-2 border-border relative">
                    <div className="absolute -left-2 top-0 w-3 h-6 bg-background border-2 border-border" />
                    <div className="absolute -right-2 top-0 w-3 h-6 bg-background border-2 border-border" />
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
                <div className="relative h-24 bg-muted rounded flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-background border-2 border-border rotate-45 relative">
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
                <div className="relative h-24 bg-muted rounded flex items-center justify-center mb-3">
                  <div className="relative">
                    <div className="absolute -top-2 left-1 w-1 h-4 bg-border rounded" />
                    <div className="absolute -top-2 right-1 w-1 h-4 bg-border rounded" />
                    <div className="w-14 h-16 bg-background border-2 border-border">
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
            
            {/* Print Guidelines */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">FABRIC COLORS</h4>
                <div className="flex gap-2 mt-2">
                  <div className="w-8 h-8 bg-black border border-border" title="Black" />
                  <div className="w-8 h-8 bg-[#1a1a1a] border border-border" title="Charcoal" />
                  <div className="w-8 h-8 bg-[#2d2d2d] border border-border" title="Dark Grey" />
                  <div className="w-8 h-8 bg-white border border-border" title="White" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Dark fabrics preferred for visibility</p>
              </div>
            </div>
          </div>

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
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default BrandBookAdmin;
