import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, Waves } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SynthPlayerProps {
  title?: string;
  artist?: string;
  className?: string;
}

type PatternType = "warehouse" | "minimal" | "industrial" | "acid";

interface DrumPattern {
  name: string;
  kick: number[];
  hihat: number[];
  snare: number[];
  bass: number[];
  bassNotes?: number[];
  bpm: number;
}

const PATTERNS: Record<PatternType, DrumPattern> = {
  warehouse: {
    name: "Warehouse",
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    bass: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
    bpm: 130,
  },
  minimal: {
    name: "Minimal",
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    hihat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    bass: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    bpm: 122,
  },
  industrial: {
    name: "Industrial",
    kick: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
    bass: [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1],
    bpm: 140,
  },
  acid: {
    name: "Acid",
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    hihat: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    bass: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
    bassNotes: [55, 0, 82, 0, 0, 55, 0, 73, 55, 0, 82, 0, 0, 98, 82, 0],
    bpm: 135,
  },
};

const SynthPlayer = ({ 
  title = "T:DOG Demo Pattern", 
  artist = "Techno Dog Sound Engine",
  className 
}: SynthPlayerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const masterFilterRef = useRef<BiquadFilterNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const feedbackGainRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const sequencerRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [patternType, setPatternType] = useState<PatternType>("warehouse");
  const [bpm, setBpm] = useState(PATTERNS.warehouse.bpm);
  const [currentStep, setCurrentStep] = useState(0);
  const [reverbMix, setReverbMix] = useState(0.2);
  const [delayMix, setDelayMix] = useState(0.15);
  const [delayTime, setDelayTime] = useState(0.375); // 3/16 note at 120bpm
  const [delayFeedback, setDelayFeedback] = useState(0.4);
  const [filterCutoff, setFilterCutoff] = useState(8000);
  const [filterResonance, setFilterResonance] = useState(1);
  const [showEffects, setShowEffects] = useState(false);

  const pattern = PATTERNS[patternType];

  // Create impulse response for reverb
  const createImpulseResponse = useCallback((ctx: AudioContext, duration: number, decay: number) => {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }, []);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      
      // Master output
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = isMuted ? 0 : volume;
      masterGainRef.current.connect(ctx.destination);
      
      // Master filter (before output)
      masterFilterRef.current = ctx.createBiquadFilter();
      masterFilterRef.current.type = "lowpass";
      masterFilterRef.current.frequency.value = filterCutoff;
      masterFilterRef.current.Q.value = filterResonance;
      masterFilterRef.current.connect(masterGainRef.current);
      
      // Dry signal path
      dryGainRef.current = ctx.createGain();
      dryGainRef.current.gain.value = 1 - reverbMix - delayMix;
      dryGainRef.current.connect(masterFilterRef.current);
      
      // Reverb path
      convolverRef.current = ctx.createConvolver();
      convolverRef.current.buffer = createImpulseResponse(ctx, 2.5, 3);
      reverbGainRef.current = ctx.createGain();
      reverbGainRef.current.gain.value = reverbMix;
      convolverRef.current.connect(reverbGainRef.current);
      reverbGainRef.current.connect(masterFilterRef.current);
      
      // Delay path
      delayNodeRef.current = ctx.createDelay(2);
      delayNodeRef.current.delayTime.value = delayTime;
      feedbackGainRef.current = ctx.createGain();
      feedbackGainRef.current.gain.value = delayFeedback;
      delayGainRef.current = ctx.createGain();
      delayGainRef.current.gain.value = delayMix;
      
      // Delay feedback loop
      delayNodeRef.current.connect(feedbackGainRef.current);
      feedbackGainRef.current.connect(delayNodeRef.current);
      delayNodeRef.current.connect(delayGainRef.current);
      delayGainRef.current.connect(masterFilterRef.current);
    }
    return audioContextRef.current;
  }, [volume, isMuted, reverbMix, delayMix, delayTime, delayFeedback, filterCutoff, filterResonance, createImpulseResponse]);

  // Update effect parameters in real-time
  useEffect(() => {
    if (dryGainRef.current) {
      dryGainRef.current.gain.value = Math.max(0, 1 - reverbMix - delayMix);
    }
    if (reverbGainRef.current) {
      reverbGainRef.current.gain.value = reverbMix;
    }
    if (delayGainRef.current) {
      delayGainRef.current.gain.value = delayMix;
    }
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = delayTime;
    }
    if (feedbackGainRef.current) {
      feedbackGainRef.current.gain.value = delayFeedback;
    }
    if (masterFilterRef.current) {
      masterFilterRef.current.frequency.value = filterCutoff;
      masterFilterRef.current.Q.value = filterResonance;
    }
  }, [reverbMix, delayMix, delayTime, delayFeedback, filterCutoff, filterResonance]);

  const connectToEffects = useCallback((source: AudioNode) => {
    if (dryGainRef.current) source.connect(dryGainRef.current);
    if (convolverRef.current) source.connect(convolverRef.current);
    if (delayNodeRef.current) source.connect(delayNodeRef.current);
  }, []);

  const playKick = useCallback((time: number, hard = false) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(hard ? 180 : 150, time);
    osc.frequency.exponentialRampToValueAtTime(hard ? 30 : 40, time + 0.1);
    
    oscGain.gain.setValueAtTime(hard ? 1 : 0.8, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + (hard ? 0.2 : 0.3));
    
    osc.connect(oscGain);
    connectToEffects(oscGain);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }, [connectToEffects]);

  const playHihat = useCallback((time: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const duration = 0.05;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = patternType === "industrial" ? 5000 : 7000;
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(patternType === "industrial" ? 0.2 : 0.15, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
    noise.connect(filter);
    filter.connect(oscGain);
    connectToEffects(oscGain);
    
    noise.start(time);
  }, [patternType, connectToEffects]);

  const playSnare = useCallback((time: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const isIndustrial = patternType === "industrial";
    
    // Noise component
    const bufferSize = ctx.sampleRate * (isIndustrial ? 0.2 : 0.15);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = isIndustrial ? 2000 : 3000;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(isIndustrial ? 0.5 : 0.3, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    connectToEffects(noiseGain);
    
    noise.start(time);

    // Tone component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(isIndustrial ? 250 : 200, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
    
    oscGain.gain.setValueAtTime(isIndustrial ? 0.6 : 0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    osc.connect(oscGain);
    connectToEffects(oscGain);
    
    osc.start(time);
    osc.stop(time + 0.1);
  }, [patternType, connectToEffects]);

  const playBass = useCallback((time: number, note = 55) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const isAcid = patternType === "acid";
    
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(note, time);
    
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    
    if (isAcid) {
      filter.Q.value = 15;
      filter.frequency.setValueAtTime(200, time);
      filter.frequency.exponentialRampToValueAtTime(1500, time + 0.05);
      filter.frequency.exponentialRampToValueAtTime(200, time + 0.2);
    } else {
      filter.frequency.setValueAtTime(400, time);
      filter.frequency.exponentialRampToValueAtTime(100, time + 0.15);
    }
    
    oscGain.gain.setValueAtTime(isAcid ? 0.35 : 0.25, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    osc.connect(filter);
    filter.connect(oscGain);
    connectToEffects(oscGain);
    
    osc.start(time);
    osc.stop(time + 0.25);
  }, [patternType, connectToEffects]);

  const startSequencer = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    let step = 0;
    const stepDuration = (60 / bpm) / 4;

    const scheduleStep = () => {
      const time = ctx.currentTime + 0.05;
      const currentPattern = PATTERNS[patternType];
      
      if (currentPattern.kick[step % 16]) {
        playKick(time, patternType === "industrial");
      }
      if (currentPattern.hihat[step % 16]) {
        playHihat(time);
      }
      if (currentPattern.snare[step % 16]) {
        playSnare(time);
      }
      if (currentPattern.bass[step % 16]) {
        const note = currentPattern.bassNotes?.[step % 16] || 55;
        playBass(time, note);
      }

      setCurrentStep(step % 16);
      step++;

      sequencerRef.current = window.setTimeout(scheduleStep, stepDuration * 1000);
    };

    scheduleStep();
  }, [bpm, patternType, initAudio, playKick, playHihat, playSnare, playBass]);

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
  };

  const changePattern = (newPattern: PatternType) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      stopSequencer();
    }
    setPatternType(newPattern);
    setBpm(PATTERNS[newPattern].bpm);
    setCurrentStep(0);
    if (wasPlaying) {
      setTimeout(() => {
        startSequencer();
        setIsPlaying(true);
      }, 50);
    }
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = isMuted ? 0 : volume;
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

  useEffect(() => {
    if (isPlaying) {
      stopSequencer();
      startSequencer();
    }
  }, [bpm]);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Sync delay time to BPM
  const syncDelayToBpm = () => {
    const quarterNote = 60 / bpm;
    setDelayTime(quarterNote * 0.75); // Dotted eighth
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

      {/* Pattern Selector */}
      <div className="mb-4">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
          Pattern
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

      {/* Step Sequencer Visualization */}
      <div className="relative h-16 mb-4 bg-background/50 rounded overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around px-1 py-2">
          {Array.from({ length: 16 }).map((_, i) => {
            const isActive = i === currentStep && isPlaying;
            const hasKick = pattern.kick[i];
            const hasSnare = pattern.snare[i];
            const hasHihat = pattern.hihat[i];
            const hasBass = pattern.bass[i];
            
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
                  isActive && "ring-2 ring-white ring-offset-1 ring-offset-background"
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
            className="w-24"
          />
          <span className="font-mono text-sm font-bold w-8 text-right">{bpm}</span>
        </div>
      </div>

      {/* Effects Toggle */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between font-mono text-[10px] uppercase tracking-wider h-8"
          onClick={() => setShowEffects(!showEffects)}
        >
          <span className="flex items-center gap-2">
            <Waves className="w-3 h-3" />
            Effects
          </span>
          <span className={cn(
            "transition-transform",
            showEffects && "rotate-180"
          )}>
            ▼
          </span>
        </Button>
      </div>

      {/* Effects Panel */}
      {showEffects && (
        <div className="mb-4 p-3 bg-background/50 rounded-lg border border-border/50 space-y-4">
          {/* Filter Section */}
          <div className="pb-3 border-b border-border/30">
            <p className="font-mono text-[9px] text-primary uppercase tracking-wider mb-3">
              Filter
            </p>
            
            {/* Filter Cutoff */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  Cutoff
                </span>
                <span className="font-mono text-[10px] text-logo-green">
                  {filterCutoff >= 1000 ? `${(filterCutoff / 1000).toFixed(1)}kHz` : `${filterCutoff}Hz`}
                </span>
              </div>
              <Slider
                value={[filterCutoff]}
                min={100}
                max={12000}
                step={50}
                onValueChange={(v) => setFilterCutoff(v[0])}
                className="w-full"
              />
            </div>

            {/* Filter Resonance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  Resonance
                </span>
                <span className="font-mono text-[10px] text-logo-green">
                  {filterResonance.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[filterResonance]}
                min={0.5}
                max={20}
                step={0.5}
                onValueChange={(v) => setFilterResonance(v[0])}
                className="w-full"
              />
            </div>
          </div>

          {/* Reverb */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Reverb
              </span>
              <span className="font-mono text-[10px] text-logo-green">
                {Math.round(reverbMix * 100)}%
              </span>
            </div>
            <Slider
              value={[reverbMix]}
              min={0}
              max={0.6}
              step={0.01}
              onValueChange={(v) => setReverbMix(v[0])}
              className="w-full"
            />
          </div>

          {/* Delay Mix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Delay Mix
              </span>
              <span className="font-mono text-[10px] text-logo-green">
                {Math.round(delayMix * 100)}%
              </span>
            </div>
            <Slider
              value={[delayMix]}
              min={0}
              max={0.5}
              step={0.01}
              onValueChange={(v) => setDelayMix(v[0])}
              className="w-full"
            />
          </div>

          {/* Delay Time */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Delay Time
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 font-mono text-[9px]"
                  onClick={syncDelayToBpm}
                >
                  Sync
                </Button>
                <span className="font-mono text-[10px] text-logo-green w-12 text-right">
                  {Math.round(delayTime * 1000)}ms
                </span>
              </div>
            </div>
            <Slider
              value={[delayTime]}
              min={0.05}
              max={1}
              step={0.01}
              onValueChange={(v) => setDelayTime(v[0])}
              className="w-full"
            />
          </div>

          {/* Delay Feedback */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Feedback
              </span>
              <span className="font-mono text-[10px] text-logo-green">
                {Math.round(delayFeedback * 100)}%
              </span>
            </div>
            <Slider
              value={[delayFeedback]}
              min={0}
              max={0.85}
              step={0.01}
              onValueChange={(v) => setDelayFeedback(v[0])}
              className="w-full"
            />
          </div>
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
