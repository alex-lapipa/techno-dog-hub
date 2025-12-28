import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SynthPlayerProps {
  title?: string;
  artist?: string;
  className?: string;
}

type PatternType = "warehouse" | "minimal" | "industrial" | "acid";

interface PatternInfo {
  name: string;
  bpm: number;
  description: string;
  fileName: string;
}

const PATTERNS: Record<PatternType, PatternInfo> = {
  warehouse: {
    name: "Warehouse",
    bpm: 130,
    description: "Classic four-on-the-floor with driving bass",
    fileName: "warehouse-demo.mp3",
  },
  minimal: {
    name: "Minimal",
    bpm: 122,
    description: "Sparse, hypnotic groove",
    fileName: "minimal-demo.mp3",
  },
  industrial: {
    name: "Industrial",
    bpm: 140,
    description: "Hard-hitting metallic textures",
    fileName: "industrial-demo.mp3",
  },
  acid: {
    name: "Acid",
    bpm: 135,
    description: "303-style squelchy basslines",
    fileName: "acid-demo.mp3",
  },
};

const SynthPlayer = ({ 
  title = "T:DOG Demo Pattern", 
  artist = "Techno Dog Sound Engine",
  className 
}: SynthPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [patternType, setPatternType] = useState<PatternType>("warehouse");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const pattern = PATTERNS[patternType];

  // Get audio URL from storage
  const getAudioUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('tdog-demos')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Load audio when pattern changes
  useEffect(() => {
    const audioUrl = getAudioUrl(pattern.fileName);
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    setIsLoading(true);
    setHasError(false);

    audio.addEventListener('canplaythrough', () => {
      setIsLoading(false);
      setDuration(audio.duration);
    });

    audio.addEventListener('error', () => {
      setIsLoading(false);
      setHasError(true);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [patternType]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Playback failed:', error);
        setHasError(true);
      }
    }
  };

  const changePattern = (newPattern: PatternType) => {
    setPatternType(newPattern);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <div className={cn(
      "border border-border bg-card/50 rounded-lg p-4 backdrop-blur-sm",
      className
    )}>
      {/* Track Info */}
      <div className="mb-4">
        <h3 className="font-mono text-sm font-medium truncate">{title}</h3>
        <p className="font-mono text-xs text-muted-foreground truncate">{artist}</p>
      </div>

      {/* Pattern Selector */}
      <div className="mb-4">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
          Select Demo
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PATTERNS) as PatternType[]).map((key) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className={cn(
                "font-mono text-[10px] uppercase tracking-wider h-7 px-3",
                patternType === key && "bg-logo-green/20 border-logo-green text-logo-green"
              )}
              onClick={() => changePattern(key)}
            >
              {PATTERNS[key].name}
            </Button>
          ))}
        </div>
      </div>

      {/* Pattern Info */}
      <div className="mb-4 p-3 bg-background/50 rounded border border-border/50">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-xs font-medium">{pattern.name}</span>
          <span className="font-mono text-[10px] text-logo-green">{pattern.bpm} BPM</span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">
          {pattern.description}
        </p>
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="mb-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-logo-green transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Status */}
      {isLoading && (
        <div className="mb-4 text-center">
          <span className="font-mono text-[10px] text-muted-foreground animate-pulse">
            Loading demo...
          </span>
        </div>
      )}

      {hasError && (
        <div className="mb-4 text-center">
          <span className="font-mono text-[10px] text-destructive">
            Demo not available yet
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full border-logo-green/50",
              isPlaying && "bg-logo-green/20 border-logo-green",
              (isLoading || hasError) && "opacity-50 cursor-not-allowed"
            )}
            onClick={togglePlay}
            disabled={isLoading || hasError}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20 cursor-pointer"
          />
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-border/50 text-center">
        <p className="font-mono text-[9px] text-muted-foreground">
          Pre-recorded demos created with T:DOG Sound Engine
        </p>
      </div>
    </div>
  );
};

export default SynthPlayer;
