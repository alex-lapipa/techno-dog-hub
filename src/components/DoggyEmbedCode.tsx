import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Code, ExternalLink, Palette } from 'lucide-react';
import DogSilhouette from './DogSilhouette';

const DoggyEmbedCode = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://techno.dog';
  const widgetUrl = `${baseUrl}/doggy-widget`;

  const embedCodes = {
    iframe: `<!-- Techno Dog Widget -->
<iframe 
  src="${widgetUrl}" 
  width="320" 
  height="360" 
  frameborder="0" 
  style="border-radius: 12px; overflow: hidden;"
  title="Techno Dog Widget"
></iframe>`,

    iframeResponsive: `<!-- Techno Dog Widget (Responsive) -->
<div style="position: relative; width: 100%; max-width: 320px; aspect-ratio: 320/360;">
  <iframe 
    src="${widgetUrl}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px; overflow: hidden;"
    title="Techno Dog Widget"
  ></iframe>
</div>`,

    html: `<!-- Techno Dog Static Badge -->
<a href="https://techno.dog" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #0a0a0a; border: 1px solid #39FF14; border-radius: 8px; text-decoration: none; font-family: monospace; font-size: 12px; color: #39FF14;">
  <svg viewBox="0 0 64 64" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#39FF14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22"/>
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22"/>
      <ellipse cx="32" cy="36" rx="16" ry="14"/>
      <path d="M24 32 Q26 28 28 32"/>
      <path d="M36 32 Q38 28 40 32"/>
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="#39FF14"/>
      <path d="M26 46 Q32 52 38 46"/>
    </g>
  </svg>
  <span>Powered by techno.dog</span>
</a>`,

    react: `// Techno Dog React Component
import { useState, useEffect } from 'react';

const TechnoDogWidget = () => {
  const dogs = ['Happy', 'Sleepy', 'Excited', 'Grumpy', 'Curious', 'Party', 'DJ', 'Puppy', 'Old', 'Techno'];
  const [currentDog, setCurrentDog] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDog(prev => (prev + 1) % dogs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <iframe 
      src="${widgetUrl}" 
      width="320" 
      height="360" 
      style={{ border: 'none', borderRadius: '12px' }}
      title="Techno Dog Widget"
    />
  );
};

export default TechnoDogWidget;`,

    markdown: `[![Powered by techno.dog](https://img.shields.io/badge/Powered%20by-techno.dog-39FF14?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNjQgNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMzlGRjE0IiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0xNiAyOCBRMTIgMTggMTggMTIgUTIyIDE0IDI0IDIyIi8+PHBhdGggZD0iTTQ4IDI4IFE1MiAxOCA0NiAxMiBRNDIgMTQgNDAgMjIiLz48ZWxsaXBzZSBjeD0iMzIiIGN5PSIzNiIgcng9IjE2IiByeT0iMTQiLz48L2c+PC9zdmc+)](https://techno.dog)`,
  };

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard. Spread the woof!",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast({
        title: "Could not copy",
        description: "Please select and copy manually",
        variant: "destructive",
      });
    }
  };

  const CodeBlock = ({ code, type, title, description }: { code: string; type: string; title: string; description: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-mono text-sm font-bold">{title}</h4>
          <p className="font-mono text-xs text-muted-foreground">{description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyToClipboard(code, type)}
          className="font-mono text-xs"
        >
          {copiedCode === type ? (
            <>
              <Check className="w-3 h-3 mr-1 text-logo-green" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-3 rounded-lg bg-muted/50 border overflow-x-auto">
        <code className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
          {code}
        </code>
      </pre>
    </div>
  );

  return (
    <Card className="border-logo-green/30">
      <CardHeader>
        <CardTitle className="font-mono text-base flex items-center gap-2">
          <Code className="w-4 h-4 text-logo-green" />
          Embeddable Widget
        </CardTitle>
        <CardDescription>
          Let others enjoy the doggies! Copy the code and embed on any website.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-shrink-0">
            <p className="font-mono text-xs text-muted-foreground mb-2">Live Preview</p>
            <div className="border rounded-xl overflow-hidden bg-background" style={{ width: 200, height: 220 }}>
              <iframe 
                src="/doggy-widget" 
                className="w-full h-full border-0"
                title="Widget Preview"
              />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-[10px]">
                <Palette className="w-3 h-3 mr-1" />
                Auto-themed
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                320×360px
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                Lightweight
              </Badge>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              The widget auto-rotates through all doggies and includes interactive controls.
              Users can click "Next" or "Random" to see different pack members!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/doggy-widget', '_blank')}
              className="font-mono text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open Full Widget
            </Button>
          </div>
        </div>

        {/* Embed Codes */}
        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="iframe" className="font-mono text-[10px]">iFrame</TabsTrigger>
            <TabsTrigger value="responsive" className="font-mono text-[10px]">Responsive</TabsTrigger>
            <TabsTrigger value="badge" className="font-mono text-[10px]">Badge</TabsTrigger>
            <TabsTrigger value="react" className="font-mono text-[10px]">React</TabsTrigger>
            <TabsTrigger value="markdown" className="font-mono text-[10px]">Markdown</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="mt-4">
            <CodeBlock
              code={embedCodes.iframe}
              type="iframe"
              title="Simple iFrame Embed"
              description="Fixed size, easy to add anywhere"
            />
          </TabsContent>

          <TabsContent value="responsive" className="mt-4">
            <CodeBlock
              code={embedCodes.iframeResponsive}
              type="responsive"
              title="Responsive iFrame"
              description="Scales with container, maintains aspect ratio"
            />
          </TabsContent>

          <TabsContent value="badge" className="mt-4">
            <CodeBlock
              code={embedCodes.html}
              type="badge"
              title="Static Badge Link"
              description="Lightweight badge that links to techno.dog"
            />
            <div className="mt-4 p-4 border rounded-lg bg-zinc-950">
              <p className="font-mono text-xs text-muted-foreground mb-2">Preview:</p>
              <a 
                href="https://techno.dog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-logo-green rounded-lg font-mono text-xs text-logo-green hover:bg-logo-green/10 transition-colors"
              >
                <DogSilhouette className="w-5 h-5" />
                Powered by techno.dog
              </a>
            </div>
          </TabsContent>

          <TabsContent value="react" className="mt-4">
            <CodeBlock
              code={embedCodes.react}
              type="react"
              title="React Component"
              description="Drop-in component for React projects"
            />
          </TabsContent>

          <TabsContent value="markdown" className="mt-4">
            <CodeBlock
              code={embedCodes.markdown}
              type="markdown"
              title="Markdown Badge"
              description="Perfect for GitHub READMEs"
            />
            <div className="mt-4 p-4 border rounded-lg">
              <p className="font-mono text-xs text-muted-foreground mb-2">Preview:</p>
              <img 
                src="https://img.shields.io/badge/Powered%20by-techno.dog-39FF14?style=for-the-badge" 
                alt="Powered by techno.dog"
                className="h-7"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Usage Tips */}
        <div className="p-4 rounded-lg bg-logo-green/5 border border-logo-green/20">
          <h4 className="font-mono text-sm font-bold mb-2">Integration Tips</h4>
          <ul className="space-y-1 font-mono text-xs text-muted-foreground">
            <li>• Works on any platform: Notion, WordPress, Webflow, Squarespace, etc.</li>
            <li>• Widget respects user's system theme (light/dark)</li>
            <li>• No tracking, no cookies - just pure doggie joy</li>
            <li>• Free to use, spread the woof!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoggyEmbedCode;
