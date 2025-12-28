import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SynthPlayerProps {
  title?: string;
  artist?: string;
  className?: string;
}

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

const SynthPlayer = ({ 
  title = "T:DOG Demo Pattern", 
  artist = "Techno Dog Sound Engine",
  className 
}: SynthPlayerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sequencerRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [bpm, setBpm] = useState(130);
  const [currentStep, setCurrentStep] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(Array(32).fill(0));

  // Kick drum pattern (4/4)
  const kickPattern = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
  // Hi-hat pattern (offbeat)
  const hihatPattern = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
  // Snare/clap pattern
  const snarePattern = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
  // Bass pattern
  const bassPattern = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0];

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
    return audioContextRef.current;
  }, [volume, isMuted]);

  const playKick = useCallback((time: number) => {
    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    if (!ctx || !gain) return;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    
    oscGain.gain.setValueAtTime(0.8, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.connect(oscGain);
    oscGain.connect(gain);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }, []);

  const playHihat = useCallback((time: number) => {
    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    if (!ctx || !gain) return;

    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.15, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    noise.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(gain);
    
    noise.start(time);
  }, []);

  const playSnare = useCallback((time: number) => {
    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    if (!ctx || !gain) return;

    // Noise component
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 3000;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gain);
    
    noise.start(time);

    // Tone component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
    
    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(gain);
    
    osc.start(time);
    osc.stop(time + 0.1);
  }, []);

  const playBass = useCallback((time: number) => {
    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    if (!ctx || !gain) return;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = "sawtooth" as OscillatorType;
    osc.frequency.setValueAtTime(55, time); // A1
    
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.15);
    
    oscGain.gain.setValueAtTime(0.25, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(gain);
    
    osc.start(time);
    osc.stop(time + 0.2);
  }, []);

  const startSequencer = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    let step = 0;
    const stepDuration = (60 / bpm) / 4; // 16th notes

    const scheduleStep = () => {
      const time = ctx.currentTime + 0.05;
      
      if (kickPattern[step % 16]) playKick(time);
      if (hihatPattern[step % 16]) playHihat(time);
      if (snarePattern[step % 16]) playSnare(time);
      if (bassPattern[step % 16]) playBass(time);

      // Update waveform visualization
      setWaveform(prev => {
        const newWave = [...prev];
        newWave[step % 32] = kickPattern[step % 16] ? 1 : 
                            snarePattern[step % 16] ? 0.7 : 
                            bassPattern[step % 16] ? 0.5 : 
                            hihatPattern[step % 16] ? 0.3 : 0.1;
        return newWave;
      });

      setCurrentStep(step % 16);
      step++;

      sequencerRef.current = window.setTimeout(scheduleStep, stepDuration * 1000);
    };

    scheduleStep();
  }, [bpm, initAudio, playKick, playHihat, playSnare, playBass]);

  const stopSequencer = useCallback(() => {
    if (sequencerRef.current) {
      clearTimeout(sequencerRef.current);
      sequencerRef.current = null;
    }
    setCurrentStep(0);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopSequencer();
    } else {
      startSequencer();
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    stopSequencer();
    setIsPlaying(false);
    setCurrentStep(0);
    setWaveform(Array(32).fill(0));
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      stopSequencer();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopSequencer]);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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

      {/* Step Sequencer Visualization */}
      <div className="relative h-16 mb-4 bg-background/50 rounded overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around px-1 py-2">
          {Array.from({ length: 16 }).map((_, i) => {
            const isActive = i === currentStep && isPlaying;
            const hasKick = kickPattern[i];
            const hasSnare = snarePattern[i];
            const hasHihat = hihatPattern[i];
            const hasBass = bassPattern[i];
            
            let height = 20;
            let color = "bg-muted-foreground/20";
            
            if (hasKick) { height = 100; color = "bg-logo-green"; }
            else if (hasSnare) { height = 70; color = "bg-primary"; }
            else if (hasBass) { height = 50; color = "bg-logo-green/60"; }
            else if (hasHihat) { height = 30; color = "bg-muted-foreground/50"; }
            
            return (
              <div
                key={i}
                className={cn(
                  "w-[5%] rounded-sm transition-all duration-75",
                  color,
                  isActive && "ring-1 ring-white"
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* BPM Display */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          BPM
        </span>
        <div className="flex items-center gap-2">
          <Slider
            value={[bpm]}
            min={100}
            max={160}
            step={1}
            onValueChange={(v) => setBpm(v[0])}
            disabled={isPlaying}
            className="w-24"
          />
          <span className="font-mono text-sm font-bold w-8 text-right">{bpm}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full border-logo-green/50",
              isPlaying && "bg-logo-green/20 border-logo-green"
            )}
            onClick={togglePlay}
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
            onClick={reset}
          >
            <RotateCcw className="h-4 w-4" />
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

      {/* Pattern Labels */}
      <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-4 gap-2 text-center">
        <div className="font-mono text-[9px] text-muted-foreground uppercase">
          <span className="inline-block w-2 h-2 rounded-full bg-logo-green mr-1" />
          Kick
        </div>
        <div className="font-mono text-[9px] text-muted-foreground uppercase">
          <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1" />
          Snare
        </div>
        <div className="font-mono text-[9px] text-muted-foreground uppercase">
          <span className="inline-block w-2 h-2 rounded-full bg-logo-green/60 mr-1" />
          Bass
        </div>
        <div className="font-mono text-[9px] text-muted-foreground uppercase">
          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/50 mr-1" />
          Hi-hat
        </div>
      </div>
    </div>
  );
};

export default SynthPlayer;
