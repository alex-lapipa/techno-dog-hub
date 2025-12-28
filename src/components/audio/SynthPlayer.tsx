import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, BarChart3, Activity, Layers, Sparkles, FlipVertical2, RefreshCw, Check, X, Cloud } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface SynthPlayerProps {
  title?: string;
  artist?: string;
  className?: string;
}

type PatternType = "warehouse" | "minimal" | "industrial" | "acid";
type VisualizerMode = "bars" | "scope" | "both";

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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

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
  const particlesRef = useRef<Particle[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [patternType, setPatternType] = useState<PatternType>("warehouse");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>("both");
  const [showParticles, setShowParticles] = useState(true);
  const [showMirror, setShowMirror] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [availableDemos, setAvailableDemos] = useState<Record<PatternType, boolean>>({
    warehouse: false,
    minimal: false,
    industrial: false,
    acid: false,
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const pattern = PATTERNS[patternType];

  // Check which demos are available in cloud storage
  const syncFromCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.storage
        .from('tdog-demos')
        .list('', { limit: 100 });

      if (error) {
        console.error('Failed to list demos:', error);
        toast.error('Failed to sync from cloud');
        return;
      }

      const fileNames = data?.map(f => f.name) || [];
      const availability: Record<PatternType, boolean> = {
        warehouse: fileNames.includes('warehouse-demo.mp3'),
        minimal: fileNames.includes('minimal-demo.mp3'),
        industrial: fileNames.includes('industrial-demo.mp3'),
        acid: fileNames.includes('acid-demo.mp3'),
      };

      setAvailableDemos(availability);
      setLastSyncTime(new Date());

      const availableCount = Object.values(availability).filter(Boolean).length;
      toast.success(`Found ${availableCount} demo${availableCount !== 1 ? 's' : ''} in cloud`);
    } catch (err) {
      console.error('Sync error:', err);
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Auto-sync on mount
  useEffect(() => {
    syncFromCloud();
  }, [syncFromCloud]);

  // Get audio URL from storage
  const getAudioUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('tdog-demos')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Spawn particles based on audio intensity
  const spawnParticles = useCallback((intensity: number, width: number, height: number) => {
    if (!showParticles) return;
    
    const spawnCount = Math.floor(intensity / 50);
    for (let i = 0; i < spawnCount; i++) {
      if (particlesRef.current.length < 100) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: height,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 1,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          size: 2 + Math.random() * 3,
          color: pattern.color,
        });
      }
    }
  }, [pattern.color, showParticles]);

  // Update and draw particles
  const updateParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showParticles) return;
    
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // gravity
      p.life++;
      
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (alpha <= 0) return false;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
      
      // Glow effect
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10 * alpha;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      return true;
    });
  }, [showParticles]);

  // Draw frequency bars with mirror effect
  const drawBars = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, yOffset: number, barHeight: number, isMirror = false) => {
    const barCount = 64;
    const barWidth = width / barCount;
    const gap = 2;
    
    // Calculate average intensity for particles
    let totalIntensity = 0;
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor(i * dataArray.length / barCount);
      const value = dataArray[dataIndex];
      totalIntensity += value;
      const h = (value / 255) * barHeight * (isMirror ? 0.4 : 0.9);
      
      const x = i * barWidth;
      const y = isMirror ? yOffset : yOffset + barHeight - h;
      
      // Create gradient for each bar
      const gradient = isMirror 
        ? ctx.createLinearGradient(x, yOffset, x, yOffset + h)
        : ctx.createLinearGradient(x, yOffset + barHeight, x, y);
      
      if (isMirror) {
        gradient.addColorStop(0, pattern.color + '44');
        gradient.addColorStop(1, pattern.color + '00');
      } else {
        gradient.addColorStop(0, pattern.color);
        gradient.addColorStop(0.5, pattern.color + 'cc');
        gradient.addColorStop(1, pattern.color + '66');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x + gap / 2, y, barWidth - gap, h);
      
      // Add glow effect for peaks (not on mirror)
      if (!isMirror && value > 200) {
        ctx.shadowColor = pattern.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(x + gap / 2, y, barWidth - gap, h);
        ctx.shadowBlur = 0;
      }
    }
    
    // Spawn particles based on intensity
    if (!isMirror) {
      spawnParticles(totalIntensity / barCount, width, yOffset + barHeight);
    }
  }, [pattern.color, spawnParticles]);

  // Draw oscilloscope waveform with mirror effect
  const drawOscilloscope = useCallback((ctx: CanvasRenderingContext2D, timeDataArray: Uint8Array, width: number, height: number, yOffset: number, scopeHeight: number, isMirror = false) => {
    const sliceWidth = width / timeDataArray.length;
    
    // Draw glow effect
    ctx.shadowColor = pattern.color;
    ctx.shadowBlur = isMirror ? 5 : 15;
    
    ctx.lineWidth = isMirror ? 1 : 2;
    ctx.strokeStyle = isMirror ? pattern.color + '33' : pattern.color;
    ctx.beginPath();
    
    let x = 0;
    for (let i = 0; i < timeDataArray.length; i++) {
      const v = timeDataArray[i] / 128.0;
      const centerY = yOffset + scopeHeight / 2;
      const amplitude = isMirror ? 0.3 : 1;
      const y = isMirror 
        ? centerY + (1 - v) * scopeHeight / 2 * amplitude
        : centerY + (v - 1) * scopeHeight / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    if (!isMirror) {
      // Draw thinner bright line on top
      ctx.lineWidth = 1;
      ctx.strokeStyle = pattern.color + 'ff';
      ctx.beginPath();
      
      x = 0;
      for (let i = 0; i < timeDataArray.length; i++) {
        const v = timeDataArray[i] / 128.0;
        const y = yOffset + (v * scopeHeight / 2);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
      
      // Draw center line
      ctx.strokeStyle = pattern.color + '33';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, yOffset + scopeHeight / 2);
      ctx.lineTo(width, yOffset + scopeHeight / 2);
      ctx.stroke();
    }
  }, [pattern.color]);

  // Draw waveform visualization
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(analyser.fftSize);
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(timeData);
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas with fade effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);
      
      // Update particles first (behind everything)
      updateParticles(ctx);
      
      if (visualizerMode === "bars") {
        const mainHeight = showMirror ? height * 0.7 : height;
        const mirrorHeight = height * 0.3;
        
        drawBars(ctx, frequencyData, width, mainHeight, 0, mainHeight);
        if (showMirror) {
          drawBars(ctx, frequencyData, width, mirrorHeight, mainHeight, mirrorHeight, true);
        }
      } else if (visualizerMode === "scope") {
        const mainHeight = showMirror ? height * 0.7 : height;
        const mirrorHeight = height * 0.3;
        
        drawOscilloscope(ctx, timeData, width, mainHeight, 0, mainHeight);
        if (showMirror) {
          drawOscilloscope(ctx, timeData, width, mirrorHeight, mainHeight, mirrorHeight, true);
        }
      } else {
        // Both mode - split canvas
        const mainHeight = showMirror ? height * 0.4 : height * 0.5;
        const mirrorHeight = height * 0.1;
        
        // Oscilloscope on top
        drawOscilloscope(ctx, timeData, width, mainHeight, 0, mainHeight);
        if (showMirror) {
          drawOscilloscope(ctx, timeData, width, mirrorHeight, mainHeight, mirrorHeight, true);
        }
        
        // Bars on bottom
        const barsOffset = showMirror ? mainHeight + mirrorHeight : mainHeight;
        const barsHeight = showMirror ? mainHeight : height * 0.5;
        const barsMirrorHeight = mirrorHeight;
        
        drawBars(ctx, frequencyData, width, barsHeight, barsOffset, barsHeight);
        if (showMirror) {
          drawBars(ctx, frequencyData, width, barsMirrorHeight, barsOffset + barsHeight, barsMirrorHeight, true);
        }
        
        // Divider line
        ctx.strokeStyle = pattern.color + '44';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, barsOffset);
        ctx.lineTo(width, barsOffset);
        ctx.stroke();
      }
    };
    
    draw();
  }, [pattern.color, visualizerMode, drawBars, drawOscilloscope, updateParticles, showMirror]);

  // Draw idle waveform (when not playing)
  const drawIdleWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    if (visualizerMode === "bars" || visualizerMode === "both") {
      // Draw static bars
      const barCount = 64;
      const barWidth = width / barCount;
      const gap = 2;
      const barAreaHeight = visualizerMode === "both" ? height / 2 : height;
      const yOffset = visualizerMode === "both" ? height / 2 : 0;
      
      for (let i = 0; i < barCount; i++) {
        const barHeight = 4 + Math.sin(i * 0.3) * 3;
        const x = i * barWidth;
        const y = yOffset + barAreaHeight - barHeight - 2;
        
        ctx.fillStyle = pattern.color + '44';
        ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight);
      }
    }
    
    if (visualizerMode === "scope" || visualizerMode === "both") {
      // Draw static oscilloscope line
      const scopeHeight = visualizerMode === "both" ? height / 2 : height;
      const yCenter = visualizerMode === "both" ? scopeHeight / 2 : height / 2;
      
      ctx.strokeStyle = pattern.color + '44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let x = 0; x < width; x++) {
        const y = yCenter + Math.sin(x * 0.05) * 3;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    
    if (visualizerMode === "both") {
      // Divider line
      ctx.strokeStyle = pattern.color + '22';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }
  }, [pattern.color, visualizerMode]);

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

  // Redraw idle when pattern or mode changes
  useEffect(() => {
    if (!isPlaying) {
      drawIdleWaveform();
    }
  }, [pattern.color, isPlaying, drawIdleWaveform, visualizerMode]);

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
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Select Demo
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 font-mono text-[10px] gap-1"
            onClick={syncFromCloud}
            disabled={isSyncing}
          >
            <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
            <Cloud className="h-3 w-3" />
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PATTERNS) as PatternType[]).map((key) => {
            const isAvailable = availableDemos[key];
            return (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wider h-7 px-3 gap-1.5",
                  patternType === key && "bg-logo-green/20 border-logo-green text-logo-green",
                  !isAvailable && "opacity-50"
                )}
                onClick={() => changePattern(key)}
                title={isAvailable ? `Play ${PATTERNS[key].name} demo` : `${PATTERNS[key].name} demo not uploaded yet`}
              >
                {isAvailable ? (
                  <Check className="h-2.5 w-2.5 text-logo-green" />
                ) : (
                  <X className="h-2.5 w-2.5 text-muted-foreground" />
                )}
                {PATTERNS[key].name}
              </Button>
            );
          })}
        </div>
        {lastSyncTime && (
          <p className="font-mono text-[9px] text-muted-foreground mt-2">
            Last synced: {lastSyncTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Waveform Visualizer */}
      <div className="mb-4">
        {/* Visualizer Controls */}
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Visualizer
          </p>
          <div className="flex gap-1">
            {/* Mode toggles */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0",
                visualizerMode === "bars" && "bg-logo-green/20 text-logo-green"
              )}
              onClick={() => setVisualizerMode("bars")}
              title="Frequency Bars"
            >
              <BarChart3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0",
                visualizerMode === "scope" && "bg-logo-green/20 text-logo-green"
              )}
              onClick={() => setVisualizerMode("scope")}
              title="Oscilloscope"
            >
              <Activity className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0",
                visualizerMode === "both" && "bg-logo-green/20 text-logo-green"
              )}
              onClick={() => setVisualizerMode("both")}
              title="Both"
            >
              <Layers className="h-3 w-3" />
            </Button>
            
            {/* Separator */}
            <div className="w-px h-4 bg-border mx-1 self-center" />
            
            {/* Effects toggles */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0",
                showParticles && "bg-logo-green/20 text-logo-green"
              )}
              onClick={() => setShowParticles(!showParticles)}
              title="Particles"
            >
              <Sparkles className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0",
                showMirror && "bg-logo-green/20 text-logo-green"
              )}
              onClick={() => setShowMirror(!showMirror)}
              title="Mirror Reflection"
            >
              <FlipVertical2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="relative rounded overflow-hidden bg-background/80">
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="w-full h-28"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/30 to-transparent" />
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
