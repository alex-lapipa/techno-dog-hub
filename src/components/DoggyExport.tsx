import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Download, Share2, Copy, MessageCircle, Twitter, Send, Image, Package, Sparkles } from 'lucide-react';
import { dogVariants } from './DogPack';
import DogSilhouette from './DogSilhouette';

// Resolve CSS variables in SVG for proper export with transparent backgrounds
const resolveCssVariables = (svgElement: SVGSVGElement): SVGSVGElement => {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  const computedStyle = getComputedStyle(document.documentElement);
  
  // Get the actual color value for --logo-green
  const logoGreen = computedStyle.getPropertyValue('--logo-green').trim();
  const resolvedColor = logoGreen ? `hsl(${logoGreen})` : '#22c55e';
  
  // Replace all instances of hsl(var(--logo-green)) with the actual color
  const serialized = new XMLSerializer().serializeToString(clone);
  const resolved = serialized
    .replace(/hsl\(var\(--logo-green\)\)/g, resolvedColor)
    .replace(/hsl\(var\(--foreground\)\)/g, computedStyle.getPropertyValue('--foreground').trim() ? `hsl(${computedStyle.getPropertyValue('--foreground').trim()})` : '#ffffff')
    .replace(/hsl\(var\(--background\)\)/g, computedStyle.getPropertyValue('--background').trim() ? `hsl(${computedStyle.getPropertyValue('--background').trim()})` : '#000000');
  
  // Parse back to SVG element
  const parser = new DOMParser();
  const doc = parser.parseFromString(resolved, 'image/svg+xml');
  return doc.documentElement as unknown as SVGSVGElement;
};

// Convert SVG element to data URL
const svgToDataUrl = (svgElement: SVGSVGElement): string => {
  const resolvedSvg = resolveCssVariables(svgElement);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(resolvedSvg);
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml,${encoded}`;
};

// Convert SVG to PNG blob with transparent background
const svgToPngBlob = async (svgElement: SVGSVGElement, size: number = 512): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      // Clear canvas for transparent background
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not create blob'));
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = svgToDataUrl(svgElement);
  });
};

// Download helper
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Download SVG with resolved CSS variables and transparent background
const downloadSVG = (svgElement: SVGSVGElement, filename: string) => {
  const resolvedSvg = resolveCssVariables(svgElement);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(resolvedSvg);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  downloadBlob(blob, filename);
};

interface DoggyExportProps {
  selectedDog?: number | null;
  generatedDogs?: typeof dogVariants;
}

const DoggyExport = ({ selectedDog, generatedDogs = [] }: DoggyExportProps) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);

  const allDogs = [...dogVariants, ...generatedDogs];

  // Dog text representations for sharing
  const dogTexts = [
    { name: 'Happy', text: '*wags tail excitedly*' },
    { name: 'Sleepy', text: '*snoozes peacefully*' },
    { name: 'Excited', text: '*BARK BARK BARK*' },
    { name: 'Grumpy', text: '*judges silently*' },
    { name: 'Curious', text: '*tilts head*' },
    { name: 'Party', text: '*celebrates*' },
    { name: 'DJ', text: '*drops the beat*' },
    { name: 'Puppy', text: '*smol excitement*' },
    { name: 'Old', text: '*wise barking*' },
    { name: 'Techno', text: '*glitches happily*' },
  ];

  const handleExportPNG = async (dogName: string, DogComponent: React.FC<{ className?: string }>) => {
    setExporting(dogName);
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      // Render the component
      const tempRoot = document.createElement('div');
      container.appendChild(tempRoot);
      
      // Create SVG directly
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 64 64');
      svg.setAttribute('width', '512');
      svg.setAttribute('height', '512');
      
      // Get the component's SVG content by rendering it
      const componentContainer = document.getElementById(`dog-export-${dogName}`);
      if (componentContainer) {
        const originalSvg = componentContainer.querySelector('svg');
        if (originalSvg) {
          const blob = await svgToPngBlob(originalSvg, 512);
          downloadBlob(blob, `technodog-${dogName.toLowerCase()}.png`);
          toast({
            title: "Downloaded!",
            description: `${dogName} Dog is ready to spread joy!`,
          });
        }
      }
      
      document.body.removeChild(container);
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Could not export the doggie. Try again!",
        variant: "destructive",
      });
    }
    setExporting(null);
  };

  const handleExportSVG = (dogName: string) => {
    const componentContainer = document.getElementById(`dog-export-${dogName}`);
    if (componentContainer) {
      const originalSvg = componentContainer.querySelector('svg');
      if (originalSvg) {
        downloadSVG(originalSvg, `technodog-${dogName.toLowerCase()}.svg`);
        toast({
          title: "Downloaded!",
          description: `${dogName} Dog SVG is ready!`,
        });
      }
    }
  };

  const handleExportAllPNG = async () => {
    setExporting('all');
    toast({
      title: "Exporting Pack...",
      description: "Preparing all doggies for download!",
    });

    for (const dog of dogVariants) {
      const componentContainer = document.getElementById(`dog-export-${dog.name}`);
      if (componentContainer) {
        const originalSvg = componentContainer.querySelector('svg');
        if (originalSvg) {
          try {
            const blob = await svgToPngBlob(originalSvg, 512);
            downloadBlob(blob, `technodog-${dog.name.toLowerCase()}.png`);
            await new Promise(resolve => setTimeout(resolve, 300)); // Small delay between downloads
          } catch (e) {
            console.error(`Failed to export ${dog.name}`, e);
          }
        }
      }
    }

    toast({
      title: "Pack Exported!",
      description: "All doggies have been downloaded!",
    });
    setExporting(null);
  };

  const handleShare = (platform: string, dogName: string) => {
    const dogText = dogTexts.find(e => e.name === dogName);
    const shareText = `Check out this ${dogName} Dog from techno.dog! ${dogText?.text || ''}\n\nJoin the pack at techno.dog`;
    const shareUrl = 'https://techno.dog';

    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer');
      toast({
        title: "Sharing!",
        description: `${dogName} Dog is on their way to spread joy!`,
      });
    }
  };

  const copyToClipboard = async (dogName: string) => {
    const dogText = dogTexts.find(e => e.name === dogName);
    const copyText = `${dogText?.text || ''} — from techno.dog`;
    
    try {
      await navigator.clipboard.writeText(copyText);
      setCopiedEmoji(dogName);
      toast({
        title: "Copied!",
        description: "Doggie text copied to clipboard!",
      });
      setTimeout(() => setCopiedEmoji(null), 2000);
    } catch (err) {
      toast({
        title: "Could not copy",
        description: "Try again or copy manually",
        variant: "destructive",
      });
    }
  };

  const handleSendDoggie = (dogName: string) => {
    const dogText = dogTexts.find(e => e.name === dogName);
    toast({
      title: `Sending ${dogName} Dog!`,
      description: dogText?.text || "On their way!",
    });
  };

  return (
    <Card className="border-logo-green/30">
      <CardHeader>
        <CardTitle className="font-mono text-base flex items-center gap-2">
          <Share2 className="w-4 h-4 text-logo-green" />
          Doggie Sharing Station
        </CardTitle>
        <CardDescription>Export, share, and spread the doggie love across the internet!</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stickers" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="stickers" className="font-mono text-xs">
              <Image className="w-3 h-3 mr-1" />
              Stickers
            </TabsTrigger>
            <TabsTrigger value="share" className="font-mono text-xs">
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </TabsTrigger>
            <TabsTrigger value="pack" className="font-mono text-xs">
              <Package className="w-3 h-3 mr-1" />
              Full Pack
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stickers" className="space-y-4">
            <p className="font-mono text-xs text-muted-foreground">
              Download individual doggies as stickers for WhatsApp, Telegram, Discord, and more!
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {dogVariants.map((dog) => {
                const DogComponent = dog.Component;
                return (
                  <div 
                    key={dog.name}
                    className="p-3 rounded-lg border hover:border-logo-green transition-all group"
                  >
                    <div id={`dog-export-${dog.name}`} className="flex justify-center mb-2">
                      <DogComponent className="w-16 h-16" />
                    </div>
                    <p className="font-mono text-[10px] text-center mb-2">{dog.name}</p>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 h-7 text-[10px] p-0"
                        onClick={() => handleExportPNG(dog.name, DogComponent)}
                        disabled={exporting === dog.name}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 h-7 text-[10px] p-0"
                        onClick={() => handleExportSVG(dog.name)}
                      >
                        SVG
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            <p className="font-mono text-xs text-muted-foreground">
              Share doggies on social media and spread the good vibes!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dogVariants.map((dog) => {
                const DogComponent = dog.Component;
                const dogText = dogTexts.find(e => e.name === dog.name);
                return (
                  <div 
                    key={dog.name}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-logo-green transition-all"
                  >
                    <DogComponent className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-bold">{dog.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">
                        {dogText?.text}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleShare('whatsapp', dog.name)}
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleShare('twitter', dog.name)}
                        title="Share on Twitter"
                      >
                        <Twitter className="w-4 h-4 text-blue-400" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleShare('telegram', dog.name)}
                        title="Share on Telegram"
                      >
                        <Send className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(dog.name)}
                        title="Copy to clipboard"
                      >
                        <Copy className={`w-4 h-4 ${copiedEmoji === dog.name ? 'text-logo-green' : ''}`} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="pack" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-2 flex-wrap">
                {dogVariants.slice(0, 5).map((dog) => {
                  const DogComponent = dog.Component;
                  return <DogComponent key={dog.name} className="w-10 h-10" />;
                })}
              </div>
              <div className="flex justify-center gap-2 flex-wrap">
                {dogVariants.slice(5).map((dog) => {
                  const DogComponent = dog.Component;
                  return <DogComponent key={dog.name} className="w-10 h-10" />;
                })}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-mono text-lg font-bold">The Complete Pack</h3>
                <p className="font-mono text-xs text-muted-foreground">
                  Download all {dogVariants.length} doggies in one go!
                </p>
                <Badge variant="outline" className="font-mono">
                  Perfect for sticker packs
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="brutalist" 
                  onClick={handleExportAllPNG}
                  disabled={exporting === 'all'}
                  className="font-mono"
                >
                  {exporting === 'all' ? (
                    <>Downloading...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download All PNGs
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "WhatsApp Sticker Pack",
                      description: "Download PNGs and import them into WhatsApp using a sticker maker app!",
                    });
                  }}
                  className="font-mono"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Tips
                </Button>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-logo-green/5 border border-logo-green/20">
                <h4 className="font-mono text-sm font-bold mb-2 flex items-center gap-2 justify-center">
                  <Sparkles className="w-4 h-4 text-logo-green" />
                  Pro Tip
                </h4>
                <p className="font-mono text-xs text-muted-foreground">
                  Import the PNGs into apps like "Sticker Maker" for WhatsApp or "Telegram Stickers" 
                  to create your own techno.dog sticker pack. Share with your friends and spread the woof!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-mono text-xs text-muted-foreground uppercase mb-3">Quick Doggie Actions</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="font-mono text-xs"
              onClick={() => handleSendDoggie('Happy')}
            >
              Send Happy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="font-mono text-xs"
              onClick={() => handleSendDoggie('Excited')}
            >
              Send Excited
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="font-mono text-xs"
              onClick={() => handleSendDoggie('Sleepy')}
            >
              Send Sleepy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="font-mono text-xs"
              onClick={() => handleSendDoggie('Party')}
            >
              Send Party
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoggyExport;
