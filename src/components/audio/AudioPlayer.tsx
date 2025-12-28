import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src?: string;
  title?: string;
  artist?: string;
  className?: string;
}

const AudioPlayer = ({ 
  src, 
  title = "Untitled Track", 
  artist = "Unknown Artist",
  className 
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current || !src) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      "border border-border bg-card/50 rounded-lg p-4 backdrop-blur-sm",
      className
    )}>
      {src && <audio ref={audioRef} src={src} preload="metadata" />}
      
      {/* Track Info */}
      <div className="mb-4">
        <h3 className="font-mono text-sm font-medium truncate">{title}</h3>
        <p className="font-mono text-xs text-muted-foreground truncate">{artist}</p>
      </div>

      {/* Waveform Visualization (Placeholder) */}
      <div className="relative h-12 mb-4 bg-background/50 rounded overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
          {Array.from({ length: 50 }).map((_, i) => {
            const height = Math.random() * 60 + 20;
            const isActive = (i / 50) * 100 <= progress;
            return (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-colors duration-150",
                  isActive ? "bg-logo-green" : "bg-muted-foreground/30"
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        
        {/* Progress overlay */}
        <div 
          className="absolute inset-y-0 left-0 bg-logo-green/10 pointer-events-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Slider */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          disabled={!isLoaded && !src}
          className="cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => skip(-10)}
            disabled={!src}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full border-logo-green/50",
              isPlaying && "bg-logo-green/20 border-logo-green"
            )}
            onClick={togglePlay}
            disabled={!src}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => skip(10)}
            disabled={!src}
          >
            <SkipForward className="h-4 w-4" />
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

      {/* No source message */}
      {!src && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="font-mono text-xs text-muted-foreground/60 text-center">
            No audio source loaded
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
