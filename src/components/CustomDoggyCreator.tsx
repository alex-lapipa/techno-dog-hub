import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Download, Share2, Loader2, AlertCircle, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLogDoggyAction } from "@/hooks/useDoggyData";

interface CustomDoggyCreatorProps {
  onDoggyCreated?: (imageUrl: string, prompt: string) => void;
}

const inspirationPrompts = [
  "wearing headphones and mixing beats",
  "dancing at a sunrise rave",
  "with glowing neon fur at a festival",
  "spinning vinyl records",
  "surrounded by synthesizers",
  "meditating with cosmic energy",
  "floating in a colorful music galaxy",
  "leading a pack through the dancefloor",
  "with rainbow laser beams",
  "hugging a speaker stack",
];

const CustomDoggyCreator = ({ onDoggyCreated }: CustomDoggyCreatorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logAction = useLogDoggyAction();

  const getRandomInspiration = () => {
    const random = inspirationPrompts[Math.floor(Math.random() * inspirationPrompts.length)];
    setPrompt(random);
  };

  const generateDoggy = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your doggy first!");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-doggy', {
        body: { prompt: prompt.trim() }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return;
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("Your techno doggy is ready!");
        
        // Log the creation
        logAction.mutate({
          variantName: `Custom: ${prompt.substring(0, 30)}`,
          actionType: "create_custom",
        });

        onDoggyCreated?.(data.imageUrl, prompt);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate doggy";
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `techno-doggy-${Date.now()}.png`;
    link.click();
    
    logAction.mutate({
      variantName: `Custom: ${prompt.substring(0, 30)}`,
      actionType: "download",
    });
    
    toast.success("Downloaded your custom doggy!");
  };

  const shareImage = async () => {
    if (!generatedImage) return;
    
    const shareText = `Check out my custom Techno Doggy! 🐕 "${prompt}" - Create yours at techno.dog/doggies`;
    const shareUrl = "https://techno.dog/doggies";
    
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Techno Doggy",
          text: shareText,
          url: shareUrl,
        });
        logAction.mutate({
          variantName: `Custom: ${prompt.substring(0, 30)}`,
          actionType: "share_native",
        });
        return;
      } catch {
        // Fall through to WhatsApp
      }
    }
    
    // Fallback to WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
    
    logAction.mutate({
      variantName: `Custom: ${prompt.substring(0, 30)}`,
      actionType: "share_whatsapp",
    });
  };

  return (
    <Card className="border-logo-green/50 bg-gradient-to-br from-logo-green/5 to-transparent">
      <CardHeader className="text-center">
        <CardTitle className="font-mono text-xl flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-logo-green" />
          Create Your Own Techno Doggy
        </CardTitle>
        <CardDescription className="font-mono text-xs">
          Describe your dream doggy. Only positive, happy, musical vibes allowed! 🐕
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="A doggy wearing headphones and dancing..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={200}
              className="font-mono text-sm"
              disabled={isGenerating}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={getRandomInspiration}
              disabled={isGenerating}
              title="Get inspiration"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground text-right">
            {prompt.length}/200 characters
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateDoggy}
          disabled={isGenerating || !prompt.trim()}
          className="w-full font-mono"
          variant="brutalist"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating your doggy...
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 mr-2" />
              Create Doggy
            </>
          )}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="font-mono text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-logo-green/30 bg-background">
              <img 
                src={generatedImage} 
                alt={`Custom techno doggy: ${prompt}`}
                className="w-full h-auto"
              />
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-[10px] font-mono bg-logo-green text-background rounded-full">
                  Custom Creation
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadImage}
                className="flex-1 font-mono text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareImage}
                className="flex-1 font-mono text-xs"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="pt-2 border-t border-border/50">
          <p className="font-mono text-[10px] text-muted-foreground text-center">
            💚 Our doggies are all about community, music, and positivity.
            <br />
            No negative content allowed - keep it friendly and fun!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomDoggyCreator;
