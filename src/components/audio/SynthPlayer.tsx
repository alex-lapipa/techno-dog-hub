import { useState, useRef, useEffect, useCallback } from "react";
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
  color: string;
}

const PATTERNS: Record<PatternType, PatternInfo> = {
  warehouse: {
    name: "Warehouse",
    bpm: 130,
    description: "Classic four-on-the-floor with driving bass",
    fileName: "warehouse-demo.mp3",
    color: "#22c55e", // logo-green
  },
  minimal: {
    name: "Minimal",
    bpm: 122,
    description: "Sparse, hypnotic groove",
    fileName: "minimal-demo.mp3",
    color: "#3b82f6", // blue
  },
  industrial: {
    name: "Industrial",
    bpm: 140,
    description: "Hard-hitting metallic textures",
    fileName: "industrial-demo.mp3",
    color: "#ef4444", // red
  },
  acid: {
    name: "Acid",
    bpm: 135,
    description: "303-style squelchy basslines",
    fileName: "acid-demo.mp3",
    color: "#eab308", // yellow
  },
};

const SynthPlayer = ({ 
  title = "T:DOG Demo Pattern", 
  artist = "Techno Dog Sound Engine",
  className 
}: SynthPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
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

  // Draw waveform visualization
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw frequency bars
      const barCount = 64;
      const barWidth = width / barCount;
      const gap = 2;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount);
        const value = dataArray[dataIndex];
        const barHeight = (value / 255) * height * 0.9;
        
        const x = i * barWidth;
        const y = height - barHeight;
        
        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, height, x, y);
        gradient.addColorStop(0, pattern.color);
        gradient.addColorStop(0.5, pattern.color + 'cc');
        gradient.addColorStop(1, pattern.color + '66');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight);
        
        // Add glow effect for peaks
        if (value > 200) {
          ctx.shadowColor = pattern.color;
          ctx.shadowBlur = 10;
          ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight);
          ctx.shadowBlur = 0;
        }
      }
      
      // Draw center line
      ctx.strokeStyle = pattern.color + '33';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };
    
    draw();
  }, [pattern.color]);

  // Draw idle waveform (when not playing)
  const drawIdleWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw static bars
    const barCount = 64;
    const barWidth = width / barCount;
    const gap = 2;
    
    for (let i = 0; i < barCount; i++) {
      const barHeight = 4 + Math.sin(i * 0.3) * 3;
      const x = i * barWidth;
      const y = height - barHeight - 2;
      
      ctx.fillStyle = pattern.color + '44';
      ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight);
    }
    
    // Draw center line
    ctx.strokeStyle = pattern.color + '22';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, [pattern.color]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Setup audio context and analyser
  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  // Load audio when pattern changes
  useEffect(() => {
    const audioUrl = getAudioUrl(pattern.fileName);
    
    // Stop current playback and animation
    stopAnimation();
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Reset audio context when pattern changes
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
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

    // Draw idle waveform
    drawIdleWaveform();

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [patternType, stopAnimation, drawIdleWaveform]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle play state changes
  useEffect(() => {
    if (isPlaying) {
      drawWaveform();
    } else {
      stopAnimation();
      drawIdleWaveform();
    }
  }, [isPlaying, drawWaveform, stopAnimation, drawIdleWaveform]);

  // Redraw idle when pattern changes
  useEffect(() => {
    if (!isPlaying) {
      drawIdleWaveform();
    }
  }, [pattern.color, isPlaying, drawIdleWaveform]);

  const togglePlay = async () => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        // Setup audio context on first play
        setupAudioContext();
        
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
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
      stopAnimation();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAnimation]);

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

      {/* Waveform Visualizer */}
      <div className="mb-4 relative rounded overflow-hidden bg-background/80">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-20"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/50 to-transparent" />
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
